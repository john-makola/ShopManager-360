
import React, { useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { 
  Search, ArrowRight, Package, Users, Truck, Printer, 
  Receipt, Briefcase, ChevronRight, FileText 
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const { jobs, inventory, customers, suppliers, serviceProducts, expenseItems, transactions } = useAppContext();

  // --- Search Logic ---
  const results = useMemo(() => {
    if (!query.trim()) return null;
    
    const lowerQ = query.toLowerCase();
    const matches = (val: any) => String(val || '').toLowerCase().includes(lowerQ);

    return {
      jobs: jobs.filter(j => 
        matches(j.title) || matches(j.customerName) || matches(j.description) || 
        matches(j.id) || matches(j.invoiceNumber) || matches(j.price) || matches(j.quantity)
      ),
      inventory: inventory.filter(i => 
        matches(i.name) || matches(i.category) || matches(i.description) || 
        matches(i.supplier) || matches(i.salePrice) || matches(i.quantity)
      ),
      customers: customers.filter(c => 
        matches(c.name) || matches(c.email) || matches(c.phone)
      ),
      suppliers: suppliers.filter(s => 
        matches(s.name) || matches(s.contactPerson) || matches(s.email) || matches(s.category)
      ),
      services: serviceProducts.filter(s => 
        matches(s.name) || matches(s.code) || matches(s.description) || matches(s.price)
      ),
      expenses: transactions.filter(t => 
        t.type === 'Expense' && (matches(t.description) || matches(t.category) || matches(t.amount))
      ),
      stockExpenses: expenseItems.filter(e => 
        matches(e.code) || matches(e.description) || matches(e.category) || matches(e.costPerUnit)
      )
    };
  }, [query, jobs, inventory, customers, suppliers, serviceProducts, expenseItems, transactions]);

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Search size={64} className="mb-4 opacity-20" />
        <h2 className="text-xl font-semibold text-slate-600">Enter a keyword to search</h2>
      </div>
    );
  }

  const totalResults = results ? 
    results.jobs.length + results.inventory.length + results.customers.length + 
    results.suppliers.length + results.services.length + results.expenses.length + results.stockExpenses.length 
    : 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Search className="text-blue-600" />
          Search Results for "{query}"
        </h1>
        <p className="text-slate-500 mt-1">Found {totalResults} matching items across all modules.</p>
      </div>

      {totalResults === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
           <p className="text-slate-500">No results found matching your criteria.</p>
           <button 
             onClick={() => navigate('/')} 
             className="mt-4 text-blue-600 hover:underline font-medium"
           >
             Return to Dashboard
           </button>
        </div>
      )}

      {/* Sales / Jobs Results */}
      {results && results.jobs.length > 0 && (
        <div className="space-y-4">
           <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
             <Printer size={20} className="text-blue-500"/> Sales & Orders ({results.jobs.length})
           </h2>
           <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                       <th className="px-4 py-3 font-semibold text-slate-500">ID / Invoice</th>
                       <th className="px-4 py-3 font-semibold text-slate-500">Title</th>
                       <th className="px-4 py-3 font-semibold text-slate-500">Customer</th>
                       <th className="px-4 py-3 font-semibold text-slate-500">Amount</th>
                       <th className="px-4 py-3 font-semibold text-slate-500">Status</th>
                       <th className="px-4 py-3 font-semibold text-slate-500 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {results.jobs.map(job => (
                       <tr key={job.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-slate-500">{job.invoiceNumber || job.id}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">
                             {job.title}
                             <div className="text-xs text-slate-400 truncate max-w-xs">{job.description}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{job.customerName}</td>
                          <td className="px-4 py-3 font-bold text-slate-700">${job.price.toLocaleString()}</td>
                          <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                          <td className="px-4 py-3 text-right">
                             <Link to={`/sales/${job.saleType === 'Credit' ? 'credit' : 'cash'}`} className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center justify-end gap-1">
                               View <ArrowRight size={12}/>
                             </Link>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Inventory Results */}
      {results && results.inventory.length > 0 && (
        <div className="space-y-4">
           <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
             <Package size={20} className="text-orange-500"/> Inventory Stock ({results.inventory.length})
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.inventory.map(item => (
                 <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-orange-200 transition-all">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs font-bold bg-orange-50 text-orange-700 px-2 py-1 rounded-full">{item.category}</span>
                           {item.quantity <= item.threshold && (
                              <span className="text-xs font-bold text-red-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Low</span>
                           )}
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">{item.name}</h3>
                        <p className="text-sm text-slate-500">{item.supplier}</p>
                    </div>
                    <div className="mt-4 flex justify-between items-end border-t border-slate-50 pt-3">
                        <div>
                           <p className="text-xs text-slate-400 uppercase">Stock</p>
                           <p className="font-bold text-slate-800">{item.quantity} {item.unit}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-xs text-slate-400 uppercase">Price</p>
                           <p className="font-bold text-green-600">${item.salePrice}</p>
                        </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* Customers Results */}
      {results && results.customers.length > 0 && (
        <div className="space-y-4">
           <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
             <Users size={20} className="text-indigo-500"/> Customers ({results.customers.length})
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.customers.map(c => (
                 <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-indigo-200 transition-all">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                       {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                       <h3 className="font-bold text-slate-800 truncate">{c.name}</h3>
                       <p className="text-xs text-slate-500 truncate">{c.phone}</p>
                       <p className="text-xs text-slate-500 truncate">{c.email}</p>
                    </div>
                    <Link to="/customers" className="p-2 text-slate-400 hover:text-indigo-600">
                       <ChevronRight size={18} />
                    </Link>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* Services Results */}
      {results && results.services.length > 0 && (
        <div className="space-y-4">
           <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
             <Briefcase size={20} className="text-purple-500"/> Services & Products ({results.services.length})
           </h2>
           <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                       <th className="px-4 py-3 font-semibold text-slate-500">Code</th>
                       <th className="px-4 py-3 font-semibold text-slate-500">Name</th>
                       <th className="px-4 py-3 font-semibold text-slate-500">Category</th>
                       <th className="px-4 py-3 font-semibold text-slate-500">Price</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {results.services.map(s => (
                       <tr key={s.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.code}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                          <td className="px-4 py-3 text-slate-600">{s.category}</td>
                          <td className="px-4 py-3 font-bold text-purple-600">${s.price.toLocaleString()}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Suppliers Results */}
      {results && results.suppliers.length > 0 && (
        <div className="space-y-4">
           <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
             <Truck size={20} className="text-teal-500"/> Suppliers ({results.suppliers.length})
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.suppliers.map(s => (
                 <div key={s.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-teal-200 transition-all">
                    <h3 className="font-bold text-slate-800">{s.name}</h3>
                    <p className="text-xs text-slate-500 mb-2">{s.category}</p>
                    <div className="text-sm text-slate-600">
                       <p>Contact: {s.contactPerson}</p>
                       <p>{s.phone}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* Expenses Results */}
      {results && (results.expenses.length > 0 || results.stockExpenses.length > 0) && (
        <div className="space-y-4">
           <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
             <Receipt size={20} className="text-red-500"/> Expenses ({results.expenses.length + results.stockExpenses.length})
           </h2>
           <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                       <th className="px-4 py-3 font-semibold text-slate-500">Type</th>
                       <th className="px-4 py-3 font-semibold text-slate-500">Description</th>
                       <th className="px-4 py-3 font-semibold text-slate-500">Category</th>
                       <th className="px-4 py-3 font-semibold text-slate-500 text-right">Amount / Cost</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {results.expenses.map(e => (
                       <tr key={e.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3"><span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">Record</span></td>
                          <td className="px-4 py-3 font-medium text-slate-800">{e.description}</td>
                          <td className="px-4 py-3 text-slate-600">{e.category}</td>
                          <td className="px-4 py-3 font-bold text-red-600 text-right">${e.amount.toLocaleString()}</td>
                       </tr>
                    ))}
                    {results.stockExpenses.map(e => (
                       <tr key={e.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3"><span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded">Stock Item</span></td>
                          <td className="px-4 py-3 font-medium text-slate-800">{e.description} <span className="text-xs text-slate-400">({e.code})</span></td>
                          <td className="px-4 py-3 text-slate-600">{e.category}</td>
                          <td className="px-4 py-3 font-bold text-orange-600 text-right">${e.costPerUnit.toLocaleString()} / unit</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

    </div>
  );
};

export default SearchResults;
