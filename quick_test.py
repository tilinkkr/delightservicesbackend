"""Quick isolated test of the agents"""
import sys
sys.path.insert(0, '.')

print("="*70)
print("QUICK AGENT TEST")
print("="*70)

# Test 1: Import check
print("\n[1] Testing imports...")
try:
    from app.agents import triage_agent, compliance_agent, risk_agent
    print("✅ Agents imported successfully")
except Exception as e:
    print(f"❌ Import failed: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# Test 2: Call triage agent directly
print("\n[2] Testing Triage Agent...")
try:
    result = triage_agent(
        title="Server crash urgent",
        description="Production server down affecting 500 users"
    )
    print(f"✅ Triage Result:")
    print(f"   Category: {result.get('category')}")
    print(f"   Priority: {result.get('priority')}")
    print(f"   Department: {result.get('department')}")
    print(f"   Reasoning: {result.get('reasoning')[:80]}...")
except Exception as e:
    print(f"❌ Triage failed: {e}")
    import traceback
    traceback.print_exc()

# Test 3: Compliance
print("\n[3] Testing Compliance Agent...")
try:
    result = compliance_agent(
        title="Server crash",
        description="Production issue",
        category="Technical"
    )
    print(f"✅ Compliance Result:")
    print(f"   Status: {result.get('status')}")
    print(f"   Recommendation: {result.get('recommendation')}")
except Exception as e:
    print(f"❌ Compliance failed: {e}")
    import traceback
    traceback.print_exc()

# Test 4: Risk
print("\n[4] Testing Risk Agent...")
try:
    result = risk_agent(
        title="Server crash",
        description="Production server down",
        priority="High"
    )
    print(f"✅ Risk Result:")
    print(f"   Score: {result.get('risk_score')}")
    print(f"   Level: {result.get('risk_level')}")
    print(f"   Impact: {result.get('impact_areas')}")
except Exception as e:
    print(f"❌ Risk failed: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*70)
print("TEST COMPLETE")
print("="*70)
