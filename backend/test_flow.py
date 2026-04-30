import httpx

client = httpx.Client(base_url="http://localhost:80")

print("1. Sign up")
resp = client.post("/auth/register", json={
    "email": "test2@example.com",
    "password": "password123",
    "username": "test_user_abc2",
    "display_name": "Test User"
})
print(resp.status_code, resp.text)
if resp.status_code in [200, 201]:
    token = resp.json()["access_token"]
else:
    # try login
    print("Trying login...")
    resp = client.post("/auth/login", json={
        "email": "test2@example.com",
        "password": "password123"
    })
    print(resp.status_code, resp.text)
    token = resp.json()["access_token"]

client.headers["Authorization"] = f"Bearer {token}"

print("\n2. Get Profile")
resp = client.get("/users/me")
print(resp.status_code, resp.text)

print("\n3. Edit Profile (Experience)")
resp = client.patch("/users/me", json={
    "experience_data": [
        {"title": "Software Engineer", "company": "Test Co", "period": "2020-2023", "description": "Built things."}
    ]
})
print(resp.status_code, resp.text)

print("\n4. Discover Users")
resp = client.get("/search/users")
print(resp.status_code, resp.text)
