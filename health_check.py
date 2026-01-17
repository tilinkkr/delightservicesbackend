"""
System Health Check - Run this before debugging
Tests each layer independently
"""

import sys
import os
from pathlib import Path

print("="*60)
print("🏥 INTELLIFLOW SYSTEM HEALTH CHECK")
print("="*60)

errors = []

# 1. Check Python version
print("\n1️⃣ Python Version:")
print(f"   {sys.version}")
if sys.version_info < (3, 10):
    errors.append("❌ Python 3.10+ required")
else:
    print("   ✅ OK")

# 2. Check project structure
print("\n2️⃣ Project Structure:")
required_files = [
    "app/main.py",
    "app/models.py",
    "app/database.py",
    "app/agents.py",
    "app/rules.py",
    "app/workflow_engine.py",
    "app/automation.py",
    "populate_db.py"
]

for file in required_files:
    if Path(file).exists():
        print(f"   ✅ {file}")
    else:
        print(f"   ❌ {file} MISSING")
        errors.append(f"Missing {file}")

# 3. Check dependencies
print("\n3️⃣ Python Dependencies:")
try:
    import fastapi
    print(f"   ✅ fastapi {fastapi.__version__}")
except ImportError:
    print("   ❌ fastapi not installed")
    errors.append("fastapi missing")

try:
    import sqlmodel
    print(f"   ✅ sqlmodel installed")
except ImportError:
    print("   ❌ sqlmodel not installed")
    errors.append("sqlmodel missing")

try:
    import requests
    print(f"   ✅ requests installed")
except ImportError:
    print("   ❌ requests not installed")
    errors.append("requests missing")

# 4. Check database
print("\n4️⃣ Database:")
if Path("database.db").exists():
    size = Path("database.db").stat().st_size
    print(f"   ✅ database.db exists ({size} bytes)")
    
    # Try to query
    try:
        from sqlmodel import Session, select
        from app.database import engine
        from app.models import Ticket
        
        with Session(engine) as session:
            tickets = session.exec(select(Ticket)).all()
            print(f"   ✅ Database readable: {len(tickets)} tickets")
    except Exception as e:
        print(f"   ❌ Database error: {str(e)}")
        errors.append(f"Database error: {str(e)}")
else:
    print("   ❌ database.db not found")
    errors.append("Database missing - run populate_db.py")

# 5. Check Ollama
print("\n5️⃣ Ollama LLM:")
try:
    import requests
    response = requests.get("http://localhost:11434/api/tags", timeout=2)
    if response.status_code == 200:
        models = response.json().get("models", [])
        print(f"   ✅ Ollama running ({len(models)} models)")
        if not any("mistral" in m.get("name", "") for m in models):
            print("   ⚠️  Mistral model not found - run: ollama pull mistral")
    else:
        print(f"   ❌ Ollama returned {response.status_code}")
        errors.append("Ollama not healthy")
except Exception as e:
    print(f"   ❌ Ollama not reachable: {str(e)}")
    errors.append("Ollama not running - run: ollama serve")

# 6. Check ports
print("\n6️⃣ Port Availability:")
import socket

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

if is_port_in_use(8000):
    print("   ✅ Port 8000 in use (server likely running)")
else:
    print("   ⚠️  Port 8000 available (server not running?)")

if is_port_in_use(11434):
    print("   ✅ Port 11434 in use (Ollama likely running)")
else:
    print("   ⚠️  Port 11434 free (Ollama not running?)")

# Summary
print("\n" + "="*60)
if errors:
    print(f"❌ FOUND {len(errors)} ISSUES:")
    for err in errors:
        print(f"   • {err}")
    print("\n⚠️  FIX THESE BEFORE STARTING SERVER")
else:
    print("✅ ALL SYSTEMS HEALTHY - READY TO START")
print("="*60)
