import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests


API_URL = "http://localhost:8000/research"
REQUEST_TIMEOUT_SECONDS = 120
REQUEST_DELAY_SECONDS = 2
SLOW_THRESHOLD_MS = 15000
LOW_QUALITY_THRESHOLD = 60
OUTPUT_PATH = Path(__file__).resolve().with_name("test_niches_output.json")
NICHES = [
    "yoga",
    "fitness",
    "edtech india",
    "home decor",
    "mental health india",
    "food delivery india",
    "personal finance india",
    "vernacular content creator",
    "electric vehicle india",
    "women safety app india",
]


def _truncate_text(value: Any, limit: int = 100) -> str:
    text = str(value or "").strip()
    return text[:limit]


def _build_error_result(niche: str, error_code: str, response_time_ms: int, message: str) -> dict[str, Any]:
    return {
        "niche": niche,
        "status": "error",
        "response_time_ms": response_time_ms,
        "cached": False,
        "sources": [],
        "quality_score": 0,
        "best_opportunity": "",
        "error_code": error_code,
        "message": message,
        "flags": ["FAILED"],
    }


def _collect_flags(result: dict[str, Any]) -> list[str]:
    flags = []
    if result.get("status") != "success":
        flags.append("FAILED")
    if result.get("status") == "success" and int(result.get("quality_score") or 0) < LOW_QUALITY_THRESHOLD:
        flags.append("LOW_QUALITY")
    if not result.get("cached") and int(result.get("response_time_ms") or 0) > SLOW_THRESHOLD_MS:
        flags.append("SLOW")
    return flags


def _request_niche(niche: str) -> dict[str, Any]:
    start = time.perf_counter()
    try:
        response = requests.post(
            API_URL,
            json={"niche": niche},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException as exc:
        elapsed_ms = int((time.perf_counter() - start) * 1000)
        return _build_error_result(niche, "request_failed", elapsed_ms, str(exc))

    elapsed_ms = int((time.perf_counter() - start) * 1000)

    try:
        payload = response.json()
    except ValueError:
        payload = {}

    status = str(payload.get("status") or ("success" if response.ok else "error"))
    result = {
        "niche": niche,
        "status": status,
        "response_time_ms": int(payload.get("response_time_ms") or elapsed_ms),
        "cached": bool(payload.get("cached", False)),
        "sources": payload.get("sources") if isinstance(payload.get("sources"), list) else [],
        "quality_score": int(payload.get("quality_score") or 0),
        "best_opportunity": _truncate_text((payload.get("data") or {}).get("best_opportunity", "")),
        "error_code": payload.get("error_code"),
        "message": payload.get("message", ""),
    }
    result["flags"] = _collect_flags(result)
    return result


def _print_progress(index: int, total: int, result: dict[str, Any]) -> None:
    status = result.get("status", "error")
    response_time_ms = int(result.get("response_time_ms") or 0)
    cached = bool(result.get("cached", False))
    quality_score = int(result.get("quality_score") or 0)
    print(
        f"[{index}/{total}] {result['niche']} -> {status} | "
        f"{response_time_ms}ms | cached:{cached} | score:{quality_score}",
        flush=True,
    )


def _average(values: list[int]) -> int:
    return int(sum(values) / len(values)) if values else 0


def _label(preferred: str, fallback: str) -> str:
    encoding = getattr(sys.stdout, "encoding", None) or "utf-8"
    try:
        preferred.encode(encoding)
        return preferred
    except UnicodeEncodeError:
        return fallback


def _build_summary(results: list[dict[str, Any]]) -> dict[str, Any]:
    passed = sum(1 for item in results if item.get("status") == "success")
    failed = len(results) - passed
    fresh_times = [
        int(item.get("response_time_ms") or 0)
        for item in results
        if item.get("status") == "success" and not item.get("cached")
    ]
    cached_times = [
        int(item.get("response_time_ms") or 0)
        for item in results
        if item.get("status") == "success" and item.get("cached")
    ]
    quality_scores = [
        int(item.get("quality_score") or 0)
        for item in results
        if item.get("status") == "success"
    ]
    sources_seen = sorted(
        {
            source
            for item in results
            for source in (item.get("sources") or [])
            if isinstance(source, str) and source
        }
    )
    return {
        "passed": passed,
        "failed": failed,
        "avg_fresh_ms": _average(fresh_times),
        "avg_cached_ms": _average(cached_times),
        "avg_quality": _average(quality_scores),
        "sources_seen": sources_seen,
    }


def _save_output(summary: dict[str, Any], results: list[dict[str, Any]]) -> None:
    payload = {
        "run_date": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "passed": summary["passed"],
            "failed": summary["failed"],
            "avg_fresh_ms": summary["avg_fresh_ms"],
            "avg_cached_ms": summary["avg_cached_ms"],
            "avg_quality": summary["avg_quality"],
        },
        "results": results,
    }
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def _print_summary(summary: dict[str, Any], results: list[dict[str, Any]]) -> None:
    print(f"{_label('✅', '[PASS]')} Passed: {summary['passed']}/10")
    print(f"{_label('❌', '[FAIL]')} Failed: {summary['failed']}/10")
    print(f"{_label('⚡', '[TIME]')} Avg response time (fresh): {summary['avg_fresh_ms']}ms")
    print(f"{_label('⚡', '[TIME]')} Avg response time (cached): {summary['avg_cached_ms']}ms")
    print(f"{_label('📊', '[QUALITY]')} Avg quality score: {summary['avg_quality']}")
    print(f"{_label('🔌', '[SOURCES]')} Sources seen: {summary['sources_seen']}")

    flagged = [item for item in results if item.get("flags")]
    if not flagged:
        print("Flags: none")
        return

    print("Flags:")
    for item in flagged:
        print(
            f"- {item['niche']}: {', '.join(item['flags'])} "
            f"(status={item['status']}, time={item['response_time_ms']}ms, score={item['quality_score']})"
        )


def main() -> None:
    results = []
    total = len(NICHES)

    for index, niche in enumerate(NICHES, start=1):
        result = _request_niche(niche)
        results.append(result)
        _print_progress(index, total, result)
        if index < total:
            time.sleep(REQUEST_DELAY_SECONDS)

    summary = _build_summary(results)
    _save_output(summary, results)
    _print_summary(summary, results)
    print(f"Saved report to {OUTPUT_PATH}", flush=True)


if __name__ == "__main__":
    main()
