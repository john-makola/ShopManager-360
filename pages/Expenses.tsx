
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ExpenseItem } from '../types';
import { Plus, Search, Filter, Edit, Trash2, Printer, Upload, Receipt, X, AlertCircle, Info } from 'lucide-react';
import { generatePDFReport, openPDFWindow } from '../utils/pdfUtils';

const Expenses: React.FC = () => {
  const { expenseItems, addExpenseItem, updateExpenseItem, deleteExpenseItem } = useAppContext();
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showInfo, setShowInfo] = useState(false);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ExpenseItem | null>(null);
  
  // Print State
  const [printStartDate, setPrintStartDate] = useState('');
  const [printEndDate, setPrintEndDate] = useState('');

  // Import State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    category: '',
    size: '',
    units: '1',
    costPerUnit: '',
  });

  const categories = [
    'DIGITAL PRINTING',
    'LARGE FORMAT PRINTING',
    'COPY SERVICES',
    'BRANDING SERVICES',
    'GRAPHIC DESIGN SERVICES EXPENSES',
    'FINISHING SERVICES EXPENSES',
    'PACKAGING SOLUTIONS EXPENSES',
    'SPECIALIZED PRINTING EXPENSES'
  ];

  const prefixMap: Record<string, string> = {
    "DIGITAL PRINTING": "DP",
    "LARGE FORMAT PRINTING": "LF",
    "COPY SERVICES": "CS",
    "BRANDING SERVICES": "BS",
    "GRAPHIC DESIGN SERVICES EXPENSES": "GD",
    "FINISHING SERVICES EXPENSES": "FS",
    "PACKAGING SOLUTIONS EXPENSES": "PS",
    "SPECIALIZED PRINTING EXPENSES": "SP",
  };

  // Helper to auto-generate code
  const generateCode = (category: string) => {
    const prefix = prefixMap[category] || "XX";
    const existingCodes = expenseItems
      .filter(e => e.category === category && e.code.startsWith(prefix))
      .map(e => {
        const match = e.code.match(/\d+$/);
        return match ? parseInt(match[0]) : 0;
      });
    
    const nextNum = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;
    return `${prefix}${String(nextNum).padStart(3, "0")}`;
  };

  // Filtering
  const filteredItems = expenseItems.filter(item => {
    const matchesSearch = 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Handlers
  const handleOpenAddModal = (item?: ExpenseItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        description: item.description,
        category: item.category,
        size: item.size,
        units: String(item.units),
        costPerUnit: String(item.costPerUnit)
      });
    } else {
      setEditingItem(null);
      const defaultCat = categories[0];
      setFormData({
        code: generateCode(defaultCat),
        description: '',
        category: defaultCat,
        size: '',
        units: '1',
        costPerUnit: ''
      });
    }
    setIsAddModalOpen(true);
  };

  const handleCategoryChange = (newCategory: string) => {
    // If we are editing, don't auto-regenerate code unless user clears it? 
    // Usually code shouldn't change on edit easily. 
    // But for new items, we regenerate.
    if (!editingItem) {
        setFormData({
            ...formData,
            category: newCategory,
            code: generateCode(newCategory)
        });
    } else {
        setFormData({
            ...formData,
            category: newCategory
        });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.costPerUnit) {
        alert("Please fill in required fields.");
        return;
    }

    const itemData: ExpenseItem = {
      id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
      code: formData.code,
      description: formData.description,
      category: formData.category,
      size: formData.size,
      units: Number(formData.units) || 1,
      costPerUnit: Number(formData.costPerUnit) || 0,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString()
    };

    if (editingItem) {
      updateExpenseItem(itemData);
    } else {
      addExpenseItem(itemData);
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteClick = (item: ExpenseItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
        deleteExpenseItem(itemToDelete.id);
        setItemToDelete(null);
        setIsDeleteModalOpen(false);
    }
  };

  // Import Handler
  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    
    try {
        const text = await selectedFile.text();
        const json = JSON.parse(text);
        
        if (json.categories) {
            let count = 0;
            // Iterate structure provided in example
            // categories -> KEY -> expenses -> KEY -> obj
            Object.values(json.categories).forEach((catData: any) => {
                const expenses = catData.expenses || {};
                Object.entries(expenses).forEach(([code, expData]: [string, any]) => {
                    addExpenseItem({
                        id: Math.random().toString(36).substr(2, 9),
                        code: code,
                        description: expData.description,
                        category: catData.name || "Imported", // Simplified extraction
                        size: expData.size || "",
                        units: expData.units || 1,
                        costPerUnit: expData.costPerUnit || 0,
                        createdAt: new Date().toISOString()
                    });
                    count++;
                });
            });
            alert(`Imported ${count} items successfully.`);
        } else {
            alert("Invalid JSON format.");
        }
    } catch (e) {
        console.error(e);
        alert("Failed to parse JSON file.");
    } finally {
        setUploading(false);
        setIsImportModalOpen(false);
        setSelectedFile(null);
    }
  };

  // Print Handler
  const handlePrintPDF = () => {
    if (!printStartDate || !printEndDate) {
        alert("Please select a date range.");
        return;
    }

    const start = new Date(printStartDate);
    const end = new Date(printEndDate);
    end.setHours(23, 59, 59);

    const reportItems = expenseItems.filter(item => {
        const d = new Date(item.createdAt);
        return d >= start && d <= end;
    });

    if (reportItems.length === 0) {
        alert("No items found in date range.");
        return;
    }

    // Group by category
    const byCategory = reportItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, ExpenseItem[]>);

    const totalCost = reportItems.reduce((sum, i) => sum + (i.units * i.costPerUnit), 0);

    let htmlContent = `
        <div class="totals-grid">
            <div class="total-card">
                <div class="total-label">Total Items</div>
                <div class="total-value neutral">${reportItems.length}</div>
            </div>
            <div class="total-card">
                <div class="total-label">Categories</div>
                <div class="total-value neutral">${Object.keys(byCategory).length}</div>
            </div>
            <div class="total-card">
                <div class="total-label">Total Cost Value</div>
                <div class="total-value negative">$${totalCost.toLocaleString()}</div>
            </div>
        </div>
    `;

    Object.entries(byCategory).forEach(([cat, itemsVal]) => {
        const items = itemsVal as ExpenseItem[];
        const catTotal = items.reduce((sum, i) => sum + (i.units * i.costPerUnit), 0);
        htmlContent += `
            <h3 style="margin-top: 20px; color: #475569; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">${cat}</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 15%">Code</th>
                        <th style="width: 35%">Description</th>
                        <th style="width: 15%">Size</th>
                        <th style="width: 10%">Qty</th>
                        <th style="width: 10%">Cost</th>
                        <th style="width: 15%" class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(i => `
                        <tr>
                            <td>${i.code}</td>
                            <td>${i.description}</td>
                            <td>${i.size}</td>
                            <td>${i.units}</td>
                            <td>${i.costPerUnit.toFixed(2)}</td>
                            <td class="text-right">${(i.units * i.costPerUnit).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                    <tr style="background: #f8fafc; font-weight: bold;">
                        <td colspan="5" class="text-right">Category Total</td>
                        <td class="text-right">$${catTotal.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        `;
    });

    const fullHtml = generatePDFReport({
        title: "Stock / Inventory Expenses Report",
        content: htmlContent,
        showDateRange: { startDate: printStartDate, endDate: printEndDate }
    });

    openPDFWindow(fullHtml);
    setIsPrintModalOpen(false);
  };

  // Stats
  const totalItems = expenseItems.length;
  const uniqueCategories = new Set(expenseItems.map(i => i.category)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Stock / Inventory Expenses</h1>
            <button 
                onClick={() => setShowInfo(!showInfo)} 
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title="What are Stock Expenses?"
            >
                <Info size={20} />
            </button>
           </div>
           <p className="text-slate-500">Manage costs for raw materials and inventory purchases.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsPrintModalOpen(true)}
             className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 shadow-sm"
           >
             <Printer size={16} /> Print Report
           </button>
           <button 
             onClick={() => setIsImportModalOpen(true)}
             className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 shadow-sm"
           >
             <Upload size={16} /> Import
           </button>
           <button 
             onClick={() => handleOpenAddModal()}
             className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:from-orange-700 hover:to-red-700 shadow-sm transition-all"
           >
             <Plus size={16} /> Add Item
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
                <Info size={16} /> About Stock / Inventory Expenses
            </h4>
            <p className="mb-3">These are expenses directly tied to buying inventory for resale or raw materials used for production (e.g., paper, ink for a print shop).</p>
            <p className="font-bold mb-1">Examples:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 list-disc list-inside text-blue-700">
                <li>Buying products for resale</li>
                <li>Buying ink, paper, and materials used to fulfill customer print orders</li>
                <li>Freight and transport directly tied to stock delivery</li>
                <li>Packaging used for goods sold</li>
            </ul>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-sm font-medium text-slate-500">Total Items</p>
               <h3 className="text-3xl font-bold text-slate-800">{totalItems}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
               <Receipt size={24} />
            </div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-sm font-medium text-slate-500">Active Categories</p>
               <h3 className="text-3xl font-bold text-slate-800">{uniqueCategories}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
               <Filter size={24} />
            </div>
         </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
         <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by code, description or category..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
         </div>
         <div className="w-full md:w-64">
            <select 
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
               <option value="all">All Categories</option>
               {categories.map(cat => (
                 <option key={cat} value={cat}>{cat}</option>
               ))}
            </select>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Code</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Description</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Size</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Units</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Cost/Unit</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredItems.length === 0 ? (
                     <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                           <div className="flex flex-col items-center gap-2">
                               <Receipt size={32} className="text-slate-300"/>
                               <p>No expense items match your search.</p>
                           </div>
                        </td>
                     </tr>
                  ) : (
                     filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4 font-mono text-xs text-slate-600 font-bold">{item.code}</td>
                           <td className="px-6 py-4 font-medium text-slate-800">{item.description}</td>
                           <td className="px-6 py-4 text-sm">
                              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {item.category}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-sm text-slate-600">{item.size}</td>
                           <td className="px-6 py-4 text-sm text-slate-600">{item.units}</td>
                           <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                              KSh {item.costPerUnit.toLocaleString()}
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                 <button 
                                   onClick={() => handleOpenAddModal(item)}
                                   className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                 >
                                    <Edit size={16} />
                                 </button>
                                 <button 
                                   onClick={() => handleDeleteClick(item)}
                                   className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                 >
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
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    {editingItem ? <Edit size={18} className="text-orange-600"/> : <Plus size={18} className="text-orange-600"/>}
                    {editingItem ? 'Edit Item' : 'Add New Item'}
                 </h3>
                 <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <X size={20} />
                 </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category *</label>
                    <select 
                      value={formData.category}
                      onChange={e => handleCategoryChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                    >
                       {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                       ))}
                    </select>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expense Code (Auto)</label>
                    <input 
                      type="text" 
                      value={formData.code}
                      readOnly
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-sm font-mono"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Item description"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Size / Unit</label>
                       <input 
                         type="text" 
                         placeholder="e.g. A4"
                         value={formData.size}
                         onChange={e => setFormData({...formData, size: e.target.value})}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Default Units</label>
                       <input 
                         type="number" 
                         value={formData.units}
                         onChange={e => setFormData({...formData, units: e.target.value})}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                       />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cost Per Unit *</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={formData.costPerUnit}
                      onChange={e => setFormData({...formData, costPerUnit: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                    />
                 </div>
                 
                 <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg text-sm font-medium hover:from-orange-700 hover:to-red-700 shadow-sm transition-colors"
                    >
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                  <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Expense Item?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete <span className="font-bold text-slate-700">{itemToDelete?.description}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-center">
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                  >
                    Delete Item
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <Upload size={18} className="text-blue-600"/> Import Expenses
                  </h3>
                  <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-red-500">
                     <X size={20} />
                  </button>
               </div>
               <div className="p-6 space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                     <input 
                       type="file" 
                       accept=".json" 
                       onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                       className="hidden" 
                       id="file-upload"
                     />
                     <label htmlFor="file-upload" className="cursor-pointer block">
                        <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                        <span className="text-sm font-medium text-blue-600 hover:underline">Click to upload JSON</span>
                        <p className="text-xs text-slate-400 mt-1">{selectedFile ? selectedFile.name : "or drag and drop"}</p>
                     </label>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-xs text-orange-800">
                     <strong>Note:</strong> JSON file must follow the specific schema with categories and nested expenses.
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                     <button 
                       onClick={() => setIsImportModalOpen(false)}
                       className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium"
                     >
                       Cancel
                     </button>
                     <button 
                       onClick={handleFileUpload}
                       disabled={!selectedFile || uploading}
                       className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                     >
                       {uploading ? 'Importing...' : 'Import Data'}
                     </button>
                  </div>
               </div>
           </div>
        </div>
      )}

      {/* Print Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <Printer size={18} className="text-slate-600"/> Generate Report
                  </h3>
                  <button onClick={() => setIsPrintModalOpen(false)} className="text-slate-400 hover:text-red-500">
                     <X size={20} />
                  </button>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                    <input 
                      type="date"
                      value={printStartDate}
                      onChange={e => setPrintStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                    <input 
                      type="date"
                      value={printEndDate}
                      onChange={e => setPrintEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                     <button 
                       onClick={() => setIsPrintModalOpen(false)}
                       className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium"
                     >
                       Cancel
                     </button>
                     <button 
                       onClick={handlePrintPDF}
                       className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900"
                     >
                       Generate PDF
                     </button>
                  </div>
               </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Expenses;