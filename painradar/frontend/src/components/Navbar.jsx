import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          Niche<span className="text-primary">Mind</span>
        </Link>

        <div className="hidden md:flex space-x-8 items-center">
          <Link to="/how-it-works" className="text-gray-600 hover:text-primary transition-colors">How it works</Link>
          <Link to="/examples" className="text-gray-600 hover:text-primary transition-colors">Examples</Link>
          <Link to="/pricing" className="text-gray-600 hover:text-primary transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/history" className="text-gray-600 hover:text-primary transition-colors">History</Link>
          <Link 
            to="/research" 
            className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all"
          >
            Try free
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
