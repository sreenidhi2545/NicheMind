# NicheMind — PainRadar 🧠

## What it does

AI-powered niche research tool. Input a niche (e.g. "yoga"), get back validated pain points, market opportunity analysis, and a startup idea — all India-focused.

## Tech Stack

- Backend: FastAPI + Python
- AI Analysis: Groq (llama-3.3-70b-versatile)
- Data Sources: Arctic Shift (Reddit archive), DuckDuckGo Instant Answer API
- Caching: local cache utility
- Frontend: React (Vite)

## Project Structure

```
painradar/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── agents/
│   │   ├── scraper.py       # Arctic Shift + DuckDuckGo data fetching
│   │   └── analyser.py      # Groq AI analysis
│   ├── mock/                # Fallback mock data
│   ├── utils/               # Cache + quality checker
│   └── .env                 # API keys (not committed)
└── frontend/                # React frontend
```

## Setup

1. Clone the repo
2. Create backend/.env with:

```
GROQ_API_KEY=your_key_here
USE_MOCK=false
```

3. Install dependencies:

```powershell
pip install -r requirements.txt
```

4. Run the API:

```powershell
uvicorn backend.main:app --reload --port 8000
```

## API Usage

POST /research
Body: {"niche": "yoga"}
Returns: pain points, best opportunity, build recommendation

## Data Flow

User Input → Scraper (Arctic Shift x3 subreddits) → Groq AI Analysis → Structured JSON Response

## Built by

Sreenidhi — B.Tech CSE
github.com/sreenidhi2545
