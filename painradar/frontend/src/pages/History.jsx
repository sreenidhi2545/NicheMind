import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function History() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('nichemind_history') || '[]');
    setHistory(saved);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('nichemind_history');
    setHistory([]);
  };

  const formatTimestamp = (ts) => {
    const date = new Date(ts);
    const now = new Date();
    const diffHours = Math.round((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      if (diffHours === 0) return 'Just now';
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-24 h-24 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No searches yet</h2>
            <p className="text-gray-500 mb-8">Your past niche searches will appear here</p>
            <button 
              onClick={() => navigate('/research')}
              className="bg-[#D85A30] text-white font-semibold py-3 px-8 rounded-xl hover:bg-[#c24f28] transition-colors shadow-sm"
            >
              Start researching →
            </button>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-medium text-gray-900 mb-2">Your research history</h1>
            <p className="text-gray-500 mb-10">Your last 20 searches — click any to re-run</p>

            <div className="grid grid-cols-1 gap-3 mb-8">
              {history.map((item, index) => (
                <div 
                  key={index}
                  onClick={() => navigate(`/research?niche=${encodeURIComponent(item.niche)}`)}
                  className="bg-white border border-gray-200 hover:border-orange-400 rounded-xl p-5 flex items-center justify-between cursor-pointer transition-colors shadow-sm"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 text-lg capitalize">{item.niche}</h3>
                    <p className="text-xs text-gray-400 mt-1">{formatTimestamp(item.timestamp)}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {item.overall_score !== undefined && (
                      <div className="bg-[#D85A30] text-white text-sm font-bold px-3 py-1.5 rounded-full">
                        {item.overall_score} / 10
                      </div>
                    )}
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button 
                onClick={clearHistory}
                className="text-sm text-gray-400 hover:text-gray-600 underline"
              >
                Clear history
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
