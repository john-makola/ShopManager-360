
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ExpenseItem, Transaction, Supplier, InventoryItem } from '../types';
import { Plus, Search, Edit, Trash2, CheckSquare, Square, CheckCircle, Printer, X } from 'lucide-react';
import { openPDFWindow } from '../utils/pdfUtils';

const Expenses: React.FC = () => {
  const { 
    expenseItems, addExpenseItem, updateExpenseItem, deleteExpenseItem,
    suppliers, addSupplier, inventory, addInventoryItem, updateInventoryItem,
    addTransaction, currentOrganization
  } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // New Complex Form State
  const initialFormState = {
      expenseNo: '',
      supplierId: '',
      newSupplierName: '',
      saveSupplier: false,
      item: '',
      description: '',
      category: 'Stock', // Default
      orderDate: new Date().toISOString().split('T')[0],
      units: '',
      costPerUnit: '',
      total: 0,
      paymentAmount: '',
      balance: 0,
      datePaid: '',
      dateDue: '',
      status: 'Pending' as 'Pending' | 'Received',
      paymentMethod: 'Bank' as 'Cash' | 'Card' | 'Bank' | 'M-PESA'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);

  const categories = [
    'Stock',
    'Logistics',
    'Packaging',
    'Inventory Purchase'
  ];

  // Auto-generate Expense No
  useEffect(() => {
      if (isAddModalOpen && !editingItem && !showSuccess) {
          setFormData(prev => ({
              ...prev,
              expenseNo: `PO-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
          }));
      }
  }, [isAddModalOpen, editingItem, showSuccess]);

  // Calculations
  useEffect(() => {
      const units = parseFloat(formData.units) || 0;
      const cost = parseFloat(formData.costPerUnit) || 0;
      const total = units * cost;
      const paid = parseFloat(formData.paymentAmount) || 0;
      setFormData(prev => ({ ...prev, total, balance: Math.max(0, total - paid) }));
  }, [formData.units, formData.costPerUnit, formData.paymentAmount]);

  const filteredItems = expenseItems.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData(initialFormState);
    setShowSuccess(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: ExpenseItem) => {
      setEditingItem(item);
      // Map existing item to form (Simplified mapping as ExpenseItem schema is smaller than the new form)
      setFormData({
          ...initialFormState,
          item: item.description, // Assuming description holds name
          description: item.description,
          category: item.category,
          units: item.units.toString(),
          costPerUnit: item.costPerUnit.toString(),
          orderDate: item.createdAt ? item.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          // Other fields are not persisted in simple ExpenseItem schema, would require DB schema update
          // For now, we allow editing basic fields
      });
      setShowSuccess(false);
      setIsAddModalOpen(true);
  };

  const handleClose = () => {
      setIsAddModalOpen(false);
      setShowSuccess(false);
  };

  const handleAddNew = () => {
      setEditingItem(null);
      setFormData(initialFormState);
      setFormData(prev => ({
          ...prev,
          expenseNo: `PO-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
      }));
      setShowSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Handle Supplier
    let finalSupplierId = formData.supplierId;
    if (!finalSupplierId && formData.newSupplierName) {
        // Create new supplier
        const newSup: Omit<Supplier, 'organizationId'> = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.newSupplierName,
            contactPerson: '', email: '', phone: '', category: 'General'
        };
        if (formData.saveSupplier) {
            addSupplier(newSup);
        }
        finalSupplierId = newSup.id; // Or name if ID not used strictly
    }

    // 2. Handle Inventory Update if Received
    if (formData.status === 'Received') {
        const existingInv = inventory.find(i => i.name.toLowerCase() === formData.item.toLowerCase());
        if (existingInv) {
            updateInventoryItem({
                ...existingInv,
                quantity: existingInv.quantity + (parseFloat(formData.units) || 0),
                costPrice: parseFloat(formData.costPerUnit) || existingInv.costPrice // Update cost price?
            });
        }
    }

    // 3. Create Financial Transaction
    const paidAmount = parseFloat(formData.paymentAmount) || 0;
    if (paidAmount > 0) {
        addTransaction({
            id: Math.random().toString(36).substr(2, 9),
            type: 'Expense',
            category: 'Stock Purchase',
            amount: paidAmount, // Record what was paid now
            date: formData.datePaid || formData.orderDate,
            description: `Stock Purchase: ${formData.item} (${formData.units} units)`,
            paymentMethod: formData.paymentMethod, // Uses selected method
            supplierId: finalSupplierId
        });
    }

    // 4. Save to Expense Catalog (The list view)
    const itemData: ExpenseItem = {
      id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
      organizationId: editingItem?.organizationId || '',
      code: formData.expenseNo,
      description: formData.item,
      category: formData.category,
      size: '',
      units: Number(formData.units) || 1,
      costPerUnit: Number(formData.costPerUnit) || 0,
      createdAt: formData.orderDate ? new Date(formData.orderDate).toISOString() : new Date().toISOString()
    };

    if (editingItem) updateExpenseItem(itemData); else addExpenseItem(itemData);
    
    setShowSuccess(true);
  };

  const handlePrintCurrent = () => {
      const supplierName = formData.newSupplierName || suppliers.find(s => s.id === formData.supplierId)?.name || 'N/A';
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Purchase Order ${formData.expenseNo}</title>
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
              <h3>STOCK PURCHASE RECEIPT</h3>
              <p>${currentOrganization?.name || 'Shop Manager 360'}</p>
            </div>
            <div class="row"><span>PO No:</span> <strong>${formData.expenseNo}</strong></div>
            <div class="row"><span>Date:</span> <span>${formData.orderDate}</span></div>
            <div class="row"><span>Supplier:</span> <span>${supplierName}</span></div>
            <hr style="border: 0; border-top: 1px dashed #000; margin: 5px 0;" />
            <div class="row"><span>Item:</span> <span>${formData.item}</span></div>
            <div class="row"><span>Qty:</span> <span>${formData.units} units @ ${formData.costPerUnit}</span></div>
            <div class="row total"><span>Total:</span> <span>KSh ${formData.total.toLocaleString()}</span></div>
            <div class="row"><span>Paid:</span> <span>KSh ${Number(formData.paymentAmount).toLocaleString()}</span></div>
            <div class="row"><span>Balance:</span> <span>KSh ${formData.balance.toLocaleString()}</span></div>
            <div class="footer"><p>Received By: _________________</p></div>
          </body>
        </html>
      `;
      openPDFWindow(html);
  };

  const handleDelete = (id: string) => {
      if(window.confirm("Are you sure you want to delete this expense item?")) {
          deleteExpenseItem(id);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Stock Expenses</h1>
           <p className="text-slate-500">Manage inventory purchases and supplier orders.</p>
        </div>
        <button onClick={() => handleOpenAddModal()} className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-orange-700"><Plus size={16} /> Add Stock Expense</button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
         <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input placeholder="Search stock expenses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm" />
         </div>
         <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <option value="all">All Categories</option>
            {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
         </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
               <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Item / Description</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Units</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Unit Cost</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                     <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                     </td>
                     <td className="px-6 py-4 font-medium text-slate-800">{item.description} <span className="text-xs text-slate-400 block">{item.code}</span></td>
                     <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-slate-100 rounded text-slate-600 text-xs">{item.category}</span></td>
                     <td className="px-6 py-4 text-sm text-slate-600">{item.units}</td>
                     <td className="px-6 py-4 text-sm font-semibold text-slate-800">KSh {item.costPerUnit.toLocaleString()}</td>
                     <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                            <button onClick={() => handleOpenEditModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] relative overflow-hidden">
              
              {showSuccess && (
                <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    
                    <div className="relative z-10 flex flex-col items-center max-w-md text-center p-8">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 animate-in zoom-in duration-500">
                            <CheckCircle className="w-10 h-10 text-white" strokeWidth={3} />
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
                            Saved Successfully!
                        </h2>
                        <p className="text-slate-400 text-lg mb-8">
                            Transaction recorded. Inventory updated.
                        </p>
                        
                        <div className="flex flex-col w-full gap-3">
                            <button onClick={handlePrintCurrent} className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg group">
                                <Printer size={20} className="text-blue-600 group-hover:scale-110 transition-transform" /> Print Order
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
                  <h3 className="text-lg font-bold text-slate-800">Add Stock Expense</h3>
                  <button onClick={handleClose} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
                 {/* Top Section */}
                 <div className="grid grid-cols-2 gap-6">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expense No.</label>
                         <input disabled value={formData.expenseNo} className="w-full px-3 py-2 border bg-slate-100 rounded-lg text-sm text-slate-500" />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Order Date</label>
                         <input type="date" value={formData.orderDate} onChange={e => setFormData({...formData, orderDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                     </div>
                 </div>

                 {/* Supplier Section */}
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Supplier</label>
                     <div className="grid grid-cols-2 gap-4">
                         <select 
                            value={formData.supplierId} 
                            onChange={e => setFormData({...formData, supplierId: e.target.value, newSupplierName: ''})} 
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                         >
                             <option value="">-- Select Supplier --</option>
                             {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                         </select>
                         <input 
                            placeholder="Or enter new supplier name" 
                            value={formData.newSupplierName}
                            onChange={e => setFormData({...formData, newSupplierName: e.target.value, supplierId: ''})}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                         />
                     </div>
                     {formData.newSupplierName && (
                         <label className="flex items-center gap-2 mt-2 cursor-pointer">
                             <input type="checkbox" checked={formData.saveSupplier} onChange={e => setFormData({...formData, saveSupplier: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                             <span className="text-sm text-slate-600">Save to Supplier List</span>
                         </label>
                     )}
                 </div>

                 {/* Item Details */}
                 <div className="grid grid-cols-2 gap-4">
                     <div className="col-span-2">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Item (Expense)</label>
                         <input 
                            list="inventory-list" 
                            placeholder="e.g. A4 Paper Reams" 
                            required 
                            value={formData.item}
                            onChange={e => setFormData({...formData, item: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg text-sm" 
                         />
                         <datalist id="inventory-list">
                             {inventory.map(i => <option key={i.id} value={i.name} />)}
                         </datalist>
                     </div>
                     <div className="col-span-2">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                         <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                         <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                             {categories.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                     </div>
                 </div>

                 {/* Cost Calculation */}
                 <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Units Ordered</label>
                         <input type="number" required value={formData.units} onChange={e => setFormData({...formData, units: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cost Per Unit</label>
                         <input type="number" required value={formData.costPerUnit} onChange={e => setFormData({...formData, costPerUnit: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Cost</label>
                         <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-800">
                             KSh {formData.total.toLocaleString()}
                         </div>
                     </div>
                 </div>

                 {/* Office Record / Payment */}
                 <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                     <h4 className="text-sm font-bold text-orange-800 mb-3 border-b border-orange-200 pb-2">Office Record</h4>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Amount</label>
                             <input type="number" value={formData.paymentAmount} onChange={e => setFormData({...formData, paymentAmount: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Balance</label>
                             <div className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-red-600">
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
                                onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})} 
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                             >
                                 <option value="Bank">Bank Transfer</option>
                                 <option value="M-PESA">M-PESA</option>
                                 <option value="Cash">Cash</option>
                                 <option value="Card">Card</option>
                             </select>
                         </div>
                     </div>
                 </div>

                 {/* Status Checkbox */}
                 <div className="flex items-center gap-2 p-3 border border-green-200 bg-green-50 rounded-lg">
                     <button
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, status: prev.status === 'Received' ? 'Pending' : 'Received'}))}
                        className={`w-5 h-5 flex items-center justify-center rounded border ${formData.status === 'Received' ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-slate-300'}`}
                     >
                         {formData.status === 'Received' && <CheckSquare size={14} />}
                     </button>
                     <span className="text-sm font-bold text-green-800">Received (Stock will be updated)</span>
                 </div>

                 <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                    <button type="button" onClick={handleClose} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">Save Expense</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
