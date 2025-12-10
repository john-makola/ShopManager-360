
import React from 'react';
import { PublicNavbar } from '../components/PublicNavbar';
import { Target, Heart, Award, Users, Star } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      <PublicNavbar />
      
      {/* Hero */}
      <div className="pt-32 pb-16 px-6 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide border border-indigo-100 mb-6">
                <Star size={14} /> Our Story
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">About Us</h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              We are dedicated to revolutionizing how print shops and service businesses manage their operations.
            </p>
        </div>
      </div>

      <div className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Mission Section */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl p-8 md:p-12 mb-16 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
             <div className="relative z-10">
                 <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                    <Target className="text-blue-200" /> Our Mission
                 </h2>
                 <div className="space-y-6 text-blue-50 text-lg leading-relaxed">
                    <p>
                        Shop Manager 360 was born out of a simple need: to bring clarity to the chaos of a busy print shop floor. We noticed that many shop owners struggle with juggling custom orders, tracking inventory of varied materials, and keeping tabs on credit sales. 
                    </p>
                    <p>
                        Our mission is to provide an intuitive, all-in-one platform that bridges the gap between production and finance. We empower business owners to make data-driven decisions, reduce waste, and build stronger relationships with their customers.
                    </p>
                 </div>
             </div>
          </div>

          {/* Core Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
             <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-lg transition-all group">
                 <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Target size={24} />
                 </div>
                 <h3 className="font-bold text-slate-800 text-lg mb-2">Focus</h3>
                 <p className="text-slate-600 text-sm leading-relaxed">Laser-focused on the specific needs of the print and customization industry.</p>
             </div>
             
             <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-lg transition-all group">
                 <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <Heart size={24} />
                 </div>
                 <h3 className="font-bold text-slate-800 text-lg mb-2">Passion</h3>
                 <p className="text-slate-600 text-sm leading-relaxed">We love seeing local businesses thrive and scale with the right tools.</p>
             </div>
             
             <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-lg transition-all group">
                 <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Award size={24} />
                 </div>
                 <h3 className="font-bold text-slate-800 text-lg mb-2">Quality</h3>
                 <p className="text-slate-600 text-sm leading-relaxed">Committed to robust, secure, and high-performance software.</p>
             </div>
             
             <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-lg transition-all group">
                 <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <Users size={24} />
                 </div>
                 <h3 className="font-bold text-slate-800 text-lg mb-2">Community</h3>
                 <p className="text-slate-600 text-sm leading-relaxed">Building a community of operators who share insights and growth.</p>
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

export default About;
