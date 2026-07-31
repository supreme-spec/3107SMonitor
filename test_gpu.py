import requests, json

# Test 1: Face engine status (Node.js)
print("=== Test 1: Face Engine Status (Node.js) ===")
r = requests.get("http://localhost:3000/api/face-engine/status", timeout=10)
print(f"Status: {r.status_code}")
data = r.json()
print(f"Initialized: {data['initialized']}")
print(f"Total descriptors: {data['totalDescriptors']}")
print(f"Unique persons: {data['uniquePersons']}")
print(f"Python server healthy: {data['pythonServer']['healthy']}")
print()

# Test 2: Health check
print("=== Test 2: Health ===")
r = requests.get("http://localhost:3000/api/health", timeout=10)
print(f"Status: {r.status_code}")
h = r.json()
print(f"AI ready: {h['ai_ready']}")
print(f"GPU enabled: {h['gpu_enabled']}")
print(f"GPU detected: {h['gpu_detected']}")
print(f"Recognition provider: {h['recognition_provider']}")
print(f"Face engine provider: {h['face_engine']['provider']}")
print()

# Test 3: Python face server status
print("=== Test 3: Python Face Server Status ===")
r = requests.get("http://localhost:8001/status", timeout=10)
print(f"Status: {r.status_code}")
p = r.json()
print(f"Provider: {p['provider']}")
print(f"FAISS vectors: {p['faiss_vectors']}")
print()

# Test 4: Cameras
print("=== Test 4: Cameras ===")
r = requests.get("http://localhost:3000/api/cameras/", timeout=10)
print(f"Status: {r.status_code}")
cameras = r.json()
print(f"Cameras: {len(cameras)} total")
for c in cameras:
    print(f"  - Camera {c.get('id')}: {c.get('name')} - active={c.get('is_active')}")
