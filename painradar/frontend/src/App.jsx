import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ResearchTool from './pages/ResearchTool';
import HowItWorks from './pages/HowItWorks';
import History from './pages/History';
import Pricing from './pages/Pricing';
import Examples from './pages/Examples';
import DeepResearch from './pages/DeepResearch';
import Payment from './pages/Payment';

// Each page is responsible for its own Navbar / Footer layout
// so that LandingPage (and future pages) can fully own their chrome.
function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/research" element={<ResearchTool />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/history" element={<History />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/examples" element={<Examples />} />
        <Route path="/deep-research" element={<DeepResearch />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </Router>
  );
}

export default App;
