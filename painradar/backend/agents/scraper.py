import json
import logging
import os
from concurrent.futures import ThreadPoolExecutor
from difflib import get_close_matches
from pathlib import Path

import requests
from dotenv import load_dotenv

try:
	from firecrawl import FirecrawlApp
except ImportError:
	FirecrawlApp = None

load_dotenv()
logger = logging.getLogger("nichemind")

ARCTIC_SHIFT_URL = "https://arctic-shift.photon-reddit.com/api/posts/search"
DUCKDUCKGO_URL = "https://api.duckduckgo.com/"
YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"
ARCTIC_SHIFT_LIMIT = 10
ARCTIC_SHIFT_MIN_RESULTS = 5
YOUTUBE_MAX_RESULTS = 10
YOUTUBE_TOP_RESULTS = 5
FIRECRAWL_TOP_RESULTS = 5
FIRECRAWL_MAX_URLS = 2
FIRECRAWL_LINE_LIMIT = 10
FIRECRAWL_TIMEOUT_SECONDS = 15
FIRECRAWL_TIMEOUT_MS = FIRECRAWL_TIMEOUT_SECONDS * 1000
REQUEST_TIMEOUT_SECONDS = 10
TARGET_SUBREDDITS = ["{niche}", "india", "entrepreneur"]
YOUTUBE_PAIN_KEYWORDS = ["problem", "issue", "struggle", "fail", "worst", "mistake", "fix"]
YOUTUBE_NEWS_CHANNELS = ["ndtv", "times now", "india today"]
FIRECRAWL_PAIN_KEYWORDS = [
	"problem",
	"issue",
	"struggle",
	"can't",
	"worst",
	"fail",
	"difficult",
	"expensive",
	"no solution",
	"help",
]


def _load_mock_data():
	mock_path = Path(__file__).resolve().parents[1] / "mock" / "mock_data.json"
	with mock_path.open("r", encoding="utf-8") as handle:
		payload = json.load(handle)
	return payload.get("niches", {})


def _normalize_niche(niche: str) -> str:
	return niche.strip().lower()


def _use_mock() -> bool:
	value = os.getenv("USE_MOCK", "false").strip().lower()
	return value in {"1", "true", "yes", "y"}


def _parse_int(value) -> int:
	try:
		return int(value)
	except (TypeError, ValueError):
		return 0


def _extract_mock_reddit(niche_data: dict | None) -> list[dict]:
	if not niche_data:
		return []

	reddit_items = niche_data.get("reddit", []) or []
	results = []
	for item in reddit_items:
		subreddit = (item.get("subreddit") or "").strip()
		if subreddit and not subreddit.startswith("r/"):
			subreddit = f"r/{subreddit}"
		body = (item.get("body") or "").strip()
		if body:
			body = body[:300]
		results.append(
			{
				"title": (item.get("title") or "").strip(),
				"body": body,
				"score": _parse_int(item.get("upvotes")),
				"source": subreddit or "reddit",
				"source_api": "mock",
			}
		)
	return results


def scrape_mock(niche: str):
	if not niche:
		return None

	niches = _load_mock_data()
	if not niches:
		return None

	normalized = _normalize_niche(niche)
	keys = list(niches.keys())

	if normalized in niches:
		return {
			"niche": normalized,
			"reddit": _extract_mock_reddit(niches[normalized]),
		}

	closest = get_close_matches(normalized, keys, n=1, cutoff=0.6)
	if closest:
		match = closest[0]
		return {
			"niche": match,
			"reddit": _extract_mock_reddit(niches[match]),
		}

	return None


def _request_json(url: str, params: dict, label: str) -> dict:
	safe_params = dict(params)
	for secret_key in ("key", "api_key", "token", "access_token"):
		if secret_key in safe_params and safe_params[secret_key]:
			safe_params[secret_key] = "***redacted***"
	print(f"Trying {label}...", flush=True)
	print(f"{label} URL: {url} params={safe_params}", flush=True)
	response = requests.get(
		url,
		params=params,
		headers={"User-Agent": "NicheMind/1.0"},
		timeout=REQUEST_TIMEOUT_SECONDS,
	)
	print(f"{label} status:", response.status_code, flush=True)
	print(response.text[:200], flush=True)
	response.raise_for_status()
	return response.json()


