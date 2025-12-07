
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Transaction } from '../types';
import { Plus, Search, Filter, Calendar, DollarSign, CreditCard, Banknote, Smartphone, LayoutList, LayoutGrid, Download, Printer, Upload, X, Info } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { generatePDFReport, openPDFWindow } from '../utils/pdfUtils';

const ExpenseRecords: React.FC = () => {
  const { transactions, addTransaction } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash' as 'Cash' | 'Card' | 'Bank' | 'M-PESA'
  });

  const expenseCategories = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Maintenance', 'Marketing', 'Other'];

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.category) return;

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'Expense',
      description: formData.description,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
    };

    addTransaction(newTransaction);
    setIsModalOpen(false);
    setFormData({
      description: '',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash'
    });
  };

  const handleExport = () => exportToCSV(transactions.filter(t => t.type === 'Expense'), 'Expenses_Log');
  const handlePrint = () => {
      const expenses = transactions.filter(t => t.type === 'Expense');
      const content = `
        <h3>Expense Log</h3>
        <table>
          <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
          <tbody>
            ${expenses.map(e => `<tr><td>${e.date}</td><td>${e.description}</td><td>${e.category}</td><td>-$${e.amount}</td></tr>`).join('')}
          </tbody>
        </table>
      `;
      const html = generatePDFReport({ title: 'Expense Records', content });
      openPDFWindow(html);
  };

  // Filter Transactions
  const expenses = transactions.filter(t => t.type === 'Expense');
  const filteredExpenses = expenses.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  const renderBoardView = () => (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredExpenses.map(expense => (
             <div key={expense.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                 <div className="flex justify-between items-start mb-4">
                     <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">{expense.date}</span>
                     <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">{expense.category}</span>
                 </div>
                 <h3 className="font-bold text-slate-800 text-lg mb-2">{expense.description}</h3>
                 <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                     <span className="flex items-center gap-1">{expense.paymentMethod === 'Cash' ? <Banknote size={12}/> : <CreditCard size={12}/>} {expense.paymentMethod}</span>
                 </div>
                 <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                     <span className="text-xs text-slate-400 uppercase font-bold">Amount</span>
                     <span className="text-xl font-bold text-red-600">-${expense.amount.toLocaleString()}</span>
                 </div>
             </div>
         ))}
     </div>
  );

  const renderListView = () => (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Description</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Payment Method</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExpenses.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                   No expenses recorded found.
                 </td>
               </tr>
            ) : (
              filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600">{expense.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{expense.description}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                       {expense.paymentMethod === 'Card' && <CreditCard size={14}/>}
                       {expense.paymentMethod === 'Cash' && <Banknote size={14}/>}
                       {expense.paymentMethod === 'M-PESA' && <Smartphone size={14}/>}
                       {expense.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">
                    -${expense.amount.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">General Expenses</h1>
            <button 
                onClick={() => setShowInfo(!showInfo)} 
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title="What are General Expenses?"
            >
                <Info size={20} />
            </button>
          </div>
          <p className="text-slate-500">Track daily operational spending and overheads.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}><LayoutList size={18} /></button>
                <button onClick={() => setViewMode('board')} className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}><LayoutGrid size={18} /></button>
            </div>
            <button onClick={handlePrint} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"><Printer size={20} /></button>
            <button onClick={handleExport} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"><Download size={20} /></button>
            <button onClick={() => setIsImportModalOpen(true)} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"><Upload size={20} /></button>

            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
                <Plus size={20} /> Record Expense
            </button>
        </div>
      </div>

      {showInfo && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 text-sm text-blue-800 relative">
            <button 
                onClick={() => setShowInfo(false)} 
                className="absolute top-3 right-3 text-blue-400 hover:text-blue-700"
            >
                <X size={16} />
            </button>
            <h4 className="font-bold mb-2 flex items-center gap-2">
                <Info size={16} /> About General Expenses
            </h4>
            <p className="mb-3">These are operational costs that keep the business running but do not directly go into stock.</p>
            <p className="font-bold mb-1">Examples:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 list-disc list-inside text-blue-700">
                <li>Rent</li>
                <li>Salaries & wages</li>
                <li>Utilities (electricity, water, internet)</li>
                <li>Marketing</li>
                <li>Transport (not for stock)</li>
                <li>Office supplies</li>
                <li>Printer service & maintenance</li>
                <li>Software subscriptions</li>
                <li>Cleaning</li>
                <li>Stationery for office use</li>
            </ul>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start mb-2">
              <div>
                 <p className="text-sm font-medium text-slate-500">Total Expenses</p>
                 <h3 className="text-2xl font-bold text-slate-800">${totalExpenses.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                 <DollarSign size={20} />
              </div>
           </div>
           <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
           </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start mb-2">
              <div>
                 <p className="text-sm font-medium text-slate-500">This Month</p>
                 <h3 className="text-2xl font-bold text-slate-800">
                    ${expenses.filter(t => t.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                 </h3>
              </div>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                 <Calendar size={20} />
              </div>
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start mb-2">
              <div>
                 <p className="text-sm font-medium text-slate-500">Transaction Count</p>
                 <h3 className="text-2xl font-bold text-slate-800">{expenses.length}</h3>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                 <Filter size={20} />
              </div>
           </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {expenseCategories.map(cat => (
               <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {viewMode === 'list' ? renderListView() : renderBoardView()}

      {isImportModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Import Expenses</h3>
                    <button onClick={() => setIsImportModalOpen(false)}><X className="text-slate-400 hover:text-red-500" /></button>
                 </div>
                 <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
                    <Upload size={32} className="mx-auto text-slate-400 mb-2"/>
                    <p className="text-sm text-slate-500">Import feature simulated</p>
                 </div>
             </div>
          </div>
       )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Record Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                 <span className="text-2xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description *</label>
                  <input
                    required
                    placeholder="e.g. Office Rent, Paper Restock"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-red-500 outline-none"
                  />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category *</label>
                    <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-red-500 outline-none"
                    >
                        <option value="">Select...</option>
                        {expenseCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-red-500 outline-none"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount *</label>
                    <input
                        required
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                    <select
                        value={formData.paymentMethod}
                        onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-red-500 outline-none"
                    >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="Bank">Bank Transfer</option>
                        <option value="M-PESA">M-PESA</option>
                    </select>
                  </div>
               </div>

               <button 
                 type="submit"
                 className="w-full py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 mt-2"
               >
                 Save Expense
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseRecords;
