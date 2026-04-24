import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const examples = [
  { niche: "yoga", score: 8.7, pain: "No Hindi yoga app for beginners", idea: "Vernacular yoga app for Tier 2 India" },
  { niche: "edtech", score: 9.1, pain: "Students can't afford quality JEE coaching", idea: "AI-powered affordable JEE prep platform" },
  { niche: "pet care", score: 8.3, pain: "No reliable vet booking app in Tier 2 cities", idea: "On-demand vet consultation app" },
  { niche: "fintech", score: 8.9, pain: "Small traders lack simple GST filing tools", idea: "WhatsApp-based GST filing for kirana stores" },
  { niche: "fitness", score: 8.5, pain: "No affordable home workout plans in Hindi", idea: "Vernacular fitness coaching subscription" },
  { niche: "D2C brands", score: 8.6, pain: "Founders struggle with CAC on Instagram", idea: "AI ad creative generator for D2C founders" },
];

export default function Examples() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-20 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-medium text-gray-900 mb-4">See NicheMind in action</h1>
          <p className="text-lg text-gray-500">Real results from real niches — click any to run it yourself</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((item, index) => (
            <div 
              key={index}
              onClick={() => navigate(`/research?niche=${encodeURIComponent(item.niche)}`)}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-orange-300 transition-all cursor-pointer flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-lg text-gray-900 capitalize">{item.niche}</h3>
                <span className="bg-[#D85A30] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {item.score} / 10
                </span>
              </div>
              
              <div className="mb-4 flex-1">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Top Pain Point</p>
                <p className="text-sm text-gray-500 truncate" title={item.pain}>{item.pain}</p>
              </div>

              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider font-semibold text-[#D85A30] opacity-80 mb-1">Build Idea</p>
                <p className="text-sm font-medium text-[#712B13]">{item.idea}</p>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#D85A30]">Run this niche →</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
