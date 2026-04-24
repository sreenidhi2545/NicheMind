from __future__ import annotations

from typing import Any, Dict, Iterable, List


PLACEHOLDERS = ("...", "n/a", "todo", "example")


def check_response_quality(response: Dict[str, Any]) -> Dict[str, Any]:
    issues: List[str] = []
    checks_passed = 0
    total_checks = 5

    pain_points = _get_pain_points(response)
    if isinstance(pain_points, list) and len(pain_points) >= 3:
        checks_passed += 1
    else:
        issues.append("pain_points must have at least 3 items")

    if _pain_points_valid(pain_points):
        checks_passed += 1
    else:
        issues.append("each pain point must have valid title, description, and severity")

    if _solutions_valid(response, pain_points):
        checks_passed += 1
    else:
        issues.append("solutions must have at least 2 valid items")

    best_opportunity = response.get("best_opportunity")
    if isinstance(best_opportunity, str) and len(best_opportunity.strip()) > 20:
        checks_passed += 1
    else:
        issues.append("best_opportunity must be a non-empty string > 20 chars")

    if not _contains_placeholder(response):
        checks_passed += 1
    else:
        issues.append("response contains placeholder text")

    score = int((checks_passed / total_checks) * 100)
    return {
        "passed": score == 100,
        "score": score,
        "issues": issues,
        "response": response,
    }


def _pain_points_valid(pain_points: Any) -> bool:
    if not isinstance(pain_points, list) or len(pain_points) < 3:
        return False

    for point in pain_points:
        if not isinstance(point, dict):
            return False
        if not _point_has_valid_title(point):
            return False
        if not _point_has_valid_description(point):
            return False
        if not _point_has_valid_severity(point):
            return False

    return True


def _get_pain_points(response: Dict[str, Any]) -> Any:
    return response.get("pain_points") or response.get("top_pain_points")


def _solutions_valid(response: Dict[str, Any], pain_points: Any) -> bool:
    suggested_solutions = response.get("suggested_solutions")
    if isinstance(suggested_solutions, list) and len(suggested_solutions) >= 2:
        return True

    if isinstance(pain_points, list):
        solutions = [point.get("solution") for point in pain_points if isinstance(point, dict)]
        valid = [sol for sol in solutions if isinstance(sol, str) and len(sol.strip()) > 10]
        return len(valid) >= 2

    return False


def _point_has_valid_title(point: Dict[str, Any]) -> bool:
    title = point.get("title") or point.get("pain")
    return isinstance(title, str) and len(title.strip()) > 10


def _point_has_valid_description(point: Dict[str, Any]) -> bool:
    description = point.get("description") or point.get("solution")
    return isinstance(description, str) and len(description.strip()) > 30


def _point_has_valid_severity(point: Dict[str, Any]) -> bool:
    severity = point.get("severity")
    if isinstance(severity, int):
        return 1 <= severity <= 10
    if isinstance(severity, str):
        return severity.strip().lower() in {"high", "medium", "low"}
    return False


def _contains_placeholder(value: Any) -> bool:
    for text in _iter_strings(value):
        lowered = text.lower()
        if any(token in lowered for token in PLACEHOLDERS):
            return True
    return False


def _iter_strings(value: Any) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for item in value.values():
            yield from _iter_strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from _iter_strings(item)
