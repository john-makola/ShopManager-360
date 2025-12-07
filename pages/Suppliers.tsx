import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Supplier } from '../types';
import { Truck, Plus, Search, Phone, Mail, MapPin, LayoutList, LayoutGrid, Download, Printer, Upload, X } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { generatePDFReport, openPDFWindow } from '../utils/pdfUtils';

const Suppliers: React.FC = () => {
  const { suppliers, addSupplier } = useAppContext();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Supplier>>({});
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return;
    
    const newSupplier: Supplier = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name!,
      contactPerson: formData.contactPerson || '',
      email: formData.email || '',
      phone: formData.phone || '',
      category: formData.category!,
      address: formData.address
    };

    addSupplier(newSupplier);
    setIsModalOpen(false);
    setFormData({});
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
    const html = generatePDFReport({ title: 'Suppliers', content });
    openPDFWindow(html);
  };

  const renderBoardView = () => (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredSuppliers.map(supplier => (
           <div key={supplier.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6">
              <div className="flex items-start justify-between mb-4">
                 <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <Truck size={20} />
                 </div>
                 <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-medium">
                    {supplier.category}
                 </span>
              </div>
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
                onClick={() => setIsModalOpen(true)}
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

       {isModalOpen && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
               <h3 className="text-xl font-bold text-slate-800 mb-4">Add Supplier</h3>
               <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name *</label>
                    <input 
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      value={formData.name || ''}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category *</label>
                    <input 
                      required
                      placeholder="e.g. Paper, Ink, Maintenance"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      value={formData.category || ''}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Person</label>
                        <input 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        value={formData.contactPerson || ''}
                        onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                        <input 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        value={formData.phone || ''}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                    <input 
                      type="email"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      value={formData.email || ''}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                     <button 
                       type="button" 
                       onClick={() => setIsModalOpen(false)}
                       className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
                     >
                       Cancel
                     </button>
                     <button 
                       type="submit" 
                       className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                     >
                       Save Supplier
                     </button>
                  </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
};

export default Suppliers;