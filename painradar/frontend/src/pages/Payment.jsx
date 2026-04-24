import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Payment() {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'pro';
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('upi'); // upi, card
  const [isSuccess, setIsSuccess] = useState(false);

  const price = plan === 'team' ? '1,499' : '499';
  const displayPlan = plan === 'team' ? 'Team' : 'Pro';

  const features = plan === 'team' 
    ? ['Everything in Pro', '5 team members', 'Priority support', 'API access']
    : ['Unlimited searches', 'Pain point analysis', 'Build recommendation', 'Compare 2 niches', 'Export as PDF', 'Search history'];

  const handlePay = (e) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white border border-green-100 rounded-3xl p-10 max-w-md w-full text-center shadow-lg">
            <svg className="w-20 h-20 text-green-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment successful!</h2>
            <p className="text-gray-600 mb-8">Welcome to NicheMind {displayPlan}. You now have unlimited searches.</p>
            <button 
              onClick={() => navigate('/research')}
              className="w-full bg-[#D85A30] text-white font-semibold py-3.5 rounded-xl hover:bg-[#c24f28] transition-colors"
            >
              Start researching →
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 py-16 w-full flex flex-col md:flex-row gap-10">
        
        {/* Left - Order Summary */}
        <div className="w-full md:w-[55%]">
          <h1 className="text-3xl font-medium text-gray-900 mb-8">Order summary</h1>
          
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{displayPlan} plan</h2>
                <p className="text-gray-500 mt-1">Billed monthly</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">₹{price}</span>
                <span className="text-gray-500">/mo</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-100 pt-6 flex justify-between items-center mb-4">
              <span className="font-medium text-gray-900">Total today:</span>
              <span className="text-2xl font-bold text-gray-900">₹{price}</span>
            </div>

            <p className="text-sm text-gray-400 text-center bg-gray-50 p-3 rounded-lg">
              Cancel anytime. No questions asked.
            </p>
          </div>
        </div>

        {/* Right - Payment Form */}
        <div className="w-full md:w-[45%]">
          <h2 className="text-xl font-medium text-gray-900 mb-6">Payment details</h2>
          
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button 
                onClick={() => setActiveTab('upi')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'upi' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                UPI
              </button>
              <button 
                onClick={() => setActiveTab('card')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'card' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Card
              </button>
            </div>

            <form onSubmit={handlePay}>
              {activeTab === 'upi' ? (
                <div className="space-y-5 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter UPI ID</label>
                    <input 
                      type="text" 
                      required
                      placeholder="yourname@upi" 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#D85A30] transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-center pt-2">
                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">GPay</span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">PhonePe</span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Paytm</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card number</label>
                    <input 
                      type="text" 
                      required
                      placeholder="1234 5678 9012 3456" 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#D85A30] transition-colors font-mono"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">MM/YY</label>
                      <input 
                        type="text" 
                        required
                        placeholder="12/25" 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#D85A30] transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input 
                        type="text" 
                        required
                        placeholder="123" 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#D85A30] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name on card</label>
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe" 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#D85A30] transition-colors"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-[#D85A30] text-white font-semibold py-3.5 rounded-xl hover:bg-[#c24f28] transition-colors shadow-sm"
              >
                Pay ₹{price} now
              </button>
            </form>

            <div className="mt-4 text-center flex items-center justify-center gap-1 text-xs text-gray-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secured by Razorpay · Your data is encrypted
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
