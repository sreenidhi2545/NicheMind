import concurrent.futures
import logging
import os
import time
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

dotenv_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=dotenv_path)
print("GROQ KEY LOADED:", bool(os.getenv("GROQ_API_KEY")))

from backend.agents.analyser import analyze_niche
from backend.agents.scraper import build_niche_payload
from backend.utils.cache import get_cached_result, save_result
from backend.utils.quality_checker import check_response_quality

app = FastAPI(
    title="NicheMind",
    description="India-first AI business research tool",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("nichemind")

APP_VERSION = "0.1.0"
GROQ_TIMEOUT_SECONDS = 30


class ResearchRequest(BaseModel):
    niche: str


def _map_to_new_shape(data: dict) -> dict:
    if not isinstance(data, dict):
        data = {}

    if "top_pain_points" in data:
        pain_points = []
        for p in data.get("top_pain_points", []):
            sev = str(p.get("severity", "")).lower()
            score = 9.0 if sev == "high" else (7.0 if sev == "medium" else 5.0)
            pain_points.append({
                "title": p.get("pain", "Unknown"),
                "description": p.get("solution", ""),
                "score": score
            })
        
        build_rec_val = data.get("build_recommendation", "")
        build_rec = {"title": "Recommendation", "description": build_rec_val} if isinstance(build_rec_val, str) else build_rec_val

        return {
            "pain_points": pain_points,
            "opportunity": data.get("best_opportunity", ""),
            "build_recommendation": build_rec,
            "overall_score": data.get("overall_score", 8.0),
            "scores": data.get("scores", {
                "pain_intensity": 8.0,
                "market_size": 8.0,
                "competition_gap": 8.0
            }),
            "market_data": data.get("market_data", {
                "tam_estimate": "Calculating...",
                "target_users": "Calculating...",
                "maturity": "Early stage"
            }),
            "competitors": data.get("competitors", {
                "existing_solutions": "Generic global tools not built for India",
                "your_advantage": "India-first, vernacular, affordable",
                "gap_to_fill": "No dominant player in this exact niche yet"
            })
        }
    
    return {
        "pain_points": data.get("pain_points", []),
        "opportunity": data.get("opportunity", ""),
        "build_recommendation": data.get("build_recommendation", {"title": "", "description": ""}),
        "overall_score": data.get("overall_score", 0.0),
        "scores": data.get("scores", {"pain_intensity": 0.0, "market_size": 0.0, "competition_gap": 0.0}),
        "market_data": data.get("market_data", {
            "tam_estimate": "Calculating...",
            "target_users": "Calculating...",
            "maturity": "Early stage"
        }),
        "competitors": data.get("competitors", {
            "existing_solutions": "Generic global tools not built for India",
            "your_advantage": "India-first, vernacular, affordable",
            "gap_to_fill": "No dominant player in this exact niche yet"
        })
    }


@app.get("/")
def root():
    return {"status": "NicheMind backend running"}


@app.post("/research")
def research(request: ResearchRequest):
    start_time = time.perf_counter()
    niche = (request.niche or "").strip()
    cache_key = niche.lower()

    if not niche:
        return _error_response("Niche is required.", "invalid_niche", start_time, status_code=400)

    if len(niche) > 50:
        return _error_response(
            "Niche must be 50 characters or less.",
            "invalid_niche",
            start_time,
            status_code=400,
        )

    logger.info("/research requested for niche='%s'", niche)
    cached = get_cached_result(cache_key)
    if cached:
        logger.info("Cache HIT for niche: %s", cache_key)
        logger.info("Returning cached result")

        cached_result = cached.get("result")
        return _map_to_new_shape(cached_result)

    niche_data = build_niche_payload(niche)
    if not niche_data:
        return _error_response(
            "Invalid niche or no data available. Try another keyword.",
            "invalid_niche",
            start_time,
            status_code=404,
        )

    sources = _extract_sources(niche_data)

    try:
        analysis = _run_analysis_with_timeout(niche_data)
    except concurrent.futures.TimeoutError:
        logger.warning("Groq analysis timed out for niche='%s'", niche)
        return _error_response(
            "Analysis timed out. Please try again in a moment.",
            "timeout",
            start_time,
            sources,
            status_code=504,
        )
    except Exception as exc:
        logger.exception("Groq analysis failed for niche='%s': %s", niche, exc)
        return _error_response(
            "AI analysis unavailable right now. Please try again later.",
            "groq_failure",
            start_time,
            sources,
            status_code=503,
        )

    if isinstance(analysis, dict) and analysis.get("error"):
        logger.warning("Groq returned error for niche='%s': %s", niche, analysis.get("error"))
        return _error_response(
            "AI analysis unavailable right now. Please try again later.",
            "groq_failure",
            start_time,
            sources,
            status_code=503,
        )

    response_time_ms = _response_time_ms(start_time)
    quality = check_response_quality(analysis) if isinstance(analysis, dict) else None
    quality_score = quality.get("score", 0) if isinstance(quality, dict) else 0

    if quality_score < 60:
        logger.warning("Low quality response for niche: %s - score: %s", niche, quality_score)

    save_result(niche_data.get("niche", cache_key), analysis, sources)

    return _map_to_new_shape(analysis)


@app.get("/health")
def health():
    return {"status": "ok"}


def _run_analysis_with_timeout(niche_data: dict):
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(analyze_niche, niche_data)
        return future.result(timeout=GROQ_TIMEOUT_SECONDS)


def _extract_sources(niche_data: dict):
    posts = []
    if isinstance(niche_data, dict):
        posts = niche_data.get("reddit", []) or []

    if not posts:
        return ["mock"]

    source_apis = {
        post.get("source_api")
        for post in posts
        if isinstance(post, dict) and post.get("source_api")
    }
    return sorted(source_apis) if source_apis else ["mock"]


def _response_time_ms(start_time: float) -> int:
    return int((time.perf_counter() - start_time) * 1000)


def _error_response(
    message: str,
    code: str,
    start_time: float,
    sources=None,
    status_code: int = 400,
):
    response_time_ms = _response_time_ms(start_time)
    payload = {
        "status": "error",
        "message": message,
        "error_code": code,
        "response_time_ms": response_time_ms,
        "data": None,
        "sources": sources or [],
        "cached": False,
        "powered_by": "NicheMind AI",
    }
    return JSONResponse(status_code=status_code, content=payload)
