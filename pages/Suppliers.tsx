
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Supplier } from '../types';
import { Truck, Plus, Search, Phone, Mail, MapPin, LayoutList, LayoutGrid, Download, Printer, Upload, X, Trash2, List, FileText, Calendar, Edit } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { generatePDFReport, openPDFWindow } from '../utils/pdfUtils';
import { EmailGeneratorModal } from '../components/EmailGeneratorModal';

const Suppliers: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, supplierCategories, addSupplierCategory, deleteSupplierCategory, transactions, currentOrganization } = useAppContext();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Supplier>>({});
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Statement Report State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportParams, setReportParams] = useState({
      supplierId: '',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
  });

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = () => {
      setEditingSupplierId(null);
      setFormData({});
      setIsModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
      setEditingSupplierId(supplier.id);
      setFormData({
          name: supplier.name,
          category: supplier.category,
          contactPerson: supplier.contactPerson,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address
      });
      setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
      if (window.confirm('Are you sure you want to delete this supplier?')) {
          deleteSupplier(id);
      }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return;
    
    if (editingSupplierId) {
        // Update existing supplier
        const original = suppliers.find(s => s.id === editingSupplierId);
        if (original) {
            updateSupplier({
                ...original,
                name: formData.name!,
                contactPerson: formData.contactPerson || '',
                email: formData.email || '',
                phone: formData.phone || '',
                category: formData.category!,
                address: formData.address
            });
        }
    } else {
        // Add new supplier
        const newSupplier: Omit<Supplier, 'organizationId'> = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.name!,
            contactPerson: formData.contactPerson || '',
            email: formData.email || '',
            phone: formData.phone || '',
            category: formData.category!,
            address: formData.address
        };
        addSupplier(newSupplier);
    }

    setIsModalOpen(false);
    setFormData({});
    setEditingSupplierId(null);
  };

  const handleAddCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCategoryName.trim()) return;
      addSupplierCategory(newCategoryName.trim());
      setNewCategoryName('');
  };

  const handleExport = () => exportToCSV(suppliers, 'Suppliers_List');
  const handlePrint = () => {
    const content = `
        <h3>Supplier List</h3>
        <table>
          <thead><tr><th>Company</th><th>Contact</th><th>Category</th><th>Phone</th><th>Email</th></tr></thead>
          <tbody>
            ${suppliers.map(s => `<tr><td>${s.name}</td><td>${s.contactPerson}</td><td>${s.category}</td><td>${s.phone}</td><td>${s.email}</td></tr>`).join('')}
          </tbody>
        </table>
    `;
    const html = generatePDFReport({ title: 'Suppliers', content, organization: currentOrganization });
    openPDFWindow(html);
  };

  const openEmailModal = (supplier: Supplier) => {
      setEmailRecipient(supplier);
      setIsEmailModalOpen(true);
  };

  // --- Statement Generation Logic ---
  const openReportModal = (supplier: Supplier) => {
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      
      setReportParams({
          supplierId: supplier.id,
          startDate: firstDay,
          endDate: today
      });
      setIsReportModalOpen(true);
  };

  const handleGenerateStatement = (e: React.FormEvent) => {
      e.preventDefault();
      const supplier = suppliers.find(s => s.id === reportParams.supplierId);
      if (!supplier) return;

      const start = new Date(reportParams.startDate);
      const end = new Date(reportParams.endDate);
      end.setHours(23, 59, 59, 999);

      // Filter transactions linked to this supplier
      const supplierTransactions = transactions.filter(t => 
          t.supplierId === supplier.id &&
          new Date(t.date) >= start &&
          new Date(t.date) <= end
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const totalAmount = supplierTransactions.reduce((sum, t) => sum + t.amount, 0);

      const content = `
        <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                <div>
                    <h3 style="margin: 0; color: #1e293b;">Supplier Statement</h3>
                    <p style="margin: 5px 0 0; color: #64748b; font-size: 0.9em;">
                        Period: ${reportParams.startDate} to ${reportParams.endDate}
                    </p>
                </div>
                <div style="text-align: right;">
                    <h4 style="margin: 0; color: #1e293b;">${supplier.name}</h4>
                    <div style="font-size: 0.85em; color: #64748b;">
                        ${supplier.contactPerson}<br/>
                        ${supplier.phone}<br/>
                        ${supplier.email}
                    </div>
                </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="font-size: 0.8em; text-transform: uppercase; color: #64748b; font-weight: bold;">Total Transactions</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #334155;">KSh ${totalAmount.toLocaleString()}</div>
            </div>
        </div>

        <h4 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px; color: #334155;">Transaction History</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85em;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Date</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Description</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Category</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Method</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #e2e8f0;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${supplierTransactions.length === 0 
                ? '<tr><td colspan="5" style="text-align:center; padding: 20px; color: #94a3b8;">No transactions found in this period.</td></tr>'
                : supplierTransactions.map(row => `
                <tr>
                    <td style="padding: 8px; border: 1px solid #e2e8f0;">${row.date}</td>
                    <td style="padding: 8px; border: 1px solid #e2e8f0;">${row.description}</td>
                    <td style="padding: 8px; border: 1px solid #e2e8f0;">${row.category}</td>
                    <td style="padding: 8px; border: 1px solid #e2e8f0;">${row.paymentMethod}</td>
                    <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">KSh ${row.amount.toLocaleString()}</td>
                </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 30px; padding-top: 10px; font-size: 0.85em; text-align: center; color: #64748b;">
            <p>Generated by ${currentOrganization?.name || 'Shop Manager 360'} on ${new Date().toLocaleDateString()}</p>
        </div>
      `;

      const html = generatePDFReport({ 
          title: `Supplier Statement - ${supplier.name}`, 
          content,
          organization: currentOrganization
      });
      openPDFWindow(html);
      setIsReportModalOpen(false);
  };

  const renderBoardView = () => (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredSuppliers.map(supplier => (
           <div key={supplier.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 relative group">
              <div className="flex items-start justify-between mb-4">
                 <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <Truck size={20} />
                 </div>
                 <div className="flex items-center gap-1">
                    <button 
                        onClick={() => openEmailModal(supplier)} 
                        className="text-teal-600 p-1.5 hover:bg-teal-50 rounded-md transition-colors"
                        title="Send Email"
                    >
                        <Mail size={16} />
                    </button>
                    <button 
                        onClick={() => openReportModal(supplier)} 
                        className="text-slate-600 p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                        title="Generate Statement"
                    >
                        <FileText size={16} />
                    </button>
                    <button onClick={() => handleEdit(supplier)} className="text-blue-600 p-1.5 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(supplier.id)} className="text-red-600 p-1.5 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                        <Trash2 size={16} />
                    </button>
                 </div>
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1.5 rounded-full font-medium absolute top-6 right-24">
                  {supplier.category}
              </span>
              <h3 className="font-bold text-lg text-slate-800 mb-1">{supplier.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{supplier.contactPerson}</p>
              
              <div className="space-y-2 text-sm text-slate-600">
                 <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    {supplier.phone}
                 </div>
                 <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    {supplier.email}
                 </div>
                 {supplier.address && (
                    <div className="flex items-center gap-2">
                       <MapPin size={14} className="text-slate-400" />
                       {supplier.address}
                    </div>
                 )}
              </div>
           </div>
         ))}
       </div>
  );

  const renderListView = () => (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Company</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Contact Person</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Phone</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Email</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredSuppliers.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                            <td className="px-6 py-4 text-slate-600">{s.category}</td>
                            <td className="px-6 py-4 text-slate-600">{s.contactPerson}</td>
                            <td className="px-6 py-4 text-slate-600">{s.phone}</td>
                            <td className="px-6 py-4 text-slate-600">{s.email}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end items-center gap-2">
                                    <button 
                                        onClick={() => openEmailModal(s)} 
                                        className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-md transition-colors" 
                                        title="Send Email"
                                    >
                                        <Mail size={16} />
                                    </button>
                                    <button 
                                        onClick={() => openReportModal(s)} 
                                        className="text-slate-600 hover:text-slate-800 text-xs font-medium px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <FileText size={14} /> Statement
                                    </button>
                                    <button onClick={() => handleEdit(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
           <h1 className="text-2xl font-bold text-slate-800">Suppliers</h1>
           <p className="text-slate-500">Manage vendor relationships and contacts.</p>
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
                onClick={() => setIsCategoryModalOpen(true)} 
                className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-2 px-3 text-sm font-medium"
            >
                <List size={18} /> Categories
            </button>

            <button 
                onClick={handleOpenAddModal}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
                <Plus size={18} />
                Add Supplier
            </button>
         </div>
       </div>

       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
         <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search suppliers by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
         </div>
       </div>

       {viewMode === 'list' ? renderListView() : renderBoardView()}

       {isImportModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Import Suppliers</h3>
                    <button onClick={() => setIsImportModalOpen(false)}><X className="text-slate-400 hover:text-red-500" /></button>
                 </div>
                 <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
                    <Upload size={32} className="mx-auto text-slate-400 mb-2"/>
                    <p className="text-sm text-slate-500">Import feature simulated</p>
                 </div>
             </div>
          </div>
       )}

       {/* Category Management Modal */}
       {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                 <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                    <h3 className="text-lg font-bold text-slate-800">Manage Categories</h3>
                    <button onClick={() => setIsCategoryModalOpen(false)}><X className="text-slate-400 hover:text-red-500" /></button>
                 </div>
                 
                 <div className="mb-4 max-h-[300px] overflow-y-auto">
                    {supplierCategories.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No categories found.</p>
                    ) : (
                        <ul className="space-y-2">
                            {supplierCategories.map(cat => (
                                <li key={cat.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm group">
                                    <span className="text-slate-700 font-medium">{cat.name}</span>
                                    <button 
                                        onClick={() => deleteSupplierCategory(cat.id)}
                                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                 </div>

                 <form onSubmit={handleAddCategory} className="flex gap-2 pt-2 border-t border-slate-100">
                    <input 
                        type="text" 
                        placeholder="New Category Name" 
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        disabled={!newCategoryName.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        Add
                    </button>
                 </form>
             </div>
          </div>
       )}

       {/* Statement Generation Modal */}
       {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600"/> Generate Statement
                 </h3>
                 <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <X size={20} />
                 </button>
              </div>
              
              <form onSubmit={handleGenerateStatement} className="p-6 space-y-5">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Supplier</label>
                    <select 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none bg-slate-50"
                      value={reportParams.supplierId}
                      onChange={(e) => setReportParams({...reportParams, supplierId: e.target.value})}
                      disabled
                    >
                        {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                          <Calendar size={12}/> Start Date
                       </label>
                       <input 
                         type="date"
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                         value={reportParams.startDate}
                         onChange={(e) => setReportParams({...reportParams, startDate: e.target.value})}
                         required
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                          <Calendar size={12}/> End Date
                       </label>
                       <input 
                         type="date"
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                         value={reportParams.endDate}
                         onChange={(e) => setReportParams({...reportParams, endDate: e.target.value})}
                         required
                       />
                    </div>
                 </div>

                 <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-700">
                    This will generate a PDF report of all transactions recorded against this supplier for the selected period.
                 </div>

                 <div className="flex justify-end gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsReportModalOpen(false)}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center gap-2"
                    >
                      <Printer size={16} /> Generate PDF
                    </button>
                 </div>
              </form>
           </div>
        </div>
       )}

       {isModalOpen && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
               <h3 className="text-xl font-bold text-slate-800 mb-4">{editingSupplierId ? 'Edit Supplier' : 'Add Supplier'}</h3>
               <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name *</label>
                    <input 
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                      value={formData.name || ''}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category *</label>
                    <div className="flex gap-2">
                        <select 
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                            value={formData.category || ''}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="">-- Select Category --</option>
                            {supplierCategories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <button 
                            type="button"
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                            title="Manage Categories"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Person</label>
                        <input 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                        value={formData.contactPerson || ''}
                        onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                        <input 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                        value={formData.phone || ''}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                    <input 
                      type="email"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                      value={formData.email || ''}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                     <button 
                       type="button" 
                       onClick={() => { setIsModalOpen(false); setEditingSupplierId(null); setFormData({}); }}
                       className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
                     >
                       Cancel
                     </button>
                     <button 
                       type="submit" 
                       className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                     >
                       {editingSupplierId ? 'Update Supplier' : 'Save Supplier'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
       )}

       {/* Email Generator Modal */}
       <EmailGeneratorModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        recipient={emailRecipient}
        type="Supplier"
      />
    </div>
  );
};

export default Suppliers;
