import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { analyseNiche, checkHealth } from '../api/research';
import Navbar from '../components/Navbar';

/* ─── Constants & Logic ─────────────────────────────────────────────────── */
const DAILY_LIMIT = 5;

const checkSearchLimit = () => {
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem('nm_search_limit') || '{}');
  if (stored.date !== today) {
    localStorage.setItem('nm_search_limit', JSON.stringify({ date: today, count: 0 }));
    return true;
  }
  return stored.count < DAILY_LIMIT;
};

const incrementSearchCount = () => {
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem('nm_search_limit') || '{}');
  const count = stored.date === today ? stored.count + 1 : 1;
  localStorage.setItem('nm_search_limit', JSON.stringify({ date: today, count }));
};

const POPULAR_CHIPS = ['edtech', 'fintech', 'fitness', 'D2C brands'];
const BRAND = '#D85A30';
const BRAND_LIGHT = '#FAECE7';
const BRAND_DARK = '#712B13';

/* ─── Sub-components ────────────────────────────────────────────── */

/** Reusable search bar */
function SearchBar({ value, onChange, onSubmit, inputRef }) {
  const handleKey = (e) => e.key === 'Enter' && onSubmit();
  return (
    <div className="flex items-center border border-[#D85A30] rounded-xl overflow-hidden shadow-sm w-full">
      <input
        ref={inputRef}
        id="niche-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Try: yoga, pet care, online tutoring..."
        className="flex-1 px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 outline-none bg-white"
      />
      <button
        onClick={onSubmit}
        className="bg-[#D85A30] text-white text-sm font-semibold px-6 py-3.5 hover:bg-[#c24f28] transition-colors whitespace-nowrap"
      >
        Analyse
      </button>
    </div>
  );
}

