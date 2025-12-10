
import React from 'react';
import { PublicNavbar } from '../components/PublicNavbar';
import { Printer, BarChart3, Package, Users, Shield, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      <PublicNavbar />
      
      {/* Hero Section */}
      <div className="pt-32 pb-16 px-6 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white opacity-60"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide border border-blue-100 mb-6">
                <Zap size={14} /> comprehensive toolkit
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Powerful Features for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Modern Print Shops</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover how Shop Manager 360 transforms your day-to-day operations with tools designed specifically for the print and service industry.
            </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
             
             {/* Card 1 */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Printer size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Job Workflow Management</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                   Track every job from "Pending" to "Completed". Assign priorities, manage due dates, and attach files. Visualize work with Kanban boards or lists.
                </p>
             </div>

             {/* Card 2 */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <BarChart3 size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Financial Analytics</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                   Real-time Profit & Loss statements. Track revenue vs. COGS. Monitor cash flow with detailed daily, weekly, and monthly reports.
                </p>
             </div>

             {/* Card 3 */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Package size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Inventory Control</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                   Manage paper, ink, and materials. Set low-stock thresholds to get alerted before you run out. Calculate total stock value instantly.
                </p>
             </div>

             {/* Card 4 */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Users size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">CRM & Credit Management</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                   Keep a database of customers. Track total spend and manage credit/debt balances with clear status indicators.
                </p>
             </div>

             {/* Card 5 */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Shield size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Role-Based Security</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                   Granular access control. Administrators have full access, while Operators and Users have restricted views to protect sensitive data.
                </p>
             </div>

             {/* Card 6 */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Zap size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">AI-Powered Insights</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                   Leverage Google Gemini AI to analyze your shop's data for bottlenecks and generate professional client emails automatically.
                </p>
             </div>
          </div>

          {/* CTA Section */}
          <div className="bg-slate-900 rounded-3xl p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              <div className="relative z-10 max-w-3xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">Ready to optimize your shop?</h2>
                  <p className="text-slate-300 mb-10 text-lg">
                      Join hundreds of print shop owners who are saving time and increasing profits with Shop Manager 360.
                  </p>
                  <Link to="/#signin" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-blue-900/50">
                      Get Started Now <ArrowRight size={20} />
                  </Link>
              </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
         <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Shop Manager 360. All rights reserved.
         </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;
