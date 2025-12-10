
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { 
  DollarSign, Users, Package, 
  TrendingUp, TrendingDown, AlertTriangle, 
  ArrowRight, Plus, CreditCard, FileText, ShoppingCart, Wallet 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, Cell, PieChart, Pie 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../components/ui/StatusBadge';
import { generatePDFReport, openPDFWindow } from '../utils/pdfUtils';

const Dashboard = () => {
  const { jobs, transactions, inventory, customers } = useAppContext();
  const navigate = useNavigate();

  // --- Calculations ---
  
  // 1. Financials (Current Month)
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const monthlyJobs = jobs.filter(j => j.createdAt.startsWith(currentMonth));
  
  // Filter for Operational Expenses only (Exclude Stock/Inventory Purchases which are Assets)
  const monthlyOpExpenses = transactions.filter(t => 
      t.type === 'Expense' && 
      t.date.startsWith(currentMonth) && 
      t.category !== 'Stock Purchase' && 
      t.category !== 'Inventory Purchase'
  );
  
  const revenue = monthlyJobs.reduce((sum, j) => sum + (j.price || 0), 0);
  
  // Expenses = General Operational Expenses + Cost of Goods Sold (Job Costs)
  const opExpensesTotal = monthlyOpExpenses.reduce((sum, t) => sum + t.amount, 0);
  const cogs = monthlyJobs.reduce((sum, j) => sum + (j.cost || 0), 0);
  
  // Net Profit = Revenue - COGS - OpEx
  const netProfit = revenue - cogs - opExpensesTotal;
  
  // 2. Receivables (Total Outstanding)
  const totalReceivables = customers.reduce((sum, c) => sum + (c.balance || 0), 0);

  // 3. Inventory
  const lowStockItems = inventory.filter(i => i.quantity <= i.threshold);
  const stockValue = inventory.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0);

  // 4. Liquid Accounts (Cash/Bank/Mpesa)
  // Logic: Sum of Income (Transactions) - Sum of Expenses (Transactions) grouped by Payment Method
  // Note: For Cash Flow, we DO include Stock Purchases, because cash actually left the account.
  const getBalanceByMethod = (method: 'Cash' | 'M-PESA' | 'Bank' | 'Card') => {
      const income = transactions
        .filter(t => t.type === 'Income' && t.paymentMethod === method)
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions
        .filter(t => t.type === 'Expense' && t.paymentMethod === method)
        .reduce((sum, t) => sum + t.amount, 0);
      return income - expense;
  };

  const accountBalances = {
      cash: getBalanceByMethod('Cash'),
      mpesa: getBalanceByMethod('M-PESA'),
      bank: getBalanceByMethod('Bank') + getBalanceByMethod('Card'), // Group Card with Bank for simplicity
  };

  // --- Chart Data Preparation ---
  // Last 7 Days Trend
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const trendData = getLast7Days().map(date => {
    const dayJobs = jobs.filter(j => j.createdAt.startsWith(date));
    
    // For Profit Trend, exclude Stock Purchases
    const dayOpExpenses = transactions.filter(t => 
        t.type === 'Expense' && 
        t.date === date && 
        t.category !== 'Stock Purchase' && 
        t.category !== 'Inventory Purchase'
    );
    
    const dayRev = dayJobs.reduce((sum, j) => sum + (j.price || 0), 0);
    const dayExp = dayOpExpenses.reduce((sum, t) => sum + t.amount, 0) + dayJobs.reduce((sum, j) => sum + (j.cost || 0), 0);
    
    return {
      date: date.slice(5), // MM-DD
      revenue: dayRev,
      expenses: dayExp, // This is Cost + OpEx
      profit: dayRev - dayExp
    };
  });

  // Sales Split Data
  const salesSplit = [
    { name: 'Cash', value: monthlyJobs.filter(j => j.saleType === 'Cash').reduce((sum, j) => sum + j.price, 0) },
    { name: 'Credit', value: monthlyJobs.filter(j => j.saleType === 'Credit').reduce((sum, j) => sum + j.price, 0) }
  ];

  const handleDownloadWorkflow = () => {
    const content = `
      <h3>System Workflow Guide</h3>
      <p>This guide explains how Shop Manager 360 handles sales, inventory, and accounting.</p>
      <ul>
        <li><strong>Inventory:</strong> Add products and set stock levels.</li>
        <li><strong>Sales:</strong> Create orders. Stock is deducted automatically. Income is recorded in transactions.</li>
        <li><strong>Customers:</strong> Track credit balances for wholesale clients.</li>
        <li><strong>Expenses:</strong> Record operational costs (Rent, Salaries) to reduce account balances.</li>
        <li><strong>Stock Purchases:</strong> Buying stock reduces Cash/Bank but does NOT lower Net Profit immediately (it's an asset). Cost is realized when items are sold (COGS).</li>
      </ul>
    `;
    const html = generatePDFReport({ 
      title: 'Shop Manager 360 - Workflow', 
      content 
    });
    openPDFWindow(html);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
          <p className="text-slate-500">Business performance summary for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleDownloadWorkflow}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors"
          >
            <FileText size={16} /> System Guide
          </button>
          <button 
            onClick={() => navigate('/sales/cash')} 
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus size={16} /> Cash Sale
          </button>
          <button 
            onClick={() => navigate('/sales/credit')} 
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 shadow-sm transition-colors"
          >
            <Plus size={16} /> Credit Sale
          </button>
        </div>
      </div>

      {/* Account Balances (Liquid Cash) - Using Theme Colors (Blue Palette) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-950 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
              <div>
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Cash in Hand</p>
                  <h3 className="text-2xl font-bold">KSh {accountBalances.cash.toLocaleString()}</h3>
              </div>
              <div className="bg-blue-900 p-2 rounded-lg"><Wallet size={24}/></div>
          </div>
          <div className="bg-blue-800 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
              <div>
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">M-PESA Balance</p>
                  <h3 className="text-2xl font-bold">KSh {accountBalances.mpesa.toLocaleString()}</h3>
              </div>
              <div className="bg-blue-700 p-2 rounded-lg"><DollarSign size={24}/></div>
          </div>
          <div className="bg-blue-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
              <div>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Bank Account</p>
                  <h3 className="text-2xl font-bold">KSh {accountBalances.bank.toLocaleString()}</h3>
              </div>
              <div className="bg-blue-500 p-2 rounded-lg"><CreditCard size={24}/></div>
          </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue - Uses Theme Primary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
           <div className="flex justify-between items-start z-10 relative">
              <div>
                 <p className="text-sm font-medium text-slate-500 mb-1">Monthly Revenue</p>
                 <h3 className="text-2xl font-bold text-slate-800">KSh {revenue.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                 <DollarSign size={24} />
              </div>
           </div>
           <div className="mt-4 flex items-center text-xs text-slate-400">
              <span className="text-blue-600 font-medium flex items-center gap-1 mr-2">
                 <TrendingUp size={14} /> +{monthlyJobs.length} sales
              </span>
              this month
           </div>
        </div>

        {/* Net Profit - Semantic Colors (Green/Red) - Kept semantic for meaning */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
           <div className="flex justify-between items-start z-10 relative">
              <div>
                 <p className="text-sm font-medium text-slate-500 mb-1">Net Profit (Est.)</p>
                 <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    KSh {netProfit.toLocaleString()}
                 </h3>
              </div>
              <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform ${netProfit >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                 {netProfit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              </div>
           </div>
           <div className="mt-4 flex items-center text-xs text-slate-400">
              Rev - COGS - OpEx
           </div>
        </div>

        {/* Receivables - Semantic Red */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
           <div className="flex justify-between items-start z-10 relative">
              <div>
                 <p className="text-sm font-medium text-slate-500 mb-1">Receivables</p>
                 <h3 className="text-2xl font-bold text-red-600">KSh {totalReceivables.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:scale-110 transition-transform">
                 <CreditCard size={24} />
              </div>
           </div>
           <div className="mt-4 flex items-center text-xs text-slate-400">
              Total outstanding credit
           </div>
        </div>

        {/* Inventory Value - Uses Theme Secondary/Orange */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
           <div className="flex justify-between items-start z-10 relative">
              <div>
                 <p className="text-sm font-medium text-slate-500 mb-1">Stock Value</p>
                 <h3 className="text-2xl font-bold text-slate-800">KSh {stockValue.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:scale-110 transition-transform">
                 <Package size={24} />
              </div>
           </div>
           <div className="mt-4 flex items-center text-xs text-slate-400">
              {inventory.length} items in stock
           </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Financial Trend */}
         <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px]">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Profit Performance (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height="100%" className="!h-[320px]">
               <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary-hue) var(--primary-sat) 50%)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary-hue) var(--primary-sat) 50%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `KSh ${val}`}/>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle"/>
                  {/* Use CSS Variable for Stroke Color */}
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary-hue) var(--primary-sat) 50%)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="expenses" name="Costs & OpEx" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>

         {/* Sales Mix */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Sales Mix (This Month)</h3>
            <div className="flex-1 min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={salesSplit}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        <Cell key="cell-0" fill="hsl(var(--primary-hue) var(--primary-sat) 50%)" />
                        <Cell key="cell-1" fill="#1e293b" />
                     </Pie>
                     <Tooltip formatter={(val: number) => `KSh ${val.toLocaleString()}`} />
                     <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center border-t border-slate-100 pt-4">
               <div>
                  <p className="text-xs text-slate-500 uppercase">Cash</p>
                  <p className="font-bold text-blue-600 text-lg">KSh {salesSplit[0].value.toLocaleString()}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-500 uppercase">Credit</p>
                  <p className="font-bold text-slate-800 text-lg">KSh {salesSplit[1].value.toLocaleString()}</p>
               </div>
            </div>
         </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Recent Sales List */}
         <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-slate-800 text-lg">Recent Sales</h3>
               <button onClick={() => navigate('/sales/cash')} className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50">
                     <tr>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Sale Ref</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                     {jobs.slice(0, 5).map(job => (
                        <tr key={job.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/sales/${job.saleType === 'Credit' ? 'credit' : 'cash'}`)}>
                           <td className="px-6 py-4">
                              <div className="font-medium text-slate-800">{job.title}</div>
                              <div className="text-xs text-slate-500">{job.invoiceNumber || job.id} • {job.createdAt.split('T')[0]}</div>
                           </td>
                           <td className="px-6 py-4 text-slate-600">{job.customerName}</td>
                           <td className="px-6 py-4"><StatusBadge status={job.status} /></td>
                           <td className="px-6 py-4 text-right font-bold text-slate-800">KSh {job.price.toLocaleString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Low Stock Alerts */}
         <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <AlertTriangle className="text-orange-500" size={20} /> Low Stock Alerts
               </h3>
               <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">{lowStockItems.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[300px] p-2 space-y-2">
               {lowStockItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">All stock levels are healthy!</div>
               ) : (
                  lowStockItems.map(item => (
                     <div key={item.id} className="p-3 bg-red-50 border border-red-100 rounded-lg flex justify-between items-center">
                        <div>
                           <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                           <p className="text-xs text-red-600 font-bold">{item.quantity} {item.unit} remaining</p>
                        </div>
                        <button 
                           onClick={() => navigate('/inventory')} 
                           className="text-xs bg-white border border-red-200 text-red-600 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                           Restock
                        </button>
                     </div>
                  ))
               )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
               <button onClick={() => navigate('/inventory')} className="text-sm font-medium text-slate-600 hover:text-slate-800 flex items-center justify-center gap-1">
                  Manage Inventory <ArrowRight size={14}/>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
