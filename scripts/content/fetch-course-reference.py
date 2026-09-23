"""Download only public teaching-resource JSON URLs declared in the supplied archive.

Usage: python3 scripts/content/fetch-course-reference.py extracted.json output-directory
Raw reference content is for inspection, not import into our curriculum.
"""

import concurrent.futures
import hashlib
import json
import pathlib
import sys
import urllib.request
from collections import Counter

course = json.loads(pathlib.Path(sys.argv[1]).read_text())["currentCourse"]
destination = pathlib.Path(sys.argv[2])
destination.mkdir(parents=True, exist_ok=True)
references = []


def add(name, kind, url):
    if url:
        references.append({"name": name, "kind": kind, "url": url})


for section in course["pathSectioned"]:
    for unit in section["units"]:
        add(f"unit-{unit['unitIndex'] + 1:03}", "guidebook", (unit.get("guidebook") or {}).get("url"))
    for kind, url in (section.get("summary") or {}).items():
        add(f"section-{section['index'] + 1}-{kind}", kind, url)
for row in course["skills"]:
    for skill in row:
        add(f"skill-{skill['id']}", "skill-explanation", (skill.get("explanation") or {}).get("url"))


def fetch(reference):
    path = destination / (reference["name"] + ".json")
    try:
        if path.exists():
            data = path.read_bytes()
        else:
            request = urllib.request.Request(reference["url"], headers={"User-Agent": "Curriculum-reference-audit/1.0"})
            with urllib.request.urlopen(request, timeout=25) as response:
                data = response.read(2_000_001)
            if len(data) > 2_000_000:
                raise ValueError("Resource exceeded 2 MB limit")
        json.loads(data)
        path.write_bytes(data)
        return {**reference, "status": "ok", "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    except Exception as error:
        return {**reference, "status": "failed", "error": str(error)}


results = []
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for result in pool.map(fetch, references):
        results.append(result)
        if len(results) % 40 == 0:
            print(f"Inspected {len(results)}/{len(references)} resources", flush=True)
(destination / "manifest.json").write_text(json.dumps(results, indent=2) + "\n")
print(json.dumps(dict(Counter((r["kind"] + ":" + r["status"]) for r in results)), indent=2), flush=True)
