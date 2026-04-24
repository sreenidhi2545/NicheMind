import logging
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

try:
    from supabase import Client, create_client
    from supabase.client import ClientOptions
except ImportError:
    Client = Any  # type: ignore[assignment]
    ClientOptions = None
    create_client = None


dotenv_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=dotenv_path)

logger = logging.getLogger("nichemind")

CACHE_TABLE = "niche_cache"
CACHE_TTL_HOURS = 24
_supabase_client: Client | None = None
_supabase_client_initialized = False


def _normalize_niche(niche: str) -> str:
    return (niche or "").strip().lower()


def _is_missing_supabase_config(url: str, key: str) -> bool:
    return not url or not key or url == "your_project_url" or key == "your_anon_key"


def _get_supabase_client() -> Client | None:
    global _supabase_client, _supabase_client_initialized

    if _supabase_client_initialized:
        return _supabase_client

    _supabase_client_initialized = True

    if create_client is None or ClientOptions is None:
        logger.warning("Supabase package unavailable; remote cache disabled.")
        return None

    supabase_url = (os.getenv("SUPABASE_URL") or "").strip()
    supabase_key = (os.getenv("SUPABASE_KEY") or "").strip()
    if _is_missing_supabase_config(supabase_url, supabase_key):
        return None

    try:
        _supabase_client = create_client(
            supabase_url,
            supabase_key,
            options=ClientOptions(
                auto_refresh_token=False,
                persist_session=False,
                postgrest_client_timeout=10,
            ),
        )
    except Exception as exc:
        logger.warning("Supabase client initialization failed: %s", exc)
        _supabase_client = None

    return _supabase_client


def get_cached_result(niche: str) -> dict | None:
    client = _get_supabase_client()
    if client is None:
        return None

    cache_key = _normalize_niche(niche)
    cutoff = datetime.now(timezone.utc) - timedelta(hours=CACHE_TTL_HOURS)

    try:
        response = (
            client.table(CACHE_TABLE)
            .select("result, sources, created_at")
            .eq("niche", cache_key)
            .gte("created_at", cutoff.isoformat())
            .maybe_single()
            .execute()
        )
        row = getattr(response, "data", None)
        if not isinstance(row, dict):
            return None

        result = row.get("result")
        if not isinstance(result, dict):
            return None

        sources = row.get("sources")
        if not isinstance(sources, list):
            sources = []

        return {
            "result": result,
            "sources": sources,
            "cached": True,
            "created_at": row.get("created_at"),
        }
    except Exception as exc:
        logger.warning("Supabase cache read failed for niche='%s': %s", cache_key, exc)
        return None


def save_result(niche: str, result: dict, sources: list[str]) -> None:
    client = _get_supabase_client()
    if client is None or not isinstance(result, dict):
        return

    cache_key = _normalize_niche(niche)
    payload = {
        "niche": cache_key,
        "result": result,
        "sources": list(sources or []),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        client.table(CACHE_TABLE).upsert(payload, on_conflict="niche").execute()
    except Exception as exc:
        logger.warning("Supabase cache write failed for niche='%s': %s", cache_key, exc)


# Local JSON cache fallback kept here as a disabled reference.
# from pathlib import Path
# import json
#
# _LOCAL_CACHE_PATH = Path(__file__).resolve().parents[1] / "cache.json"
#
# def get_cached_result(niche: str) -> dict | None:
#     cache_key = _normalize_niche(niche)
#     if not _LOCAL_CACHE_PATH.exists():
#         return None
#     payload = json.loads(_LOCAL_CACHE_PATH.read_text(encoding="utf-8"))
#     row = payload.get(cache_key)
#     if not row:
#         return None
#     return {"result": row.get("result"), "sources": row.get("sources", []), "cached": True}
#
# def save_result(niche: str, result: dict, sources: list[str]) -> None:
#     cache_key = _normalize_niche(niche)
#     payload = {}
#     if _LOCAL_CACHE_PATH.exists():
#         payload = json.loads(_LOCAL_CACHE_PATH.read_text(encoding="utf-8"))
#     payload[cache_key] = {"result": result, "sources": list(sources or [])}
#     _LOCAL_CACHE_PATH.write_text(json.dumps(payload), encoding="utf-8")
