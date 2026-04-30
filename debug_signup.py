import requests
import json

url = "http://localhost:80/auth/signup"
payload = {
    "username": "testuser_debug_v10",
    "email": "debug_v10@example.com",
    "password": "password123",
    "display_name": "Debug User V10"
}
headers = {'Content-Type': 'application/json'}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
