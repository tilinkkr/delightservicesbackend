"""
Complete IntelliFlow Health Check
Tests: Backend, Database, Ollama, UI files, Endpoints
"""

import sys
import os
import requests
import json
from pathlib import Path
from datetime import datetime

print("="*70)
print("🏥 INTELLIFLOW COPILOT - COMPLETE HEALTH CHECK")
print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("="*70)

errors = []
warnings = []

# ============================================================================
# SECTION 1: ENVIRONMENT
# ============================================================================
print("\n📦 SECTION 1: ENVIRONMENT")
print("-"*70)

print(f"Python: {sys.version.split()[0]}")
if sys.version_info < (3, 10):
    errors.append("Python 3.10+ required")
else:
    print("✅ Python version OK")

print(f"Working Directory: {os.getcwd()}")
if "intelliflow" not in os.getcwd().lower():
    warnings.append("Not in intelliflow-copilot directory?")

# ============================================================================
# SECTION 2: PROJECT STRUCTURE
# ============================================================================
print("\n📁 SECTION 2: PROJECT FILES")
print("-"*70)

critical_files = {
    "Backend": [
        "app/main.py",
        "app/models.py", 
        "app/database.py",
        "app/agents.py",
        "app/rules.py",
        "app/workflow_engine.py",
        "app/automation.py"
    ],
    "Database": ["populate_db.py", "database.db"],
    "Frontend": [
        "static/dashboard-simple.html",
        "static/create.html"
    ]
}

for category, files in critical_files.items():
    print(f"\n{category}:")
    for file in files:
        if Path(file).exists():
            size = Path(file).stat().st_size
            print(f"  ✅ {file} ({size:,} bytes)")
        else:
            print(f"  ❌ {file} MISSING")
            errors.append(f"Missing {file}")

# ============================================================================
# SECTION 3: PYTHON DEPENDENCIES
# ============================================================================
print("\n📚 SECTION 3: DEPENDENCIES")
print("-"*70)

deps = {
    "fastapi": "FastAPI",
    "sqlmodel": "SQLModel",
    "requests": "Requests",
    "reportlab": "ReportLab"
}

for module, name in deps.items():
    try:
        mod = __import__(module)
        version = getattr(mod, "__version__", "unknown")
        print(f"✅ {name}: {version}")
    except ImportError:
        print(f"❌ {name}: NOT INSTALLED")
        errors.append(f"{name} not installed")

# ============================================================================
# SECTION 4: DATABASE HEALTH
# ============================================================================
print("\n💾 SECTION 4: DATABASE")
print("-"*70)

if Path("database.db").exists():
    size = Path("database.db").stat().st_size
    print(f"Database file: {size:,} bytes")
    
    try:
        from sqlmodel import Session, select
        from app.database import engine
        from app.models import Ticket
        
        with Session(engine) as session:
            tickets = session.exec(select(Ticket)).all()
            
            # Check ticket fields
            if tickets:
                t = tickets[0]
                fields = ['id', 'title', 'description', 'status', 'priority', 
                         'category', 'department', 'ai_priority', 'ai_reasoning', 'created_at']
                
                missing = [f for f in fields if not hasattr(t, f)]
                if missing:
                    errors.append(f"Ticket model missing fields: {missing}")
                else:
                    print(f"✅ Ticket schema: All fields present")
            
            # Stats
            analyzed = len([t for t in tickets if t.ai_priority is not None])
            high_pri = len([t for t in tickets if t.priority == "High"])
            
            print(f"✅ Total tickets: {len(tickets)}")
            print(f"   - High priority: {high_pri}")
            print(f"   - AI analyzed: {analyzed}")
            
    except Exception as e:
        print(f"❌ Database error: {str(e)}")
        errors.append(f"Database error: {str(e)}")
else:
    print("❌ database.db NOT FOUND")
    errors.append("Database missing - run: python populate_db.py")

# ============================================================================
# SECTION 5: OLLAMA SERVICE
# ============================================================================
print("\n🤖 SECTION 5: OLLAMA LLM")
print("-"*70)

