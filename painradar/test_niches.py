import json
import traceback
from urllib import request


NICHES = ["personal finance", "fitness"]


def main() -> None:
    for niche in NICHES:
        try:
            payload = json.dumps({"niche": niche}).encode("utf-8")
            req = request.Request(
                "http://127.0.0.1:8001/research",
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with request.urlopen(req, timeout=35) as response:
                body = response.read().decode("utf-8")
                data = json.loads(body)
            print("===", niche, "===")
            print(json.dumps(data, indent=2))
        except Exception:
            print("===", niche, "ERROR ===")
            print(traceback.format_exc())


if __name__ == "__main__":
    main()
