"""
Quick test to verify search API returns users
"""
import requests

API_URL = "http://localhost:80"

# Test 1: Get all users (no search query)
print("="*50)
print("TEST 1: Search all users")
print("="*50)
resp = requests.get(f"{API_URL}/search/users?limit=5")
if resp.ok:
    data = resp.json()
    print(f"Total users: {data.get('total', 0)}")
    print(f"Users returned: {len(data.get('users', []))}")
    for u in data.get('users', []):
        print(f"  - {u.get('username')}: {u.get('display_name')} (XP: {u.get('xp')})")
else:
    print(f"ERROR: {resp.status_code}")

# Test 2: Search by username
print("\n" + "="*50)
print("TEST 2: Search by 'react'")
print("="*50)
resp = requests.get(f"{API_URL}/search/users?q=react&limit=5")
if resp.ok:
    data = resp.json()
    print(f"Users found: {len(data.get('users', []))}")
    for u in data.get('users', []):
        print(f"  - {u.get('username')}: {u.get('display_name')}")
else:
    print(f"ERROR: {resp.status_code}")

# Test 3: Search by skill
print("\n" + "="*50)
print("TEST 3: Filter by skill 'Python'")
print("="*50)
resp = requests.get(f"{API_URL}/search/users?skill=Python&limit=5")
if resp.ok:
    data = resp.json()
    print(f"Users with Python: {len(data.get('users', []))}")
    for u in data.get('users', []):
        print(f"  - {u.get('username')}: {u.get('display_name')}")
else:
    print(f"ERROR: {resp.status_code}")

# Test 4: Search with sort
print("\n" + "="*50)
print("TEST 4: Sort by XP (highest first)")
print("="*50)
resp = requests.get(f"{API_URL}/search/users?sort=xp_high&limit=5")
if resp.ok:
    data = resp.json()
    print(f"Users returned: {len(data.get('users', []))}")
    for u in data.get('users', []):
        print(f"  - {u.get('username')}: XP = {u.get('xp')}")
else:
    print(f"ERROR: {resp.status_code}")

print("\n" + "="*50)
print("TESTS COMPLETE")
print("="*50)