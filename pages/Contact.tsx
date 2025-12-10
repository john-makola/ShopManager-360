
import React from 'react';
import { PublicNavbar } from '../components/PublicNavbar';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      <PublicNavbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
           
           {/* Contact Info */}
           <div className="space-y-10">
               <div>
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide border border-blue-100 mb-4">
                        <MessageCircle size={14} /> Support
                   </div>
                   <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Get in Touch</h1>
                   <p className="text-lg text-slate-600 leading-relaxed">
                       Have questions about Shop Manager 360? Need a demo or technical assistance? We're here to help your business grow.
                   </p>
               </div>
               
               <div className="space-y-6">
                   <div className="flex items-start gap-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                       <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                           <Mail size={24} />
                       </div>
                       <div>
                           <h3 className="font-bold text-slate-800 text-lg mb-1">Email Us</h3>
                           <p className="text-slate-500 mb-2 text-sm">Our friendly team is here to help.</p>
                           <a href="mailto:support@shopmanager360.com" className="text-blue-600 font-bold hover:underline">support@shopmanager360.com</a>
                       </div>
                   </div>
                   
                   <div className="flex items-start gap-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                       <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                           <Phone size={24} />
                       </div>
                       <div>
                           <h3 className="font-bold text-slate-800 text-lg mb-1">Call Us</h3>
                           <p className="text-slate-500 mb-2 text-sm">Mon-Fri from 8am to 5pm.</p>
                           <a href="tel:+254700000000" className="text-blue-600 font-bold hover:underline">+254 700 000 000</a>
                       </div>
                   </div>
                   
                   <div className="flex items-start gap-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                       <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                           <MapPin size={24} />
                       </div>
                       <div>
                           <h3 className="font-bold text-slate-800 text-lg mb-1">Visit Us</h3>
                           <p className="text-slate-500 mb-2 text-sm">Come say hello at our office HQ.</p>
                           <p className="text-slate-800 font-medium">123 Business Park, Nairobi, Kenya</p>
                       </div>
                   </div>
               </div>
           </div>

           {/* Contact Form */}
           <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>
               
               <h2 className="text-2xl font-bold text-slate-800 mb-6 relative z-10">Send us a Message</h2>
               <form className="space-y-5 relative z-10" onSubmit={(e) => e.preventDefault()}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div className="space-y-2">
                           <label className="text-sm font-bold text-slate-700">First Name</label>
                           <input 
                             type="text" 
                             className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 font-medium transition-all" 
                             placeholder="Jane" 
                           />
                       </div>
                       <div className="space-y-2">
                           <label className="text-sm font-bold text-slate-700">Last Name</label>
                           <input 
                             type="text" 
                             className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 font-medium transition-all" 
                             placeholder="Doe" 
                           />
                       </div>
                   </div>
                   
                   <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Email Address</label>
                       <input 
                         type="email" 
                         className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 font-medium transition-all" 
                         placeholder="jane@company.com" 
                       />
                   </div>

                   <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">Message</label>
                       <textarea 
                         rows={4} 
                         className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 font-medium transition-all resize-none" 
                         placeholder="Tell us about your shop needs..."
                       ></textarea>
                   </div>
                   
                   <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                       <Send size={18} /> Send Message
                   </button>
               </form>
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

export default Contact;
