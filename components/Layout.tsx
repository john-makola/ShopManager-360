
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';
import { Bell, Search, UserCircle, Menu, Plus, Minus, ArrowRight, Package, Printer, Users, AlertTriangle, Clock, CreditCard, HelpCircle, ChevronUp, ChevronDown, Settings, LogOut, Building } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { GlobalHelp } from './GlobalHelp';
import { ThemePicker } from './ThemePicker';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { jobs, inventory, customers, serviceProducts, currentUser, logout, updateCurrentUser, isAuthenticated, currentOrganization } = useAppContext();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Help State
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // User Menu State (Header)
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  // Ensure user is logged in
  useEffect(() => {
    if (!isAuthenticated) {
        navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Role Based Navigation Logic
  const getNavItemsForRole = () => {
    if (!currentUser) return [];

    const role = currentUser.role;

    // Helper to safely filter children without mutating the original constant deeply
    const filterChildren = (item: any) => {
        let newChildren = [...item.children];

        // Filter out General Expenses for Operator and User
        if (['Operator', 'User'].includes(role) && item.label === 'Expenses') {
             newChildren = newChildren.filter((child: any) => child.label !== 'General Expenses');
        }
        
        // Reports Filtering
        if (item.label === 'Reports') {
             // Filter P&L for User
             if (role === 'User') {
                 newChildren = newChildren.filter((child: any) => child.label !== 'Profit & Loss Analysis');
             }
             // Filter Audit Trail for basic Users (Allow for Admin/Operator)
             if (role === 'User') {
                 newChildren = newChildren.filter((child: any) => child.label !== 'Audit Trail');
             }
        }
        
        return {
            ...item,
            children: newChildren
        };
    };

    // Administrator: Sees everything
    if (role === 'Administrator') return NAV_ITEMS;

    // Operator
    // Allowed: Sales, Expenses (Restricted), Inventory, Customers, Suppliers, Reports
    // Hidden: Users, Smart Insights
    if (role === 'Operator') {
        return NAV_ITEMS.filter(item => 
            item.label !== 'Users' && 
            item.label !== 'Smart Insights'
        ).map(item => item.children ? filterChildren(item) : item);
    }

    // User
    // Allowed: Sales, Expenses (Restricted), Inventory, Customers, Suppliers, Reports (Restricted)
    // Hidden: Dashboard (Maybe kept for overview?), Users, Smart Insights
    if (role === 'User') {
        return NAV_ITEMS.filter(item => {
             // Hide specific main modules
             if (['Users', 'Smart Insights'].includes(item.label)) return false;
             return true;
        }).map(item => item.children ? filterChildren(item) : item);
    }

    return [];
  };

  const navItems = getNavItemsForRole();

  // Automatically expand menu if a child is active
  useEffect(() => {
    navItems.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some((child: any) => child.path === location.pathname);
        if (isChildActive && !expandedMenus.includes(item.label)) {
          setExpandedMenus(prev => [...prev, item.label]);
        }
      }
    });
  }, [location.pathname, navItems]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target as Node)) {
        setIsHeaderMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for Help (F1)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault();
        setIsHelpOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label) 
        : [...prev, label]
    );
  };

  const handleSearchSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    if ((e as React.KeyboardEvent).key === 'Enter' || e.type === 'submit') {
      e.preventDefault();
      if (searchQuery.trim()) {
        setShowDropdown(false);
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  // Filter preview results (limit 3 per category)
  const previewResults = React.useMemo(() => {
    if (!searchQuery.trim()) return null;
    const lowerQ = searchQuery.toLowerCase();
    const matches = (val: any) => String(val || '').toLowerCase().includes(lowerQ);

    return {
      jobs: jobs.filter(j => matches(j.title) || matches(j.customerName) || matches(j.id) || matches(j.invoiceNumber)).slice(0, 3),
      inventory: inventory.filter(i => matches(i.name) || matches(i.category)).slice(0, 3),
      customers: customers.filter(c => matches(c.name) || matches(c.phone)).slice(0, 3),
      services: serviceProducts.filter(s => matches(s.name) || matches(s.code)).slice(0, 2),
    };
  }, [searchQuery, jobs, inventory, customers, serviceProducts]);

  const hasResults = previewResults && (
    previewResults.jobs.length > 0 || 
    previewResults.inventory.length > 0 || 
    previewResults.customers.length > 0 ||
    previewResults.services.length > 0
  );

  // --- Notification Logic ---
  const lowStock = inventory.filter(i => i.quantity <= i.threshold);
  const pendingJobs = jobs.filter(j => j.status === 'Pending');
  const unpaidInvoices = jobs.filter(j => j.saleType === 'Credit' && (j.balance || 0) > 0);
  
  const notificationCount = lowStock.length + pendingJobs.length + unpaidInvoices.length;

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Using bg-blue-800 for stronger color theming */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 text-white transform transition-transform duration-200 ease-in-out flex flex-col h-full
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0
      `}>
        <div className="p-6 border-b border-blue-700 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg border border-white/20">
            {currentOrganization?.name?.substring(0, 2).toUpperCase() || 'SM'}
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold tracking-tight truncate leading-tight">
                {currentOrganization?.name || 'Shop Manager'}
            </h1>
            <p className="text-[10px] text-blue-200 mt-0.5 truncate uppercase tracking-wider">{currentOrganization?.type || 'System'} Manager</p>
          </div>
        </div>
        
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto sidebar-scroll">
          {navItems.map((item: any) => {
            const Icon = item.icon;
            
            if (item.children) {
              const isExpanded = expandedMenus.includes(item.label);
              const isActiveParent = item.children.some((child: any) => child.path === location.pathname);
              
              return (
                <div key={item.label} className="mb-1">
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors
                      ${isActiveParent ? 'text-white bg-blue-700' : 'text-white/70 hover:text-white hover:bg-blue-700'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      {item.label}
                    </div>
                    {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-1 ml-4 border-l border-blue-700 pl-4 space-y-1">
                      {item.children.map((child: any) => {
                        const isChildActive = location.pathname === child.path;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`
                              block py-2 px-3 text-sm rounded-md transition-colors
                              ${isChildActive 
                                ? 'text-white font-medium bg-white/10' 
                                : 'text-white/60 hover:text-white hover:bg-white/5'}
                            `}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path!}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-white/70 hover:text-white hover:bg-blue-700'
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Branding Footer */}
        <div className="p-4 border-t border-blue-700 shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-blue-700 border border-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-inner">
              360
            </div>
            <div>
              <h3 className="font-bold text-white text-sm leading-none">ShopManager 360</h3>
              <p className="text-[10px] text-blue-200 mt-1 font-mono">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-40 gap-4">
            <button 
              className="md:hidden text-slate-500 hover:text-slate-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={24} />
            </button>

            {/* Global Search Bar with Dropdown */}
            <div className="hidden md:block relative flex-1 max-w-2xl" ref={searchContainerRef}>
                <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
                    <Search size={18} className="text-slate-400 mr-2" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onKeyDown={handleSearchSubmit}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search sales, inventory, customers..." 
                      className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
                    />
                </div>

                {/* Quick Search Results Dropdown */}
                {showDropdown && searchQuery && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                     {hasResults ? (
                        <div className="py-2">
                           {/* Jobs Section */}
                           {previewResults.jobs.length > 0 && (
                             <div className="px-2 mb-2">
                               <h4 className="px-3 py-1 text-xs font-bold text-slate-400 uppercase">Sales</h4>
                               {previewResults.jobs.map((j: any) => (
                                 <button 
                                   key={j.id}
                                   onClick={() => { navigate(`/sales/${j.saleType === 'Credit' ? 'credit' : 'cash'}`); setShowDropdown(false); }}
                                   className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg text-sm flex items-center gap-2 group"
                                 >
                                   <Printer size={14} className="text-slate-400 group-hover:text-blue-500"/>
                                   <div className="flex-1 truncate">
                                      <span className="font-medium text-slate-700">{j.title}</span>
                                      <span className="text-xs text-slate-400 ml-2">#{j.invoiceNumber || j.id}</span>
                                   </div>
                                 </button>
                               ))}
                             </div>
                           )}

                           {/* Inventory Section */}
                           {previewResults.inventory.length > 0 && (
                             <div className="px-2 mb-2">
                               <h4 className="px-3 py-1 text-xs font-bold text-slate-400 uppercase">Stock</h4>
                               {previewResults.inventory.map((i: any) => (
                                 <button 
                                   key={i.id}
                                   onClick={() => { navigate('/inventory'); setShowDropdown(false); }}
                                   className="w-full text-left px-3 py-2 hover:bg-orange-50 rounded-lg text-sm flex items-center gap-2 group"
                                 >
                                   <Package size={14} className="text-slate-400 group-hover:text-orange-500"/>
                                   <div className="flex-1 truncate">
                                      <span className="font-medium text-slate-700">{i.name}</span>
                                      <span className="text-xs text-slate-400 ml-2">{i.quantity} units</span>
                                   </div>
                                 </button>
                               ))}
                             </div>
                           )}

                           {/* Customers Section */}
                           {previewResults.customers.length > 0 && (
                             <div className="px-2 mb-2">
                               <h4 className="px-3 py-1 text-xs font-bold text-slate-400 uppercase">Customers</h4>
                               {previewResults.customers.map((c: any) => (
                                 <button 
                                   key={c.id}
                                   onClick={() => { navigate('/customers'); setShowDropdown(false); }}
                                   className="w-full text-left px-3 py-2 hover:bg-indigo-50 rounded-lg text-sm flex items-center gap-2 group"
                                 >
                                   <Users size={14} className="text-slate-400 group-hover:text-indigo-500"/>
                                   <span className="font-medium text-slate-700 truncate">{c.name}</span>
                                 </button>
                               ))}
                             </div>
                           )}

                           {/* View All Link */}
                           <div className="border-t border-slate-100 pt-2 px-2 pb-1">
                              <button 
                                onClick={() => { navigate(`/search?q=${encodeURIComponent(searchQuery)}`); setShowDropdown(false); }}
                                className="w-full text-center py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg flex items-center justify-center gap-1"
                              >
                                View all matching results <ArrowRight size={14}/>
                              </button>
                           </div>
                        </div>
                     ) : (
                        <div className="p-6 text-center text-slate-400 text-sm">
                           No results found for "{searchQuery}"
                        </div>
                     )}
                  </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {/* Org Indicator (Mobile/Tablet) */}
                <div className="md:hidden flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1">
                    <Building size={14} className="text-slate-500"/>
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[100px]">{currentOrganization?.name}</span>
                </div>

                {/* Theme Picker */}
                <ThemePicker />

                {/* Global Help Button */}
                <button 
                  className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors shadow-sm"
                  onClick={() => setIsHelpOpen(true)}
                  title="Help & Documentation (F1)"
                >
                  <HelpCircle size={20} />
                </button>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button 
                      className={`relative p-2 transition-colors ${showNotifications ? 'text-blue-600 bg-blue-50 rounded-lg' : 'text-slate-400 hover:text-slate-600'}`}
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {notificationCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white ring-2 ring-white">
                                {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-semibold text-slate-900">Notifications</h3>
                                {notificationCount > 0 && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">{notificationCount} New</span>}
                            </div>
                            
                            <div className="max-h-[400px] overflow-y-auto">
                                {notificationCount === 0 && (
                                    <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center">
                                        <div className="bg-slate-50 p-3 rounded-full mb-3">
                                            <Bell size={24} className="text-slate-300"/>
                                        </div>
                                        <p>No new notifications</p>
                                        <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
                                    </div>
                                )}

                                {lowStock.length > 0 && (
                                    <div className="p-2">
                                        <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                                            <AlertTriangle size={12} className="text-orange-500"/> Low Stock ({lowStock.length})
                                        </div>
                                        {lowStock.slice(0, 3).map(item => (
                                            <div key={item.id} className="p-2 hover:bg-orange-50 rounded-lg cursor-pointer transition-colors group" onClick={() => { navigate('/inventory'); setShowNotifications(false); }}>
                                                <p className="text-sm font-medium text-slate-800 group-hover:text-orange-700">{item.name}</p>
                                                <p className="text-xs text-orange-600 font-medium">Only {item.quantity} {item.unit} left</p>
                                            </div>
                                        ))}
                                        {lowStock.length > 3 && <div className="px-2 text-xs text-slate-400">+{lowStock.length - 3} more items</div>}
                                    </div>
                                )}

                                {unpaidInvoices.length > 0 && (
                                    <div className="p-2 border-t border-slate-50">
                                        <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                                            <CreditCard size={12} className="text-red-500"/> Unpaid Invoices ({unpaidInvoices.length})
                                        </div>
                                        {unpaidInvoices.slice(0, 3).map(job => (
                                            <div key={job.id} className="p-2 hover:bg-red-50 rounded-lg cursor-pointer transition-colors group" onClick={() => { navigate('/sales/credit'); setShowNotifications(false); }}>
                                                <div className="flex justify-between">
                                                    <p className="text-sm font-medium text-slate-800 group-hover:text-red-700">{job.customerName}</p>
                                                    <p className="text-xs text-red-600 font-bold">${job.balance?.toLocaleString()}</p>
                                                </div>
                                                <p className="text-xs text-slate-500">{job.invoiceNumber} • {job.title}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {pendingJobs.length > 0 && (
                                    <div className="p-2 border-t border-slate-50">
                                        <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                                            <Clock size={12} className="text-blue-500"/> Pending Jobs ({pendingJobs.length})
                                        </div>
                                        {pendingJobs.slice(0, 3).map(job => (
                                            <div key={job.id} className="p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors group" onClick={() => { navigate('/sales/cash'); setShowNotifications(false); }}>
                                                <p className="text-sm font-medium text-slate-800 group-hover:text-blue-700">{job.title}</p>
                                                <p className="text-xs text-slate-500">{job.customerName}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Header User Profile & Dropdown */}
                <div className="relative" ref={headerMenuRef}>
                    <button 
                      onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                      className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200 overflow-hidden">
                          {currentUser?.photo ? (
                            <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover"/>
                          ) : (
                            <span>{currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}</span>
                          )}
                      </div>
                      <div className="hidden md:block text-right">
                          <p className="text-xs font-bold text-slate-700 leading-none">{currentUser?.firstName} {currentUser?.lastName}</p>
                          <p className="text-xs text-slate-500 leading-none mt-0.5">{currentUser?.role}</p>
                      </div>
                      <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isHeaderMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isHeaderMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                                <p className="text-sm font-bold text-slate-800">{currentUser?.firstName} {currentUser?.lastName}</p>
                                <p className="text-xs text-slate-500">@{currentUser?.username}</p>
                            </div>
                            <div className="p-1">
                                <button 
                                    onClick={() => { navigate('/settings'); setIsHeaderMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Settings size={16} /> Account Settings
                                </button>
                                <button 
                                    onClick={logout}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
        </main>
      </div>

      {/* Global Help Drawer */}
      <GlobalHelp isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
