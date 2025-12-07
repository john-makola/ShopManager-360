
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Customer } from '../types';
import { Users, Search, Plus, Edit, Trash2, Phone, Mail, User, DollarSign, LayoutList, LayoutGrid, Download, Printer, Upload, X } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { generatePDFReport, openPDFWindow } from '../utils/pdfUtils';

const Customers: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useAppContext();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    balance: '0',
    totalSpent: '0'
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.balance || 0), 0);

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        balance: customer.balance.toString(),
        totalSpent: customer.totalSpent.toString()
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        balance: '0',
        totalSpent: '0'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const customerData: Customer = {
      id: editingCustomer ? editingCustomer.id : Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      balance: parseFloat(formData.balance) || 0,
      totalSpent: parseFloat(formData.totalSpent) || 0
    };

    if (editingCustomer) {
      updateCustomer(customerData);
    } else {
      addCustomer(customerData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteCustomer(id);
    }
  };

  const handleExport = () => exportToCSV(customers, 'Customers_List');

  const handlePrint = () => {
      const content = `
        <h3>Customer List</h3>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Balance</th></tr></thead>
          <tbody>
            ${customers.map(c => `<tr><td>${c.name}</td><td>${c.email}</td><td>${c.phone}</td><td>$${c.balance}</td></tr>`).join('')}
          </tbody>
        </table>
      `;
      const html = generatePDFReport({ title: 'Customers', content });
      openPDFWindow(html);
  };

  const renderBoardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{customer.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${customer.balance > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {customer.balance > 0 ? 'Has Debt' : 'Good Standing'}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => handleOpenModal(customer)} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(customer.id, customer.name)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                    </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2"><Mail size={14}/> {customer.email || 'N/A'}</div>
                    <div className="flex items-center gap-2"><Phone size={14}/> {customer.phone || 'N/A'}</div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                        <p className="text-xs text-slate-400">Total Spent</p>
                        <p className="font-bold text-slate-800">${customer.totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400">Balance</p>
                        <p className={`font-bold ${customer.balance > 0 ? 'text-red-600' : 'text-slate-800'}`}>${customer.balance.toLocaleString()}</p>
                    </div>
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
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Total Spent</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Balance Due</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredCustomers.map(customer => (
                    <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <User size={16} />
                             </div>
                             <span className="font-medium text-slate-800">{customer.name}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 flex flex-col gap-1">
                             <span className="flex items-center gap-2"><Mail size={12}/> {customer.email || '-'}</span>
                             <span className="flex items-center gap-2"><Phone size={12}/> {customer.phone || '-'}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          ${customer.totalSpent.toLocaleString()}
                       </td>
                       <td className="px-6 py-4">
                          {customer.balance > 0 ? (
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ${customer.balance.toLocaleString()}
                             </span>
                          ) : (
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Good Standing
                             </span>
                          )}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                             <button onClick={() => handleOpenModal(customer)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit size={16} /></button>
                             <button onClick={() => handleDelete(customer.id, customer.name)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16} /></button>
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
          <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
          <p className="text-slate-500">Manage client profiles and credit balances.</p>
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
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
            <Plus size={18} />
            Add Customer
            </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                 <Users size={24} />
             </div>
             <div>
                 <h3 className="text-2xl font-bold text-slate-800">{customers.length}</h3>
                 <p className="text-sm text-slate-500">Total Customers</p>
             </div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-red-50 text-red-600 rounded-full">
                 <DollarSign size={24} />
             </div>
             <div>
                 <h3 className="text-2xl font-bold text-slate-800">${totalOutstanding.toLocaleString()}</h3>
                 <p className="text-sm text-slate-500">Outstanding Receivables</p>
             </div>
         </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
         <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search by name, email, or phone..."
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
                    <h3 className="text-lg font-bold text-slate-800">Import Customers</h3>
                    <button onClick={() => setIsImportModalOpen(false)}><X className="text-slate-400 hover:text-red-500" /></button>
                 </div>
                 <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
                    <Upload size={32} className="mx-auto text-slate-400 mb-2"/>
                    <p className="text-sm text-slate-500">Import feature simulated</p>
                 </div>
             </div>
          </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h3>
              <form onSubmit={handleSave} className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name *</label>
                    <input 
                      required
                      placeholder="Customer or Company Name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                       <input 
                         type="email"
                         placeholder="email@example.com"
                         value={formData.email}
                         onChange={e => setFormData({...formData, email: e.target.value})}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                       <input 
                         placeholder="+1 234..."
                         value={formData.phone}
                         onChange={e => setFormData({...formData, phone: e.target.value})}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Spent</label>
                       <input 
                         type="number"
                         value={formData.totalSpent}
                         onChange={e => setFormData({...formData, totalSpent: e.target.value})}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Opening Balance</label>
                       <input 
                         type="number"
                         value={formData.balance}
                         onChange={e => setFormData({...formData, balance: e.target.value})}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                       />
                       <p className="text-[10px] text-slate-400 mt-1">Positive value means they owe you.</p>
                    </div>
                 </div>

                 <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-2">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
                    >
                      Save Customer
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