try:
    response = requests.get("http://localhost:11434/api/tags", timeout=3)
    if response.status_code == 200:
        data = response.json()
        models = data.get("models", [])
        print(f"✅ Ollama running ({len(models)} models)")
        
        # Check for mistral
        mistral_found = False
        for model in models:
            name = model.get("name", "")
            if "mistral" in name.lower():
                print(f"   ✅ Model: {name}")
                mistral_found = True
        
        if not mistral_found:
            warnings.append("Mistral model not found - run: ollama pull mistral")
            print("   ⚠️  Mistral not found")
    else:
        print(f"❌ Ollama returned status {response.status_code}")
        errors.append("Ollama unhealthy")
except requests.exceptions.ConnectionError:
    print("❌ Ollama NOT RUNNING")
    warnings.append("Ollama not running (optional) - run: ollama serve")
except Exception as e:
    print(f"❌ Ollama error: {str(e)}")
    warnings.append(f"Ollama error (optional): {str(e)}")

# ============================================================================
# SECTION 6: BACKEND SERVER
# ============================================================================
print("\n🌐 SECTION 6: BACKEND API")
print("-"*70)

BASE_URL = "http://127.0.0.1:8000"

# Test each endpoint
endpoints = [
    ("GET", "/", "Root endpoint"),
    ("GET", "/tickets", "List tickets"),
    ("GET", "/tickets/1", "Get ticket"),
    ("GET", "/api/stats", "Analytics stats")
]

server_running = False

for method, path, desc in endpoints:
    try:
        if method == "GET":
            r = requests.get(f"{BASE_URL}{path}", timeout=2)
        else:
            r = requests.post(f"{BASE_URL}{path}", timeout=2)
        
        if r.status_code == 200:
            print(f"✅ {desc}: {r.status_code}")
            server_running = True
        elif r.status_code == 404:
            print(f"❌ {desc}: 404 NOT FOUND")
            errors.append(f"Endpoint missing: {path}")
        else:
            print(f"⚠️  {desc}: {r.status_code}")
            warnings.append(f"{path} returned {r.status_code}")
            
    except requests.exceptions.ConnectionError:
        print(f"❌ {desc}: SERVER NOT RESPONDING")
        if not server_running:
            errors.append("Backend not running - run: uvicorn app.main:app --reload")
        break
    except Exception as e:
        print(f"❌ {desc}: {str(e)}")

# Test POST /tickets
if server_running:
    print("\nTesting POST /tickets:")
    try:
        test_ticket = {
            "title": "Health Check Test",
            "description": "Automated test ticket",
            "priority": "Low",
            "status": "New"
        }
        r = requests.post(f"{BASE_URL}/tickets", json=test_ticket, timeout=5)
        if r.status_code == 200:
            data = r.json()
            print(f"✅ Create ticket: SUCCESS (ID: {data.get('id')})")
        else:
            print(f"❌ Create ticket: {r.status_code} - {r.text[:100]}")
            errors.append(f"POST /tickets failed: {r.status_code}")
    except Exception as e:
        print(f"❌ Create ticket: {str(e)}")
        errors.append(f"POST /tickets error: {str(e)}")

# ============================================================================
# FINAL SUMMARY
# ============================================================================
print("\n" + "="*70)
print("📊 HEALTH CHECK SUMMARY")
print("="*70)

if errors:
    print(f"\n❌ CRITICAL ERRORS ({len(errors)}):")
    for i, err in enumerate(errors, 1):
        print(f"   {i}. {err}")
    print("\n⚠️  FIX THESE BEFORE PROCEEDING")
else:
    print("\n✅ NO CRITICAL ERRORS")

if warnings:
    print(f"\n⚠️  WARNINGS ({len(warnings)}):")
    for i, warn in enumerate(warnings, 1):
        print(f"   {i}. {warn}")

if not errors and not warnings:
    print("\n🎉 ALL SYSTEMS HEALTHY - READY FOR DEMO")
elif not errors:
    print("\n✅ SYSTEM FUNCTIONAL - Warnings are minor")
else:
    print("\n❌ SYSTEM NOT READY - Fix errors above")

print("="*70)

# Exit code
sys.exit(1 if errors else 0)
