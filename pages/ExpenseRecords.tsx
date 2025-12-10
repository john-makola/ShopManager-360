
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Transaction, Supplier } from '../types';
import { Plus, Search, Filter, Calendar, DollarSign, CreditCard, Banknote, Smartphone, LayoutList, LayoutGrid, Download, Printer, Upload, X, Info, Edit, Trash2, CheckCircle } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { generatePDFReport, openPDFWindow } from '../utils/pdfUtils';

const ExpenseRecords: React.FC = () => {
  const { 
    transactions, addTransaction, updateTransaction, deleteTransaction, 
    currentOrganization, suppliers, addSupplier 
  } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Expanded Form State
  const initialFormState = {
    expenseNo: '',
    supplierId: '',
    newSupplierName: '',
    saveSupplier: false,
    date: new Date().toISOString().split('T')[0],
    item: '',
    description: '',
    category: '',
    units: '1',
    costPerUnit: '',
    total: 0,
    paymentAmount: '',
    balance: 0,
    datePaid: new Date().toISOString().split('T')[0],
    dateDue: '',
    paymentMethod: 'Cash' as 'Cash' | 'Card' | 'Bank' | 'M-PESA'
  };

  const [formData, setFormData] = useState(initialFormState);

  const expenseCategories = ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Maintenance', 'Marketing', 'Logistics', 'Other'];

  // Determine Payment Status String
  const getPaymentStatus = () => {
      // Small tolerance for floating point errors
      if (formData.total > 0 && formData.balance <= 0.01) return 'Fully Paid';
      if (parseFloat(formData.paymentAmount) > 0 && formData.balance > 0) return 'Partially Paid';
      return 'Unpaid';
  };

  const paymentStatus = getPaymentStatus();

  // Auto-generate Expense No
  useEffect(() => {
      if (isModalOpen && !editingTransaction && !showSuccess) {
          setFormData(prev => ({
              ...prev,
              expenseNo: `EXP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
          }));
      }
  }, [isModalOpen, editingTransaction, showSuccess]);

  // Calculations: Total and Balance
  useEffect(() => {
      const units = parseFloat(formData.units) || 0;
      const cost = parseFloat(formData.costPerUnit) || 0;
      const total = units * cost;
      
      const paid = parseFloat(formData.paymentAmount) || 0;
      
      setFormData(prev => ({ 
          ...prev, 
          total, 
          balance: Math.max(0, total - paid) 
      }));
  }, [formData.units, formData.costPerUnit, formData.paymentAmount]);

  const handleOpenAddModal = () => {
      setEditingTransaction(null);
      setFormData(initialFormState);
      setShowSuccess(false);
      setIsModalOpen(true);
  };

  const handleOpenEditModal = (transaction: Transaction) => {
      setEditingTransaction(transaction);
      // Attempt to parse back details from transaction description/fields
      setFormData({
          ...initialFormState,
          expenseNo: transaction.referenceId || 'EXP-????',
          item: transaction.description.split(' - ')[0] || transaction.description,
          description: transaction.description.split(' - ')[1] || '',
          category: transaction.category,
          date: transaction.date,
          supplierId: transaction.supplierId || '',
          total: transaction.amount, 
          costPerUnit: transaction.amount.toString(),
          paymentAmount: transaction.amount.toString(),
          paymentMethod: transaction.paymentMethod
      });
      setShowSuccess(false);
      setIsModalOpen(true);
  };

  const handleClose = () => {
      setIsModalOpen(false);
      setShowSuccess(false);
  };

  const handleAddNew = () => {
      setEditingTransaction(null);
      setFormData(initialFormState);
      // Generate new number
      setFormData(prev => ({
          ...prev,
          expenseNo: `EXP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
      }));
      setShowSuccess(false);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item || !formData.costPerUnit || !formData.category) return;

    // 1. Handle Supplier Creation
    let finalSupplierId = formData.supplierId;
    if (!finalSupplierId && formData.newSupplierName) {
        const newSup: Omit<Supplier, 'organizationId'> = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.newSupplierName,
            contactPerson: '', email: '', phone: '', category: 'Service Provider',
            address: ''
        };
        if (formData.saveSupplier) {
            addSupplier(newSup);
        }
        finalSupplierId = newSup.id;
    }

    // 2. Construct Description with details
    // We store the full item name + description. 
    // Balance info is appended for visibility in the simple transaction list.
    const balanceNote = formData.balance > 0 ? ` [Due: KSh ${formData.balance.toLocaleString()}]` : '';
    const fullDescription = `${formData.item}${formData.description ? ` - ${formData.description}` : ''}${balanceNote}`;

    // 3. Save Transaction
    if (editingTransaction) {
        const updatedTransaction: Transaction = {
            ...editingTransaction,
            description: fullDescription,
            category: formData.category,
            amount: parseFloat(formData.paymentAmount) || 0,
            date: formData.datePaid || formData.date,
            paymentMethod: formData.paymentMethod,
            supplierId: finalSupplierId,
            referenceId: formData.expenseNo
        };
        updateTransaction(updatedTransaction);
    } else {
        const newTransaction: Omit<Transaction, 'organizationId'> = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'Expense',
            category: formData.category,
            amount: parseFloat(formData.paymentAmount) || 0, // Records actual cash flow
            date: formData.datePaid || formData.date,
            description: fullDescription,
            paymentMethod: formData.paymentMethod,
            supplierId: finalSupplierId,
            referenceId: formData.expenseNo
        };
        addTransaction(newTransaction);
    }

    setShowSuccess(true);
  };

  const handlePrintCurrent = () => {
      const supplierName = formData.newSupplierName || suppliers.find(s => s.id === formData.supplierId)?.name || 'N/A';
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Expense Voucher ${formData.expenseNo}</title>
            <style>
              body { font-family: 'Courier New', monospace; padding: 20px; max-width: 80mm; margin: 0 auto; font-size: 12px; }
              .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .total { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px; }
              .footer { text-align: center; margin-top: 15px; font-size: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h3>EXPENSE VOUCHER</h3>
              <p>${currentOrganization?.name || 'Shop Manager 360'}</p>
            </div>
            <div class="row"><span>Voucher No:</span> <strong>${formData.expenseNo}</strong></div>
            <div class="row"><span>Date:</span> <span>${formData.date}</span></div>
            <div class="row"><span>Payee:</span> <span>${supplierName}</span></div>
            <hr style="border: 0; border-top: 1px dashed #000; margin: 5px 0;" />
            <div class="row"><span>Category:</span> <span>${formData.category}</span></div>
            <div class="row"><span>Item:</span> <span>${formData.item}</span></div>
            <div class="row"><span>Description:</span> <span>${formData.description || '-'}</span></div>
            <div class="row total"><span>Amount Paid:</span> <span>KSh ${Number(formData.paymentAmount).toLocaleString()}</span></div>
            <div class="row"><span>Method:</span> <span>${formData.paymentMethod}</span></div>
            ${formData.balance > 0 ? `<div class="row" style="color:red;"><span>Balance Due:</span> <span>KSh ${formData.balance.toLocaleString()}</span></div>` : ''}
            <div class="footer"><p>Authorized Signature: _________________</p></div>
          </body>
        </html>
      `;
      openPDFWindow(html);
  };

  const handleDelete = (id: string) => {
      if (window.confirm("Are you sure you want to delete this expense record?")) {
          deleteTransaction(id);
      }
  };

  const handleExport = () => exportToCSV(transactions.filter(t => t.type === 'Expense'), 'Expenses_Log');
  const handlePrint = () => {
      const expenses = transactions.filter(t => t.type === 'Expense');
      const content = `
        <h3>Expense Log</h3>
        <table>
          <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
          <tbody>
            ${expenses.map(e => `<tr><td>${e.date}</td><td>${e.description}</td><td>${e.category}</td><td>-KSh ${e.amount}</td></tr>`).join('')}
          </tbody>
        </table>
      `;
      const html = generatePDFReport({ 
          title: 'Expense Records', 
          content,
          organization: currentOrganization
      });
      openPDFWindow(html);
  };

  // Filter Transactions
  const expenses = transactions.filter(t => t.type === 'Expense');
  const filteredExpenses = expenses.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.referenceId && t.referenceId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  const renderBoardView = () => (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredExpenses.map(expense => (
             <div key={expense.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group relative">
                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                     <button onClick={() => handleOpenEditModal(expense)} className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit size={14}/></button>
                     <button onClick={() => handleDelete(expense.id)} className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={14}/></button>
                 </div>
                 <div className="flex justify-between items-start mb-4">
                     <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">{expense.date}</span>
                     <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">{expense.category}</span>
                 </div>
                 <h3 className="font-bold text-slate-800 text-lg mb-1">{expense.description.split(' [Due')[0]}</h3>
                 {expense.referenceId && <p className="text-xs text-slate-400 font-mono mb-2">{expense.referenceId}</p>}
                 
                 <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                     <span className="flex items-center gap-1">{expense.paymentMethod === 'Cash' ? <Banknote size={12}/> : <CreditCard size={12}/>} {expense.paymentMethod}</span>
                 </div>
                 <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                     <span className="text-xs text-slate-400 uppercase font-bold">Paid</span>
                     <span className="text-xl font-bold text-red-600">-KSh {expense.amount.toLocaleString()}</span>
                 </div>
                 {expense.description.includes('[Due:') && (
                     <div className="mt-2 text-right text-xs font-bold text-orange-600">
                         {expense.description.match(/\[Due:.*?\]/)?.[0]}
                     </div>
                 )}
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
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Ref No</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Description</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Method</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Paid Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExpenses.length === 0 ? (
               <tr>
                 <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                   No expenses recorded found.
                 </td>
               </tr>
            ) : (
              filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50 group">
                  <td className="px-6 py-4 text-sm text-slate-600">{expense.date}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{expense.referenceId || '-'}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                      {expense.description.split(' [Due')[0]}
                      {expense.description.includes('[Due:') && (
                          <span className="ml-2 text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                              {expense.description.match(/\[Due:.*?\]/)?.[0].replace('[','').replace(']','')}
                          </span>
                      )}
                  </td>
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
                  <td className="px-6 py-4 font-bold text-red-600">
                    -KSh {expense.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEditModal(expense)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                              <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(expense.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                              <Trash2 size={16} />
                          </button>
                      </div>
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
                onClick={handleOpenAddModal}
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
                 <h3 className="text-2xl font-bold text-slate-800">KSh {totalExpenses.toLocaleString()}</h3>
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
                    KSh {expenses.filter(t => t.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] relative overflow-hidden">
            
            {showSuccess && (
                <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    
                    <div className="relative z-10 flex flex-col items-center max-w-md text-center p-8">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 animate-in zoom-in duration-500">
                            <CheckCircle className="w-10 h-10 text-white" strokeWidth={3} />
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
                            Saved Successfully!
                        </h2>
                        <p className="text-slate-400 text-lg mb-8">
                            Transaction recorded. Expense updated.
                        </p>
                        
                        <div className="flex flex-col w-full gap-3">
                            <button onClick={handlePrintCurrent} className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg group">
                                <Printer size={20} className="text-blue-600 group-hover:scale-110 transition-transform" /> Print Voucher
                            </button>
                            
                            <div className="flex gap-3 mt-2">
                                <button onClick={handleAddNew} className="flex-1 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                                    <Plus size={20} /> Add New
                                </button>
                                <button onClick={handleClose} className="flex-1 py-3 bg-transparent text-slate-400 border border-slate-700 rounded-xl font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">{editingTransaction ? 'Edit Expense' : 'Record General Expense'}</h3>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                 <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveExpense} className="p-6 overflow-y-auto flex-1 space-y-6">
               {/* Expense Details */}
               <div className="grid grid-cols-2 gap-6">
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expense No.</label>
                       <input disabled value={formData.expenseNo} className="w-full px-3 py-2 border bg-slate-100 rounded-lg text-sm text-slate-500" />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                       <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                   </div>
               </div>

               {/* Supplier / Payee Section */}
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Payee / Supplier</label>
                   <div className="grid grid-cols-2 gap-4">
                       <select 
                          value={formData.supplierId} 
                          onChange={e => setFormData({...formData, supplierId: e.target.value, newSupplierName: ''})} 
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                       >
                           <option value="">-- Select Payee --</option>
                           {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                       </select>
                       <input 
                          placeholder="Or enter new name" 
                          value={formData.newSupplierName}
                          onChange={e => setFormData({...formData, newSupplierName: e.target.value, supplierId: ''})}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                       />
                   </div>
                   {formData.newSupplierName && (
                       <label className="flex items-center gap-2 mt-2 cursor-pointer">
                           <input type="checkbox" checked={formData.saveSupplier} onChange={e => setFormData({...formData, saveSupplier: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                           <span className="text-sm text-slate-600">Save to Supplier List</span>
                       </label>
                   )}
               </div>

               {/* Item Details */}
               <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2">
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expense Item / Service</label>
                       <input 
                          required
                          placeholder="e.g. Rent Payment, Internet Bill" 
                          value={formData.item}
                          onChange={e => setFormData({...formData, item: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg text-sm" 
                       />
                   </div>
                   <div className="col-span-2">
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                       <input 
                          placeholder="Additional details (e.g. Month of October)" 
                          value={formData.description} 
                          onChange={e => setFormData({...formData, description: e.target.value})} 
                          className="w-full px-3 py-2 border rounded-lg text-sm" 
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                       <select 
                          required
                          value={formData.category} 
                          onChange={e => setFormData({...formData, category: e.target.value})} 
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                       >
                           <option value="">Select Category...</option>
                           {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                   </div>
               </div>

               {/* Cost Calculation */}
               <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Units (e.g. Months)</label>
                       <input type="number" required value={formData.units} onChange={e => setFormData({...formData, units: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cost</label>
                       <input type="number" required value={formData.costPerUnit} onChange={e => setFormData({...formData, costPerUnit: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total</label>
                       <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-800">
                           KSh {formData.total.toLocaleString()}
                       </div>
                   </div>
               </div>

               {/* Office Record / Payment */}
               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                   <div className="flex justify-between items-center border-b border-blue-200 pb-2 mb-3">
                       <h4 className="text-sm font-bold text-blue-800">Office Record</h4>
                       <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                           paymentStatus === 'Fully Paid' ? 'bg-green-100 text-green-700' :
                           paymentStatus === 'Partially Paid' ? 'bg-orange-100 text-orange-700' :
                           'bg-red-100 text-red-700'
                       }`}>
                           {paymentStatus}
                       </span>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                       {formData.balance > 0 && (
                           <div className="col-span-2">
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date Due</label>
                               <input type="date" value={formData.dateDue} onChange={e => setFormData({...formData, dateDue: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white border-red-300" />
                           </div>
                       )}
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Amount</label>
                           <input 
                              type="number" 
                              value={formData.paymentAmount} 
                              onChange={e => setFormData({...formData, paymentAmount: e.target.value})} 
                              className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                           />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Balance</label>
                           <div className={`w-full px-3 py-2 border rounded-lg text-sm font-bold ${formData.balance > 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white border-slate-200 text-slate-400'}`}>
                               KSh {formData.balance.toLocaleString()}
                           </div>
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date Paid</label>
                           <input type="date" value={formData.datePaid} onChange={e => setFormData({...formData, datePaid: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white" />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                           <select
                                value={formData.paymentMethod}
                                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none"
                            >
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                                <option value="Bank">Bank Transfer</option>
                                <option value="M-PESA">M-PESA</option>
                            </select>
                       </div>
                   </div>
               </div>

               <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                   <button type="button" onClick={handleClose} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                   <button 
                     type="submit"
                     className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-sm"
                   >
                     {editingTransaction ? 'Update' : 'Save Record'}
                   </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseRecords;
