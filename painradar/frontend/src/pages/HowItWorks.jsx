import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-16 w-full">
        {/* Section 1 - Hero */}
        <section className="text-center mb-24">
          <span className="inline-block border border-orange-200 text-[#D85A30] bg-[#FAECE7] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
            Simple. Fast. Powerful.
          </span>
          <h1 className="text-4xl font-medium text-gray-900 mb-4">
            How NicheMind works
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Three steps from idea to validated startup concept — in under 60 seconds
          </p>
        </section>

        {/* Section 2 - Steps */}
        <section className="space-y-8 mb-24">
          {/* Step 1 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 flex items-center gap-8 shadow-sm">
            <div className="text-6xl font-bold text-[#FAECE7] flex-shrink-0 w-16 text-center">
              1
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-[#D85A30]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900">Type your niche</h3>
              </div>
              <p className="text-gray-600 leading-relaxed ml-9">
                Enter any topic — fitness, edtech, fintech, pet care. Be as broad or specific as you like.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 flex items-center gap-8 shadow-sm">
            <div className="text-6xl font-bold text-[#FAECE7] flex-shrink-0 w-16 text-center">
              2
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-[#D85A30]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900">We scan Reddit</h3>
              </div>
              <p className="text-gray-600 leading-relaxed ml-9">
                Our scraper pulls thousands of real posts and comments from Indian Reddit communities — finding what people genuinely struggle with.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 flex items-center gap-8 shadow-sm">
            <div className="text-6xl font-bold text-[#FAECE7] flex-shrink-0 w-16 text-center">
              3
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-[#D85A30]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900">AI analyses & recommends</h3>
              </div>
              <p className="text-gray-600 leading-relaxed ml-9">
                Groq's Llama 3.3 model scores each pain point, estimates the market opportunity, and recommends exactly what to build.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 - Data Sources */}
        <section className="mb-24">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 text-center">
            OUR DATA SOURCES
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
              <svg className="w-8 h-8 text-[#D85A30] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <h4 className="font-bold text-gray-900 mb-2">Reddit via Arctic Shift</h4>
              <p className="text-sm text-gray-500">Millions of archived posts from Indian subreddits</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
              <svg className="w-8 h-8 text-[#D85A30] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <h4 className="font-bold text-gray-900 mb-2">DuckDuckGo Instant API</h4>
              <p className="text-sm text-gray-500">Real-time web signals about the niche</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
              <svg className="w-8 h-8 text-[#D85A30] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <h4 className="font-bold text-gray-900 mb-2">Groq Llama 3.3 70B</h4>
              <p className="text-sm text-gray-500">State-of-the-art AI for analysis and scoring</p>
            </div>
          </div>
        </section>

        {/* Section 4 - CTA */}
        <section className="text-center bg-[#FAECE7] rounded-3xl p-12 border border-orange-100">
          <h2 className="text-3xl font-bold text-[#712B13] mb-3">See it in action</h2>
          <p className="text-[#D85A30] mb-8 font-medium">Try it with any niche — free, no signup</p>
          <button 
            onClick={() => navigate('/research')}
            className="bg-[#D85A30] text-white font-bold py-4 px-10 rounded-xl hover:bg-[#c24f28] transition-colors shadow-sm text-lg"
          >
            Try it now →
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
