import httpx

BASE = "http://localhost:80"
client = httpx.Client(base_url=BASE, timeout=15)

PASS = "✅"
FAIL = "❌"

# 1. Login
print("=== NEXORA API Flow Verification ===\n")
print("[1] Login")
r = client.post("/auth/login", json={"email": "test2@example.com", "password": "password123"})
if r.status_code == 200:
    data = r.json()
    token = data["access_token"]
    print(f"  {PASS} Status {r.status_code} | user_id={data.get('user_id')}")
else:
    print(f"  {FAIL} Status {r.status_code}: {r.text[:200]}")
    exit(1)

client.headers["Authorization"] = "Bearer " + token

# 2. GET /users/me
print("\n[2] GET /users/me")
r = client.get("/users/me")
if r.status_code == 200:
    me = r.json()
    print(f"  {PASS} Status 200")
    print(f"     username: {me.get('username')}")
    print(f"     display_name: {me.get('display_name')}")
    print(f"     created_at: {me.get('created_at')}")
    print(f"     level: {me.get('level')}, xp: {me.get('xp')}")
else:
    print(f"  {FAIL} Status {r.status_code}: {r.text[:300]}")

# 3. PATCH /users/me
print("\n[3] PATCH /users/me (bio + experience_data)")
payload = {
    "bio": "Backend developer @ Nexora",
    "experience_data": [
        {"title": "Software Engineer", "company": "Acme Corp", "period": "2020-2024", "description": "Built APIs"}
    ]
}
r = client.patch("/users/me", json=payload)
if r.status_code == 200:
    patched = r.json()
    print(f"  {PASS} Status 200")
    print(f"     bio: {patched.get('bio')}")
    exp = patched.get("experience_data", [])
    print(f"     experience_data: {len(exp)} item(s)")
else:
    print(f"  {FAIL} Status {r.status_code}: {r.text[:300]}")

# 4. GET /users/me again to confirm persistence
print("\n[4] GET /users/me (verify patch persisted)")
r = client.get("/users/me")
if r.status_code == 200:
    me2 = r.json()
    bio_ok = me2.get("bio") == "Backend developer @ Nexora"
    print(f"  {PASS if bio_ok else FAIL} Bio persisted: {me2.get('bio')}")
    exp = me2.get("experience_data", [])
    print(f"  {PASS if exp else FAIL} experience_data: {exp}")
else:
    print(f"  {FAIL} Status {r.status_code}: {r.text[:200]}")

# 5. Discover
print("\n[5] GET /search/users (Discover)")
r = client.get("/search/users?limit=5")
if r.status_code == 200:
    data = r.json()
    users = data.get("users", [])
    print(f"  {PASS} Status 200 | {len(users)} users returned")
    for u in users[:3]:
        print(f"     - {u.get('username')} | skills: {len(u.get('skills', []))}")
else:
    print(f"  {FAIL} Status {r.status_code}: {r.text[:200]}")

print("\n=== Done ===")
client.close()
