
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const PublicNavbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="border-b border-slate-200 py-4 px-6 fixed w-full bg-white/90 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
           <div 
             className="flex items-center gap-2 cursor-pointer" 
             onClick={() => navigate('/')}
           >
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center font-bold text-white text-xl">
                  S
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">Shop Manager 360</h1>
           </div>
           <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
              <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/features" className="hover:text-blue-600 transition-colors">Features</Link>
              <Link to="/about" className="hover:text-blue-600 transition-colors">About</Link>
              <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
           </div>
           <div>
              <button 
                onClick={() => navigate('/#signin')}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all"
              >
                Sign In
              </button>
           </div>
      </div>
    </nav>
  );
};
