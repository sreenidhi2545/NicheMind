import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { analyseNiche, checkHealth } from '../api/research';

export default function DeepResearch() {
  const [searchParams] = useSearchParams();
  const niche = searchParams.get('niche') || '';
  const [status, setStatus] = useState('loading'); // loading, results, error
  const [data, setData] = useState(null);
  const [checklist, setChecklist] = useState([false, false, false, false, false]);

  const checklistItems = [
    "Research top 5 competitors in this niche",
    "Talk to 10 potential users this week",
    "Define your MVP feature set",
    "Set up a landing page to collect waitlist",
    "Apply to a startup incubator or accelerator"
  ];

  useEffect(() => {
    if (!niche) {
      setStatus('error');
      return;
    }
    
    // Load checklist
    const savedChecklist = JSON.parse(localStorage.getItem(`checklist_${niche}`) || '[false,false,false,false,false]');
    setChecklist(savedChecklist);

    const fetchData = async () => {
      try {
        const responseData = await analyseNiche(niche);
        setData(responseData);
        setStatus('results');
      } catch (err) {
        setStatus('error');
      }
    };
    
    fetchData();
  }, [niche]);

  const handleCheck = (index) => {
    const newChecklist = [...checklist];
    newChecklist[index] = !newChecklist[index];
    setChecklist(newChecklist);
    localStorage.setItem(`checklist_${niche}`, JSON.stringify(newChecklist));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <div className="relative flex items-center justify-center mb-6">
            <span className="absolute inline-flex h-16 w-16 rounded-full bg-[#D85A30] opacity-20 animate-ping" />
            <span className="relative inline-flex h-10 w-10 rounded-full bg-[#D85A30]" />
          </div>
          <p className="text-gray-500 font-medium text-lg">Generating deep research report for {niche}...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Could not generate report</h2>
          <p className="text-gray-500">Please make sure the backend is running and try again.</p>
        </div>
      </div>
    );
  }

  const { pain_points = [], opportunity, build_recommendation, overall_score, scores = {} } = data;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        {/* Section 1 - Report Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-orange-100 border border-orange-200 text-[#D85A30] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full capitalize">
                {niche}
              </span>
              <span className="text-sm text-gray-400 font-medium">
                Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-4xl font-medium text-gray-900">Deep research report</h1>
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-[#D85A30] text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-[#c24f28] transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Export as PDF
          </button>
        </div>

        {/* Section 2 - Score Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Overall Score</span>
            <span className="text-4xl font-bold text-[#D85A30]">{overall_score}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Pain Intensity</span>
            <span className="text-4xl font-bold text-[#D85A30]">{scores.pain_intensity}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Market Size</span>
            <span className="text-4xl font-bold text-[#D85A30]">{scores.market_size}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Competition Gap</span>
            <span className="text-4xl font-bold text-[#D85A30]">{scores.competition_gap}</span>
          </div>
        </div>

        {/* Section 3 - Pain Points */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pain points analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pain_points.map((point, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-full relative">
                <div className="absolute top-6 right-6 bg-[#D85A30] text-white text-xs font-bold w-8 h-8 flex items-center justify-center rounded-full">
                  {point.score}
                </div>
                <h3 className="text-lg font-medium text-gray-900 pr-10 mb-3 leading-snug">{point.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">{point.description}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="bg-orange-50 text-[#D85A30] text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-orange-100">India market</span>
                  <span className="bg-orange-50 text-[#D85A30] text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-orange-100">
                    {point.score >= 9 ? 'Critical pain' : point.score >= 8 ? 'High urgency' : 'Moderate'}
                  </span>
                  <span className="bg-orange-50 text-[#D85A30] text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-orange-100">Underserved</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4 - Market Opportunity */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Market opportunity</h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-6">
            <p className="text-gray-700 leading-relaxed text-lg">{opportunity}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-100 rounded-xl p-6 border border-gray-200 text-center">
              <span className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">TAM estimate</span>
              <span className="text-xl font-bold text-gray-900">{data?.market_data?.tam_estimate || 'Calculating...'}</span>
            </div>
            <div className="bg-gray-100 rounded-xl p-6 border border-gray-200 text-center">
              <span className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Target users</span>
              <span className="text-xl font-bold text-gray-900">{data?.market_data?.target_users || 'Calculating...'}</span>
            </div>
            <div className="bg-gray-100 rounded-xl p-6 border border-gray-200 text-center">
              <span className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Maturity</span>
              <span className="text-xl font-bold text-gray-900">{data?.market_data?.maturity || 'Early stage'}</span>
            </div>
          </div>
        </div>

        {/* Section 5 - Build Recommendation */}
        <div className="mb-16">
          <div className="bg-[#FAECE7] border border-[#D85A30] border-opacity-30 rounded-3xl p-10 shadow-sm mb-6">
            <span className="inline-block text-[#D85A30] text-xs font-bold uppercase tracking-widest mb-4">
              Recommended build
            </span>
            <h2 className="text-3xl font-bold text-[#712B13] mb-4">{build_recommendation?.title}</h2>
            <p className="text-gray-800 text-lg leading-relaxed">{build_recommendation?.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-orange-100 rounded-xl p-6 shadow-sm border-t-4 border-t-[#D85A30]">
              <h4 className="font-bold text-gray-900 mb-2">Validate it</h4>
              <p className="text-sm text-gray-600">Post in r/india and r/entrepreneur to test demand</p>
            </div>
            <div className="bg-white border border-orange-100 rounded-xl p-6 shadow-sm border-t-4 border-t-[#D85A30]">
              <h4 className="font-bold text-gray-900 mb-2">Build MVP</h4>
              <p className="text-sm text-gray-600">Use no-code tools like Glide or Bubble to launch in 2 weeks</p>
            </div>
            <div className="bg-white border border-orange-100 rounded-xl p-6 shadow-sm border-t-4 border-t-[#D85A30]">
              <h4 className="font-bold text-gray-900 mb-2">Find users</h4>
              <p className="text-sm text-gray-600">Target college students and tier 2 city professionals first</p>
            </div>
          </div>
        </div>

        {/* Section 6 - Competitor Landscape */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Competitor landscape</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 text-white rounded-xl p-6 shadow-sm">
              <span className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Existing solutions</span>
              <p className="font-medium">{data?.competitors?.existing_solutions || 'Generic global tools not built for India'}</p>
            </div>
            <div className="bg-[#D85A30] text-white rounded-xl p-6 shadow-sm">
              <span className="block text-[10px] uppercase tracking-widest text-orange-200 font-bold mb-2">Your advantage</span>
              <p className="font-medium">{data?.competitors?.your_advantage || 'India-first, vernacular, affordable'}</p>
            </div>
            <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 shadow-sm">
              <span className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Gap to fill</span>
              <p className="font-medium text-gray-800">{data?.competitors?.gap_to_fill || 'No dominant player in this exact niche yet'}</p>
            </div>
          </div>
        </div>

        {/* Section 7 - Next Steps Checklist */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your action plan</h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="space-y-4">
              {checklistItems.map((item, index) => (
                <label key={index} className="flex items-center gap-4 cursor-pointer group">
                  <div className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${checklist[index] ? 'bg-[#D85A30] border-[#D85A30]' : 'border-gray-300 group-hover:border-[#D85A30]'}`}>
                    {checklist[index] && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-lg transition-colors ${checklist[index] ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
