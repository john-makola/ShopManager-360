
import React from 'react';
import { PublicNavbar } from '../components/PublicNavbar';
import { Check, ArrowRight, Zap, PlayCircle, BarChart, Settings, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const LearnMore: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      <PublicNavbar />
      
      {/* Hero */}
      <div className="pt-32 pb-20 px-6 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide border border-blue-100 mb-6">
             <Zap size={14} /> Efficiency First
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-8 leading-tight">
             Why Choose <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Shop Manager 360?</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
             In a competitive print market, efficiency is everything. Shop Manager 360 gives you the edge by centralizing your entire operation into one dashboard.
          </p>
        </div>
      </div>
      
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Section 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
             <div className="order-2 md:order-1 space-y-6">
                 <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                    <Settings size={24} />
                 </div>
                 <h2 className="text-3xl font-bold text-slate-800">Eliminate Workflow Bottlenecks</h2>
                 <p className="text-slate-600 text-lg leading-relaxed">
                     Stop using spreadsheets, sticky notes, and disparate systems. Our unified platform ensures that every team member, from the designer to the finisher, knows exactly what to do next.
                 </p>
                 <ul className="space-y-4 pt-4">
                     {[
                         'Real-time status updates',
                         'Clear job priorities',
                         'Automated customer notifications',
                         'Error-free invoicing'
                     ].map((item, i) => (
                         <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                             <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 text-xs"><Check size={14}/></div>
                             {item}
                         </li>
                     ))}
                 </ul>
             </div>
             <div className="order-1 md:order-2">
                 <div className="relative rounded-2xl shadow-2xl overflow-hidden border-8 border-white bg-slate-200 h-[400px]">
                    <img 
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Team collaboration" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                 </div>
             </div>
          </div>

          {/* Section 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
             <div className="order-1">
                 <div className="relative rounded-2xl shadow-2xl overflow-hidden border-8 border-white bg-slate-200 h-[400px]">
                    <img 
                        src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Analytics Dashboard" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                 </div>
             </div>
             <div className="order-2 space-y-6">
                 <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <BarChart size={24} />
                 </div>
                 <h2 className="text-3xl font-bold text-slate-800">Data-Driven Decisions</h2>
                 <p className="text-slate-600 text-lg leading-relaxed">
                     Don't guess where your money is going. See exactly which services are most profitable and where your costs are creeping up.
                 </p>
                 <ul className="space-y-4 pt-4">
                     {[
                         'Automated Profit & Loss Reports',
                         'Expense Tracking & Categorization',
                         'Sales Trends Analysis',
                         'Inventory Valuation'
                     ].map((item, i) => (
                         <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                             <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 text-xs"><Check size={14}/></div>
                             {item}
                         </li>
                     ))}
                 </ul>
             </div>
          </div>

          {/* CTA Box */}
          <div className="bg-slate-900 rounded-3xl p-12 md:p-16 text-white text-center relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -mr-16 -mt-16 opacity-20 blur-3xl"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full -ml-16 -mb-16 opacity-20 blur-3xl"></div>
             
             <div className="relative z-10">
                 <h2 className="text-3xl md:text-4xl font-bold mb-6">Start your journey today</h2>
                 <p className="text-slate-300 mb-10 max-w-2xl mx-auto text-lg">
                    No credit card required for demo. Experience the difference of a system built by printers, for printers.
                 </p>
                 <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/#signin" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all hover:scale-105">
                        Get Started <ArrowRight size={20} />
                    </Link>
                    <Link to="/contact" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-transparent border border-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
                        <Users size={20} /> Contact Sales
                    </Link>
                 </div>
             </div>
          </div>

        </div>
      </div>
      
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
         <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Shop Manager 360. All rights reserved.
         </div>
      </footer>
    </div>
  );
};

export default LearnMore;