def _extract_arctic_posts(payload: dict | list) -> list[dict]:
	if isinstance(payload, list):
		posts = payload
	elif isinstance(payload, dict):
		posts = (
			payload.get("posts")
			or payload.get("data")
			or payload.get("children")
			or payload.get("results")
			or []
		)
	else:
		posts = []

	results = []
	for item in posts:
		title = (item.get("title") or "").strip()
		body = (item.get("selftext") or "").strip()
		if body:
			body = body[:300]
		subreddit = (item.get("subreddit") or "").strip()
		if subreddit and not subreddit.startswith("r/"):
			subreddit = f"r/{subreddit}"
		results.append(
			{
				"title": title,
				"body": body,
				"score": _parse_int(item.get("score")),
				"source": subreddit or "reddit",
				"source_api": "arctic_shift",
			}
		)
	return results


def _fetch_arctic_shift(niche: str) -> list[dict]:
	normalized_niche = _normalize_niche(niche)
	results = []
	for subreddit in TARGET_SUBREDDITS:
		resolved = subreddit.format(niche=normalized_niche)
		params = {
			"query": normalized_niche,
			"subreddit": resolved,
			"limit": ARCTIC_SHIFT_LIMIT,
		}
		payload = _request_json(ARCTIC_SHIFT_URL, params, "Arctic Shift")
		results.extend(_extract_arctic_posts(payload))

	seen = set()
	deduped = []
	for item in results:
		key = (item.get("title"), item.get("body"), item.get("source"))
		if key in seen:
			continue
		seen.add(key)
		deduped.append(item)
	return deduped


def _extract_duckduckgo_topics(related_topics: list) -> list[dict]:
	results = []
	for item in related_topics:
		if isinstance(item, dict) and item.get("Topics"):
			continue
		text = (item.get("Text") or "").strip() if isinstance(item, dict) else ""
		if not text:
			continue
		body = text[:300]
		results.append(
			{
				"title": text,
				"body": body,
				"score": 0,
				"source": (item.get("FirstURL") or "").strip(),
				"source_api": "duckduckgo",
			}
		)
	return results


def _fetch_duckduckgo(niche: str) -> list[dict]:
	query = _normalize_niche(niche)
	params = {"q": query, "format": "json", "no_html": 1}
	payload = _request_json(DUCKDUCKGO_URL, params, "DuckDuckGo")
	related_topics = payload.get("RelatedTopics", []) if isinstance(payload, dict) else []
	print("DuckDuckGo RelatedTopics count:", len(related_topics), flush=True)
	return _extract_duckduckgo_topics(related_topics)


def _fetch_arctic_shift_safe(niche: str) -> list[dict]:
	try:
		return _fetch_arctic_shift(niche)
	except Exception as exc:
		logger.warning("Arctic Shift failed for niche='%s': %s", niche, exc)
		return []


def _score_youtube_video(video: dict) -> int:
	title = (video.get("title") or "").lower()
	channel = (video.get("channelTitle") or "").lower()
	score = _parse_int(video.get("viewCount")) // 1000
	if any(keyword in title for keyword in YOUTUBE_PAIN_KEYWORDS):
		score += 50
	if any(news_channel in channel for news_channel in YOUTUBE_NEWS_CHANNELS):
		score += 30
	return score


