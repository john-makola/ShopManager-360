
import React, { useState } from 'react';
import { 
  X, Search, HelpCircle, LayoutDashboard, Printer, 
  Receipt, Package, Users, Truck, BarChart3, Sparkles 
} from 'lucide-react';

interface GlobalHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const HELP_SECTIONS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    content: (
      <div className="space-y-2">
        <p>The Dashboard provides a real-time overview of your business performance.</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li><strong>Quick Actions:</strong> Create new sales or invoices instantly.</li>
          <li><strong>KPI Cards:</strong> Monitor Revenue, Net Profit, Receivables, and Stock Value.</li>
          <li><strong>Financial Charts:</strong> View revenue trends and sales mix (Cash vs Credit).</li>
          <li><strong>Alerts:</strong> See low stock warnings and recent activity.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'sales',
    title: 'Sales & Invoices',
    icon: Printer,
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800">Cash & Mpesa Sales</h4>
          <p className="text-slate-600">Use this for immediate payments. Ideal for walk-ins and counter sales. Records are generated with a <strong>JC-XXXX</strong> number.</p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800">Credit Sales</h4>
          <p className="text-slate-600">Use this for corporate clients who pay later. Generates an <strong>INV-XXXX</strong> invoice and tracks outstanding balances in the Customers module.</p>
        </div>
      </div>
    )
  },
  {
    id: 'expenses',
    title: 'Expenses',
    icon: Receipt,
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800">General Expenses</h4>
          <p className="text-slate-600">Operational costs like Rent, Electricity, Salaries, and Internet. These affect your Net Profit calculation.</p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800">Stock / Inventory Expenses</h4>
          <p className="text-slate-600">Costs related to purchasing goods for resale or production (e.g., Paper, Ink). Define these items here so they can be selected when recording expenses.</p>
        </div>
      </div>
    )
  },
  {
    id: 'inventory',
    title: 'Inventory & Services',
    icon: Package,
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800">Stock Items</h4>
          <p className="text-slate-600">Physical goods (Paper, Ink, Binding Covers). Track quantities, cost prices, and set low-stock alerts.</p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800">Services</h4>
          <p className="text-slate-600">Non-tangible offerings (Design, Laminating, Printing labor). Define standard prices here to speed up sale entry.</p>
        </div>
      </div>
    )
  },
  {
    id: 'customers',
    title: 'Customers',
    icon: Users,
    content: (
      <div className="space-y-2">
        <p>Manage client profiles and credit history.</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li><strong>Good Standing:</strong> Customers with no debt.</li>
          <li><strong>Has Debt:</strong> Customers with unpaid invoices.</li>
          <li><strong>Total Spent:</strong> Lifetime value of the customer.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'suppliers',
    title: 'Suppliers',
    icon: Truck,
    content: (
      <div className="space-y-2">
        <p>Database of your vendors for paper, ink, and equipment.</p>
        <p className="text-slate-600">Keep track of contact details and categories (e.g., Paper Supplier, Machine Maintenance).</p>
      </div>
    )
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: BarChart3,
    content: (
      <div className="space-y-4">
        <p className="text-slate-600">Generate detailed analytics. Filter by Daily, Weekly, Monthly, or Yearly periods.</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li><strong>Sales Reports:</strong> Revenue trends, Cash vs Credit analysis.</li>
          <li><strong>Expense Reports:</strong> Breakdown of operational vs production costs.</li>
          <li><strong>Inventory Reports:</strong> Stock valuation and potential revenue.</li>
          <li><strong>Profit & Loss:</strong> The ultimate financial health check (Revenue - COGS - Expenses).</li>
        </ul>
      </div>
    )
  },
  {
    id: 'insights',
    title: 'Smart Insights',
    icon: Sparkles,
    content: (
      <div className="space-y-2">
        <p>AI-powered assistant powered by Google Gemini.</p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li><strong>Daily Analysis:</strong> Get a text summary of your shop's performance and bottlenecks.</li>
          <li><strong>Client Communicator:</strong> Auto-generate professional emails for job status updates.</li>
        </ul>
      </div>
    )
  }
];

export const GlobalHelp: React.FC<GlobalHelpProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  if (!isOpen) return null;

  const filteredSections = HELP_SECTIONS.filter(section => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.id.includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <HelpCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Help Center</h2>
              <p className="text-xs text-slate-500">Guides & Documentation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search topics..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {searchQuery ? (
            // Search Results View
            <div className="p-4 space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Results</h3>
              {filteredSections.length > 0 ? (
                filteredSections.map(section => (
                  <div key={section.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                      <section.icon size={18} />
                      <h4 className="font-bold">{section.title}</h4>
                    </div>
                    <div className="text-sm text-slate-600">
                      {section.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>No help topics found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          ) : (
            // Standard Accordion/List View
            <div className="flex flex-col h-full">
               <div className="p-4 grid gap-2">
                  {HELP_SECTIONS.map(section => (
                    <div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200">
                       <button 
                         onClick={() => setActiveSection(activeSection === section.id ? '' : section.id)}
                         className={`w-full flex items-center justify-between p-4 text-left font-medium transition-colors ${activeSection === section.id ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                       >
                          <div className="flex items-center gap-3">
                             <section.icon size={20} className={activeSection === section.id ? 'text-blue-600' : 'text-slate-400'}/>
                             {section.title}
                          </div>
                       </button>
                       {activeSection === section.id && (
                          <div className="p-4 bg-white text-sm border-t border-slate-100 animate-in slide-in-from-top-1 duration-200">
                             {section.content}
                          </div>
                       )}
                    </div>
                  ))}
               </div>
               
               {/* Footer Info */}
               <div className="mt-auto p-6 bg-slate-50 border-t border-slate-200 text-center">
                  <p className="text-sm text-slate-600 font-medium">Need more assistance?</p>
                  <p className="text-xs text-slate-400 mt-1">Contact your system administrator.</p>
                  <p className="text-[10px] text-slate-300 mt-4">Shop Manager 360 v1.0</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