/** Score bar row */
function ScoreBar({ label, value }) {
  const pct = Math.round((value / 10) * 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span className="font-semibold text-gray-700">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-orange-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#D85A30] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Skeleton card */
function Skeleton() {
  return (
    <div className="animate-pulse bg-gray-100 rounded-xl h-24 w-full" />
  );
}

/** Loading state */
function LoadingView() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6 px-4">
      {/* Pulsing orange circle */}
      <div className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-16 w-16 rounded-full bg-[#D85A30] opacity-20 animate-ping" />
        <span className="relative inline-flex h-10 w-10 rounded-full bg-[#D85A30]" />
      </div>
      <p className="text-gray-500 text-sm font-medium">
        Scanning Reddit and analysing pain points…
      </p>
      <div className="flex flex-col gap-4 w-full max-w-xl">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    </div>
  );
}

/** Error state */
function ErrorView({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4">
      <div className="bg-white border border-red-100 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-6">
          Could not reach the server. Make sure the backend is running.
        </p>
        <button
          onClick={onRetry}
          className="bg-[#D85A30] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#c24f28] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

/** Pain point card */
function PainPointCard({ point }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <span className="mt-1.5 w-2 h-2 rounded-full bg-[#D85A30] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm leading-snug">{point.title}</p>
          {point.description && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{point.description}</p>
          )}
        </div>
        <span className="flex-shrink-0 bg-[#D85A30] text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {point.score}
        </span>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────── */
export default function ResearchTool() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | results | error
  const [data, setData] = useState(null);
  const [isHealthCheckFailed, setIsHealthCheckFailed] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const searchInputRef = useRef(null);

  /* Pre-fill from URL and auto-search on mount */
  useEffect(() => {
    checkHealth().catch(() => setIsHealthCheckFailed(true));

    const nicheParam = searchParams.get('niche');
    if (nicheParam) {
      setQuery(nicheParam);
      runSearch(nicheParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSearch = async (searchQuery) => {
    const term = (searchQuery ?? query).trim();
    if (!term) return;

    if (!checkSearchLimit()) {
      setShowLimitModal(true);
      return;
    }
    incrementSearchCount();

    setStatus('loading');
    setData(null);
    try {
      const responseData = await analyseNiche(term);
      setData(responseData);
      setStatus('results');

      const history = JSON.parse(localStorage.getItem('nichemind_history') || '[]');
      history.unshift({ niche: term, timestamp: Date.now(), overall_score: responseData.overall_score });
      localStorage.setItem('nichemind_history', JSON.stringify(history.slice(0, 20)));
    } catch {
      setStatus('error');
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setData(null);
  };

  const HealthBanner = () => {
    if (!isHealthCheckFailed) return null;
    return (
      <div className="w-full text-center text-sm p-2" style={{ backgroundColor: '#FEF9C3', color: '#854D0E' }}>
        ⚠️ Backend is offline. Start the server at port 8000.
      </div>
    );
  };

  const LimitModalOverlay = () => {
    if (!showLimitModal) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center border-t-4 border-t-[#D85A30]">
          <div className="w-16 h-16 bg-orange-100 text-[#D85A30] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily limit reached</h2>
          <p className="text-gray-600 mb-8">
            You've used all 5 free searches today. Upgrade to Pro for unlimited searches.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/pricing')}
              className="w-full bg-[#D85A30] text-white font-semibold py-3 rounded-xl hover:bg-[#c24f28] transition-colors"
            >
              Upgrade to Pro →
            </button>
            <button 
              onClick={() => setShowLimitModal(false)}
              className="w-full bg-gray-100 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Come back tomorrow
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ── IDLE ── */
  if (status === 'idle') {
    return (
      <div className="min-h-screen bg-white font-sans">
        <LimitModalOverlay />
        <HealthBanner />
        <Navbar />
        <div className="flex flex-col items-center justify-center px-4 py-28 text-center">
          <h1 className="text-3xl font-medium text-gray-900 mb-3">
            What niche do you want to explore?
          </h1>
          <p className="text-gray-500 text-base mb-8 max-w-md">
            We'll scan Reddit, analyse pain points, and suggest what to build
          </p>

          <div className="w-full max-w-xl mb-4">
            <SearchBar value={query} onChange={setQuery} onSubmit={() => runSearch()} inputRef={searchInputRef} />
            <div className={`text-xs mt-2 text-center ${(() => {
              const stored = JSON.parse(localStorage.getItem('nm_search_limit') || '{}');
              const count = stored.date === new Date().toDateString() ? (stored.count || 0) : 0;
              return count >= 4 ? 'text-[#D85A30] font-semibold' : 'text-gray-400';
            })()}`}>
              {(() => {
                const stored = JSON.parse(localStorage.getItem('nm_search_limit') || '{}');
                const count = stored.date === new Date().toDateString() ? (stored.count || 0) : 0;
                return count;
              })()} of {DAILY_LIMIT} free searches used today
            </div>
          </div>

          {/* Popular chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-400">
            <span>Popular:</span>
            {POPULAR_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => { setQuery(chip); runSearch(chip); }}
                className="text-[#D85A30] font-medium hover:underline focus:outline-none"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── LOADING ── */
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white font-sans">
        <LimitModalOverlay />
        <HealthBanner />
        <Navbar />
        <LoadingView />
      </div>
    );
  }

  /* ── ERROR ── */
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-white font-sans">
        <LimitModalOverlay />
        <HealthBanner />
        <Navbar />
        <ErrorView onRetry={handleRetry} />
      </div>
    );
  }

  /* ── RESULTS ── */
  const { pain_points = [], opportunity, build_recommendation, overall_score, scores = {} } = data;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <LimitModalOverlay />
      <HealthBanner />
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── LEFT COLUMN (scrollable) ── */}
          <div className="w-full lg:w-[60%] flex flex-col gap-6">

            {/* Re-search bar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <SearchBar value={query} onChange={setQuery} onSubmit={() => runSearch()} inputRef={searchInputRef} />
            </div>

            {/* Pain points */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Pain Points Found
              </p>
              <div className="flex flex-col gap-3">
                {pain_points.map((point, i) => (
                  <PainPointCard key={i} point={point} />
                ))}
              </div>
            </div>

            {/* Market opportunity */}
            {opportunity && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Market Opportunity
                </p>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <p className="text-sm text-gray-700 leading-relaxed">{opportunity}</p>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN (sticky) ── */}
          <div className="w-full lg:w-[40%] flex flex-col gap-5 lg:sticky lg:top-24">

            {/* Build recommendation card */}
            {build_recommendation && (
              <div
                className="rounded-2xl border border-orange-200 p-6"
                style={{ backgroundColor: BRAND_LIGHT }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: BRAND_DARK }}
                >
                  Recommended Build
                </p>
                <h2 className="text-lg font-medium text-gray-900 mb-3 leading-snug">
                  {build_recommendation.title}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  {build_recommendation.description}
                </p>
                <button 
                  onClick={() => navigate(`/deep-research?niche=${encodeURIComponent(query || data?.niche || '')}`)}
                  className="w-full bg-[#D85A30] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#c24f28] transition-colors"
                >
                  Start researching deeper →
                </button>
              </div>
            )}

            {/* Niche score card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Opportunity Score
              </p>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-bold" style={{ color: BRAND }}>
                  {overall_score}
                </span>
                <span className="text-gray-400 text-sm mb-2">out of 10</span>
              </div>

              <div>
                {scores.pain_intensity !== undefined && (
                  <ScoreBar label="Pain intensity" value={scores.pain_intensity} />
                )}
                {scores.market_size !== undefined && (
                  <ScoreBar label="Market size" value={scores.market_size} />
                )}
                {scores.competition_gap !== undefined && (
                  <ScoreBar label="Competition gap" value={scores.competition_gap} />
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