def _normalize_youtube_posts(search_items: list[dict], statistics_by_id: dict[str, dict]) -> list[dict]:
	results = []
	for item in search_items:
		if not isinstance(item, dict):
			continue
		video_id = ((item.get("id") or {}).get("videoId") or "").strip()
		snippet = item.get("snippet") or {}
		if not video_id:
			continue
		stats = statistics_by_id.get(video_id, {})
		video = {
			"videoId": video_id,
			"title": (snippet.get("title") or "").strip(),
			"description": (snippet.get("description") or "").strip(),
			"channelTitle": (snippet.get("channelTitle") or "").strip(),
			"publishedAt": (snippet.get("publishedAt") or "").strip(),
			"viewCount": _parse_int(stats.get("viewCount")),
			"likeCount": _parse_int(stats.get("likeCount")),
			"commentCount": _parse_int(stats.get("commentCount")),
		}
		results.append(
			{
				"title": video["title"],
				"body": video["description"][:300],
				"score": _score_youtube_video(video),
				"source": f"https://youtube.com/watch?v={video_id}",
				"source_api": "youtube",
			}
		)
	return results


def fetch_youtube_signals(niche: str) -> list[dict]:
	api_key = (os.getenv("YOUTUBE_API_KEY") or "").strip()
	if not api_key or api_key == "your_key_here":
		return []

	search_params = {
		"q": f"{_normalize_niche(niche)} problems india",
		"part": "snippet",
		"type": "video",
		"maxResults": YOUTUBE_MAX_RESULTS,
		"regionCode": "IN",
		"relevanceLanguage": "en",
		"key": api_key,
	}
	search_payload = _request_json(YOUTUBE_SEARCH_URL, search_params, "YouTube search")
	search_items = search_payload.get("items", []) if isinstance(search_payload, dict) else []
	video_ids = [
		((item.get("id") or {}).get("videoId") or "").strip()
		for item in search_items
		if isinstance(item, dict)
	]
	video_ids = [video_id for video_id in video_ids if video_id]
	if not video_ids:
		print("YouTube videos fetched: 0", flush=True)
		return []

	videos_params = {
		"id": ",".join(video_ids),
		"part": "statistics",
		"key": api_key,
	}
	videos_payload = _request_json(YOUTUBE_VIDEOS_URL, videos_params, "YouTube videos")
	video_items = videos_payload.get("items", []) if isinstance(videos_payload, dict) else []
	statistics_by_id = {}
	for item in video_items:
		if not isinstance(item, dict):
			continue
		video_id = (item.get("id") or "").strip()
		if not video_id:
			continue
		statistics_by_id[video_id] = item.get("statistics") or {}

	results = _normalize_youtube_posts(search_items, statistics_by_id)
	results.sort(key=lambda item: item.get("score", 0), reverse=True)
	print("YouTube videos fetched:", len(results), flush=True)
	return results


def _fetch_youtube_signals_safe(niche: str) -> list[dict]:
	try:
		return fetch_youtube_signals(niche)
	except Exception as exc:
		logger.warning("YouTube fetch skipped for niche='%s': %s", niche, exc)
		return []


def _firecrawl_result_to_dict(result) -> dict:
	if result is None:
		return {}
	if isinstance(result, dict):
		return result
	model_dump = getattr(result, "model_dump", None)
	if callable(model_dump):
		return model_dump()
	dict_method = getattr(result, "dict", None)
	if callable(dict_method):
		return dict_method()
	return {}


def _scrape_firecrawl_url(app, url: str) -> dict:
	if hasattr(app, "scrape_url"):
		return app.scrape_url(url, params={"formats": ["markdown"], "timeout": FIRECRAWL_TIMEOUT_SECONDS})
	if hasattr(app, "v1") and hasattr(app.v1, "scrape_url"):
		return app.v1.scrape_url(url, formats=["markdown"], timeout=FIRECRAWL_TIMEOUT_MS)
	if hasattr(app, "scrape"):
		return app.scrape(url, formats=["markdown"], timeout=FIRECRAWL_TIMEOUT_MS)
	raise AttributeError("Firecrawl scrape method not available")


