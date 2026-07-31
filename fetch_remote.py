import urllib.request, json, sys

def fetch_file(repo, path, branch="main"):
    url = f"https://api.github.com/repos/{repo}/contents/{path}?ref={branch}"
    req = urllib.request.Request(url, headers={"Accept": "application/vnd.github.v3.raw"})
    resp = urllib.request.urlopen(req, timeout=15)
    return resp.read().decode("utf-8", errors="replace")

def find_function_lines(content, func_name):
    lines = content.split("\n")
    results = []
    for i, line in enumerate(lines):
        if f"export async function {func_name}" in line or f"async function {func_name}" in line:
            results.append(i + 1)
    return results

def print_function(content, func_name, start_line, num_lines=100):
    lines = content.split("\n")
    end_line = min(start_line + num_lines, len(lines))
    print(f"=== {func_name} (lines {start_line}-{end_line}) ===")
    for i in range(start_line - 1, end_line):
        print(f"{i+1}: {lines[i]}")
    print()

repo = "supreme-spec/krakeninwork"

# Fetch face-engine.ts
print("Fetching face-engine.ts from krakeninwork...")
fe_remote = fetch_file(repo, "face-engine.ts")
fe_lines = fe_remote.split("\n")
print(f"face-engine.ts: {len(fe_lines)} lines")

# Find and print key functions
for func in ["getEmbeddingFromServer", "extractEmbedding", "registerPerson", "registerPersonFromDescriptor", "addEmbeddingToPerson", "enrollPhotoWithGate"]:
    locations = find_function_lines(fe_remote, func)
    if locations:
        for loc in locations:
            print_function(fe_remote, func, loc, 80)
    else:
        print(f"{func}: NOT FOUND\n")

# Fetch server.ts
print("Fetching server.ts from krakeninwork...")
sv_remote = fetch_file(repo, "server.ts")
sv_lines = sv_remote.split("\n")
print(f"server.ts: {len(sv_lines)} lines")

# Find camera-related functions
for func in ["startCameraPipeline", "cameraStreams", "cameraFrames", "WebSocket.*camera", "handleCamera", "webcam", "snapshotCamera"]:
    locations = find_function_lines(sv_remote, func)
    if locations:
        for loc in locations:
            print_function(sv_remote, func, loc, 60)
    else:
        pass  # skip not found

# Fetch face_server.py
print("Fetching face_server.py from krakeninwork...")
fs_remote = fetch_file(repo, "face_server.py")
fs_lines = fs_remote.split("\n")
print(f"face_server.py: {len(fs_lines)} lines")

# Find key endpoints
for func in ["get_embedding", "recognize", "detect_faces"]:
    locations = find_function_lines(fs_remote, func)
    if locations:
        for loc in locations:
            print_function(fs_remote, func, loc, 60)
    else:
        pass