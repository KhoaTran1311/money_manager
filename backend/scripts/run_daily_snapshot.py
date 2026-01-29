import json
import os
import sys
import urllib.error
import urllib.request


def main():
    url = os.environ.get(
        "SNAPSHOT_URL", "http://localhost:8000/api/long-term/prices/snapshot/"
    )
    token = os.environ.get("SNAPSHOT_TOKEN", "").strip()

    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    request = urllib.request.Request(url, method="POST", headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = response.read().decode("utf-8")
            try:
                data = json.loads(payload)
            except json.JSONDecodeError:
                data = payload
            print(data)
            return 0
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8") if exc.fp else ""
        print(f"Snapshot failed: {exc.code} {exc.reason}")
        if error_body:
            print(error_body)
        return 1
    except urllib.error.URLError as exc:
        print(f"Snapshot failed: {exc.reason}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