def _extract_firecrawl_signals(url: str, content: str) -> list[dict]:
	results = []
	for line in content.splitlines():
		clean_line = " ".join(line.split()).strip()
		if not clean_line:
			continue
		lower_line = clean_line.lower()
		if not any(keyword in lower_line for keyword in FIRECRAWL_PAIN_KEYWORDS):
			continue
		results.append(
			{
				"title": clean_line[:80],
				"body": clean_line[:300],
				"score": 10,
				"source": url,
				"source_api": "firecrawl",
			}
		)
		if len(results) >= FIRECRAWL_LINE_LIMIT:
			break
	return results


def fetch_firecrawl_signals(niche: str) -> list[dict]:
	api_key = (os.getenv("FIRECRAWL_API_KEY") or "").strip()
	if not api_key or api_key == "your_key_here" or FirecrawlApp is None:
		return []

	app = FirecrawlApp(api_key=api_key)
	normalized_niche = _normalize_niche(niche)
	candidate_urls = [
		f"https://www.quora.com/search?q={normalized_niche}+problems+india",
		f"https://www.quora.com/search?q={normalized_niche}+struggle+india",
		f"https://indianstartupnews.com/?s={normalized_niche}",
	]
	urls = [candidate_urls[0], candidate_urls[-1]][:FIRECRAWL_MAX_URLS]

	results = []
	for url in urls:
		try:
			print(f"Firecrawl scraping: {url}", flush=True)
			result = _scrape_firecrawl_url(app, url)
			payload = _firecrawl_result_to_dict(result)
			content = (payload.get("markdown") or "").strip()
			print("Firecrawl status: success", flush=True)
			signals = _extract_firecrawl_signals(url, content)
			print("Firecrawl signals found:", len(signals), flush=True)
			results.extend(signals)
		except Exception as exc:
			logger.warning("Firecrawl scrape skipped for url='%s': %s", url, exc)
	return results[:FIRECRAWL_TOP_RESULTS]


def _fetch_firecrawl_signals_safe(niche: str) -> list[dict]:
	try:
		return fetch_firecrawl_signals(niche)
	except Exception as exc:
		logger.warning("Firecrawl fetch skipped for niche='%s': %s", niche, exc)
		return []


def _merge_posts(*groups: list[dict]) -> list[dict]:
	seen = set()
	merged = []
	for group in groups:
		for item in group:
			if not isinstance(item, dict):
				continue
			key = (item.get("title"), item.get("body"), item.get("source"), item.get("source_api"))
			if key in seen:
				continue
			seen.add(key)
			merged.append(item)
	return merged


def build_niche_payload(niche: str):
	print("SCRAPER ENTRY POINT HIT", flush=True)
	print("USE_MOCK flag:", os.getenv("USE_MOCK"), flush=True)
	if _use_mock():
		return scrape_mock(niche)

	if not niche:
		return None

	normalized_niche = _normalize_niche(niche)
	with ThreadPoolExecutor(max_workers=2) as executor:
		arctic_future = executor.submit(_fetch_arctic_shift_safe, niche)
		youtube_future = executor.submit(_fetch_youtube_signals_safe, niche)
		arctic_posts = arctic_future.result()
		youtube_posts = youtube_future.result()[:YOUTUBE_TOP_RESULTS]

	firecrawl_posts = _fetch_firecrawl_signals_safe(niche)[:FIRECRAWL_TOP_RESULTS]
	combined_posts = _merge_posts(arctic_posts, youtube_posts, firecrawl_posts)
	if len(arctic_posts) >= ARCTIC_SHIFT_MIN_RESULTS:
		return {"niche": normalized_niche, "reddit": combined_posts}

	logger.warning(
		"Arctic Shift returned %s posts; augmenting with DuckDuckGo fallback.",
		len(arctic_posts),
	)
	try:
		duck_posts = _fetch_duckduckgo(niche)
		if duck_posts:
			return {
				"niche": normalized_niche,
				"reddit": _merge_posts(arctic_posts, youtube_posts, firecrawl_posts, duck_posts),
			}
	except Exception as exc:
		logger.warning("DuckDuckGo failed; continuing with available sources: %s", exc)

	if combined_posts:
		return {"niche": normalized_niche, "reddit": combined_posts}

	return scrape_mock(niche)
