import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

/* ─── Inline SVG Icons ─────────────────────────────────────────── */
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#D85A30" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#D85A30" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l4-5 4 3 4-6 4 4" />
    <path strokeLinecap="round" d="M3 21h18" />
  </svg>
);

const DocIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#D85A30" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 8h6M9 16h4M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
  </svg>
);

/* ─── Data ──────────────────────────────────────────────────────── */
const POPULAR_CHIPS = ['edtech', 'fintech', 'fitness', 'D2C brands'];

const WHAT_YOU_GET = [
  {
    icon: <ClockIcon />,
    title: 'Real pain points',
    desc: 'Scraped from Reddit communities — what real people in India complain about',
  },
  {
    icon: <ChartIcon />,
    title: 'Market opportunity',
    desc: 'AI-scored opportunity with TAM estimate and competition density',
  },
  {
    icon: <DocIcon />,
    title: 'Build recommendation',
    desc: 'A concrete product idea you can start building this weekend',
  },
];

const PAIN_POINTS = [
  { text: 'Affordable yoga gear not available in Tier 2 cities', score: 9.2 },
  { text: 'No Hindi-language yoga app for beginners', score: 8.7 },
  { text: 'Online yoga teachers lack payment & booking tools', score: 8.1 },
];

/* ─── Component ─────────────────────────────────────────────────── */
export default function LandingPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleAnalyse = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/research?niche=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAnalyse();
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* ── Section 1: Hero ───────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-24 text-center">
        {/* Badge pill */}
        <div className="inline-flex items-center gap-2 bg-[#FAECE7] text-[#712B13] text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-[#D85A30] inline-block" />
          India-focused market research
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-medium text-gray-900 leading-tight mb-5">
          Find{' '}
          <span className="text-[#D85A30]">real pain points</span>
          {' '}in any niche — instantly
        </h1>

        {/* Subheading */}
        <p className="text-base text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Type a niche. Get validated pain points, market opportunities, and a startup idea — powered by AI and real Reddit data.
        </p>

        {/* Search bar */}
        <div className="flex items-center max-w-xl mx-auto border border-[#D85A30] rounded-xl overflow-hidden shadow-sm mb-4">
          <input
            id="niche-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Try: yoga, pet care, online tutoring..."
            className="flex-1 px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 outline-none bg-white"
          />
          <button
            onClick={handleAnalyse}
            className="bg-[#D85A30] text-white text-sm font-semibold px-6 py-3.5 hover:bg-[#c24f28] transition-colors whitespace-nowrap"
          >
            Analyse
          </button>
        </div>

        {/* Popular chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-14 text-sm text-gray-400">
          <span>Popular:</span>
          {POPULAR_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setQuery(chip)}
              className="text-[#D85A30] font-medium hover:underline focus:outline-none"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
          {[
            { value: '2,400+', label: 'Niches researched' },
            { value: '18k+', label: 'Pain points found' },
            { value: '🇮🇳', label: 'India focused data' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 2: What you get ───────────────────────────────── */}
      <section className="bg-[#FAECE7] py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center mb-10">
            What you get
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHAT_YOU_GET.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FAECE7] flex items-center justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="text-gray-900 font-medium mb-2">{card.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Sample result ──────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center mb-8">
            Sample Result — Yoga
          </p>

          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <span className="text-gray-800 font-medium text-sm">Yoga — pain point analysis</span>
              <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
                High opportunity
              </span>
            </div>

            {/* Pain point rows */}
            <div className="divide-y divide-gray-50">
              {PAIN_POINTS.map((pp) => (
                <div key={pp.text} className="flex items-center gap-3 px-6 py-4">
                  <span className="w-2 h-2 rounded-full bg-[#D85A30] flex-shrink-0" />
                  <p className="flex-1 text-sm text-gray-700 leading-snug">{pp.text}</p>
                  <span className="text-[#D85A30] font-semibold text-sm flex-shrink-0">{pp.score}</span>
                </div>
              ))}
            </div>

            {/* Build this box */}
            <div className="bg-[#FAECE7] px-6 py-5 m-4 rounded-xl">
              <p className="text-xs font-bold text-[#712B13] uppercase tracking-wide mb-2">Build this</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                A vernacular yoga app with offline video support and affordable gear marketplace — targeting Tier 2 India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: CTA ───────────────────────────────────────── */}
      <section className="bg-[#FAECE7] py-24 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
          Ready to find your next big idea?
        </h2>
        <p className="text-gray-500 text-base mb-10">
          Free to try. No signup needed for your first search.
        </p>
        <button
          onClick={() => navigate('/research')}
          className="bg-[#D85A30] text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-[#c24f28] transition-colors shadow-md hover:shadow-lg"
        >
          Get started free →
        </button>
      </section>
    </div>
  );
}
