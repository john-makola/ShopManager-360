
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ArrowRight, Shield, BarChart3, Package, Users, Printer, CheckCircle, 
  MapPin, Phone, Mail, Instagram, Twitter, Facebook, Linkedin, Lock, Zap,
  PlayCircle, Star, ShoppingBag, Store
} from 'lucide-react';
import { PublicNavbar } from '../components/PublicNavbar';

const Home: React.FC = () => {
  const { login, isAuthenticated } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "Manage Your Shop with Ease",
      subtitle: "The all-in-one POS, Inventory, and Accounting solution for retail and wholesale businesses.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    },
    {
      title: "Real-time Sales Tracking",
      subtitle: "Monitor cash flow, credit sales, and daily profits from any device.",
      image: "https://images.unsplash.com/photo-1556740758-90de63f2076e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    },
    {
      title: "Smart Inventory Control",
      subtitle: "Prevent stockouts with automated low-stock alerts and supplier management.",
      image: "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (location.hash === '#signin') {
        const el = document.getElementById('signin');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  useEffect(() => {
    if (isAuthenticated) {
        navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate network delay for better UX feel
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        const success = await login(username, password);
        if (success) {
            navigate('/dashboard');
        } else {
            setError('Invalid credentials. Please check your username and password.');
            setLoading(false);
        }
    } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <PublicNavbar />
      <header className="relative pt-24 pb-12 lg:pt-0 lg:min-h-screen flex items-center overflow-hidden">
         {slides.map((slide, index) => (
            <div key={index} className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                <img src={slide.image} alt="Background" className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-[1px]"></div>
            </div>
         ))}

         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
             <div className="space-y-8 py-10">
                <div className="min-h-[200px] flex flex-col justify-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
                        {slides[currentSlide].title}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-lg leading-relaxed">
                        {slides[currentSlide].subtitle}
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => document.getElementById('signin')?.scrollIntoView({behavior: 'smooth'})} 
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 transform hover:-translate-y-1"
                    >
                        Start Managing <ArrowRight size={20} />
                    </button>
                    <Link to="/features" className="px-8 py-4 bg-white/5 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                        <PlayCircle size={20} /> View Features
                    </Link>
                </div>
             </div>

             <div id="signin" className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full mx-auto relative overflow-hidden">
                 <div className="mb-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 mb-2">
                        <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center font-bold text-white text-3xl shadow-lg mb-2">
                            S
                        </div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">
                            Shop Manager 360
                        </h2>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">Secure access for staff and managers.</p>
                 </div>

                 {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <Shield size={18} className="shrink-0 mt-0.5" /> <span>{error}</span>
                    </div>
                 )}

                 <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Username</label>
                        <input type="text" required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
                        <input type="password" required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-xl hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 flex justify-center items-center gap-2 mt-2"
                    >
                        {loading ? 'Accessing...' : 'Sign In'}
                    </button>
                 </form>
                 
                 <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-400 mb-3">Quick Demo Access:</p>
                    <div className="flex flex-wrap justify-center gap-2 text-[10px] font-mono">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => {setUsername('admin'); setPassword('password123')}}>admin</span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => {setUsername('operator'); setPassword('password123')}}>operator</span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => {setUsername('user'); setPassword('password123')}}>user</span>
                    </div>
                 </div>
             </div>
         </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                      Everything a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Modern Shop</span> Needs
                  </h2>
                  <p className="text-slate-500 max-w-2xl mx-auto text-lg">Whether you run a hardware store, electronics shop, or boutique, we have you covered.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                          <ShoppingBag size={28} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Point of Sale</h3>
                      <p className="text-slate-600">Fast checkout for walk-in customers. Support for Cash, Mpesa, and Card payments.</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                      <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                          <BarChart3 size={28} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Invoicing & Credit</h3>
                      <p className="text-slate-600">Manage wholesale clients, track partial payments, and generate professional invoices.</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                      <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
                          <Package size={28} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Inventory Sync</h3>
                      <p className="text-slate-600">Real-time stock deduction. Know exactly what's on your shelves and what needs reordering.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                  <div className="col-span-1 md:col-span-1">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center font-bold text-white text-xl">S</div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800">Shop Manager 360</h1>
                     </div>
                     <p className="text-slate-500 text-sm leading-relaxed">Empowering businesses with modern tools for growth.</p>
                  </div>
                  <div>
                      <h4 className="font-bold text-slate-900 mb-4">Contact</h4>
                      <ul className="space-y-3 text-sm text-slate-500">
                          <li className="flex items-center gap-2"><MapPin size={16}/> Nairobi, Kenya</li>
                          <li className="flex items-center gap-2"><Phone size={16}/> +254 700 123 456</li>
                          <li className="flex items-center gap-2"><Mail size={16}/> support@shopmanager360.com</li>
                      </ul>
                  </div>
              </div>
              <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                  <p>&copy; {new Date().getFullYear()} Shop Manager 360. All rights reserved.</p>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default Home;
