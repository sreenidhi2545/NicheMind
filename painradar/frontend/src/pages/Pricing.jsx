import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-20 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-medium text-gray-900 mb-4">Simple, honest pricing</h1>
          <p className="text-lg text-gray-500">Built for Indian founders and students</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Free</h2>
            <div className="text-3xl font-bold text-gray-900 mb-6">₹0 <span className="text-sm font-medium text-gray-500">/ month</span></div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {['5 searches per day', 'Pain point analysis', 'Build recommendation'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <svg className="w-5 h-5 text-[#D85A30]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => navigate('/research')}
              className="w-full bg-gray-100 text-gray-800 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Get started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-[#FAECE7] border-2 border-[#D85A30] rounded-2xl p-8 shadow-md relative flex flex-col">
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-[#D85A30] text-white text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full">
                Most popular
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-[#712B13] mb-2">Pro</h2>
            <div className="text-3xl font-bold text-gray-900 mb-6">₹499 <span className="text-sm font-medium text-gray-500">/ month</span></div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {[
                'Unlimited searches', 
                'Pain point analysis', 
                'Build recommendation', 
                'Compare 2 niches', 
                'Export as PDF', 
                'Search history (saved)'
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-800">
                  <svg className="w-5 h-5 text-[#D85A30]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => navigate('/payment?plan=pro')}
              className="w-full bg-[#D85A30] text-white font-semibold py-3 rounded-xl hover:bg-[#c24f28] transition-colors shadow-sm"
            >
              Start free trial
            </button>
          </div>

          {/* Team Plan */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Team</h2>
            <div className="text-3xl font-bold text-gray-900 mb-6">₹1,499 <span className="text-sm font-medium text-gray-500">/ month</span></div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {['Everything in Pro', '5 team members', 'Priority support', 'API access'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <svg className="w-5 h-5 text-[#D85A30]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => navigate('/payment?plan=team')}
              className="w-full bg-gray-100 text-gray-800 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Contact us
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
