
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Package, AlertTriangle, Plus, LayoutGrid, LayoutList, Download, Printer, Upload, X, Info } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { generatePDFReport, openPDFWindow } from '../utils/pdfUtils';
import { InventoryItem } from '../types';

const Inventory: React.FC = () => {
  const { inventory } = useAppContext(); // Note: Update functions would need to be added to Context to make this fully functional for write ops
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  
  // Temporary state for the Add modal (since context update fn isn't in this snippet, we'll simulate or just show the UI)
  const [formData, setFormData] = useState({
      name: '',
      category: 'Paper',
      quantity: '',
      unit: '',
      threshold: '',
      costPrice: '',
      salePrice: '',
      supplier: ''
  });

  const handleExport = () => {
    exportToCSV(inventory, 'Inventory_Report');
  };

  const handlePrint = () => {
    const content = `
      <h3>Inventory Report</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Supplier</th>
            <th>Qty</th>
            <th>Cost Price</th>
            <th>Sale Price</th>
          </tr>
        </thead>
        <tbody>
          ${inventory.map(i => `
            <tr>
              <td>${i.name}</td>
              <td>${i.category}</td>
              <td>${i.supplier}</td>
              <td>${i.quantity} ${i.unit}</td>
              <td>$${i.costPrice}</td>
              <td>$${i.salePrice}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    const html = generatePDFReport({ title: 'Inventory List', content });
    openPDFWindow(html);
  };

  const handleImport = () => {
    if (selectedFile) {
        // Mock import logic
        alert("Import functionality simulated. In production, this would parse JSON/CSV and update the database.");
        setIsImportModalOpen(false);
        setSelectedFile(null);
    }
  };
  
  const handleSaveItem = (e: React.FormEvent) => {
      e.preventDefault();
      // In a real implementation, call addInventoryItem from context
      alert("Item saving simulated. Connect to AppContext to persist.");
      setIsAddModalOpen(false);
  };

  const renderBoardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {inventory.map(item => {
             const isLow = item.quantity <= item.threshold;
             return (
                 <div key={item.id} className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-all ${isLow ? 'border-red-200' : 'border-slate-200'}`}>
                     <div className="flex justify-between items-start mb-3">
                         <div className={`p-2 rounded-lg ${isLow ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                             <Package size={20} />
                         </div>
                         {isLow && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Low Stock</span>}
                     </div>
                     <h3 className="font-bold text-slate-800 mb-1">{item.name}</h3>
                     <p className="text-xs text-slate-500 mb-4">{item.category} • {item.supplier}</p>
                     
                     <div className="flex items-end justify-between mb-3">
                         <div>
                             <p className="text-xs text-slate-400 uppercase font-bold">In Stock</p>
                             <p className={`text-lg font-bold ${isLow ? 'text-red-600' : 'text-slate-800'}`}>
                                 {item.quantity} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                             </p>
                         </div>
                         <div className="text-right">
                             <p className="text-xs text-slate-400 uppercase font-bold">Total Value</p>
                             <p className="text-sm font-bold text-slate-700">${(item.quantity * item.costPrice).toFixed(2)}</p>
                         </div>
                     </div>
                     
                     <div className="pt-3 border-t border-slate-100 flex justify-between text-xs">
                        <div>
                            <span className="text-slate-400">Cost:</span> <span className="font-medium text-slate-700">${item.costPrice}</span>
                        </div>
                        <div>
                            <span className="text-slate-400">Sale:</span> <span className="font-medium text-green-600">${item.salePrice}</span>
                        </div>
                     </div>
                 </div>
             )
        })}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Item Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Supplier</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Quantity</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Cost Price</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Sale Price</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => {
                    const isLow = item.quantity <= item.threshold;
                    return (
                        <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                            <td className="px-6 py-4 text-slate-600">{item.category}</td>
                            <td className="px-6 py-4 text-slate-600">{item.supplier}</td>
                            <td className="px-6 py-4 font-mono text-slate-800">
                                {item.quantity} <span className="text-xs text-slate-400">{item.unit}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">${item.costPrice}</td>
                            <td className="px-6 py-4 text-green-600 font-medium">${item.salePrice}</td>
                            <td className="px-6 py-4">
                                {isLow ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                                        Low Stock
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                        In Stock
                                    </span>
                                )}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
           <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Stock Items</h1>
            <button 
                onClick={() => setShowInfo(!showInfo)} 
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title="What are Stock Items?"
            >
                <Info size={20} />
            </button>
           </div>
           <p className="text-slate-500">Track paper, ink, and consumables.</p>
         </div>
         <div className="flex flex-wrap items-center gap-2">
             <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    title="List View"
                >
                    <LayoutList size={18} />
                </button>
                <button 
                    onClick={() => setViewMode('board')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    title="Board View"
                >
                    <LayoutGrid size={18} />
                </button>
             </div>
             
             <button onClick={handlePrint} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 shadow-sm">
               <Printer size={16} /> Print
             </button>
             <button onClick={handleExport} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 shadow-sm">
               <Download size={16} /> Export
             </button>
             <button onClick={() => setIsImportModalOpen(true)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 shadow-sm">
               <Upload size={16} /> Import
             </button>

             <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
             >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Item</span>
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
                <Info size={16} /> About Stock Items
            </h4>
            <p className="mb-3 leading-relaxed">
              Stock Items are all physical goods held by the print shop for resale or for use in fulfilling customer print orders. These include raw materials, consumables, and finished products that have quantifiable units and form part of the company’s inventory. They are tracked in quantity and value to ensure accurate cost management, forecasting, and stock control.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
               <div>
                  <h5 className="font-bold text-blue-900 mb-1">Printing consumables:</h5>
                  <p className="text-blue-700">Paper (A4, A3, art paper, photo paper), toner, ink, plates</p>
               </div>
               <div>
                  <h5 className="font-bold text-blue-900 mb-1">Production materials:</h5>
                  <p className="text-blue-700">Binding materials, laminating films, PVC cards, canvas material</p>
               </div>
               <div>
                  <h5 className="font-bold text-blue-900 mb-1">Finished goods for sale:</h5>
                  <p className="text-blue-700">Notebooks, stationery, printed merchandise, banners</p>
               </div>
               <div>
                  <h5 className="font-bold text-blue-900 mb-1">Resale items:</h5>
                  <p className="text-blue-700">Diaries, envelopes, branded products, promotional items</p>
               </div>
            </div>
        </div>
       )}

       {/* KPIs */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                  <Package size={24} />
              </div>
              <div>
                  <h3 className="text-2xl font-bold text-slate-800">{inventory.length}</h3>
                  <p className="text-sm text-slate-500">Total Items</p>
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                  <AlertTriangle size={24} />
              </div>
              <div>
                  <h3 className="text-2xl font-bold text-slate-800">{inventory.filter(i => i.quantity <= i.threshold).length}</h3>
                  <p className="text-sm text-slate-500">Low Stock Alerts</p>
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-full">
                  <span className="font-bold text-xl">$</span>
              </div>
              <div>
                  <h3 className="text-2xl font-bold text-slate-800">
                      ${inventory.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0).toLocaleString()}
                  </h3>
                  <p className="text-sm text-slate-500">Total Stock Value</p>
              </div>
          </div>
       </div>

       {viewMode === 'list' ? renderListView() : renderBoardView()}

       {/* Import Modal */}
       {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Import Inventory</h3>
                  <button onClick={() => setIsImportModalOpen(false)}><X className="text-slate-400 hover:text-red-500" /></button>
               </div>
               <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center mb-4">
                   <input type="file" className="hidden" id="inv-upload" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                   <label htmlFor="inv-upload" className="cursor-pointer block">
                       <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                       <span className="text-blue-600 hover:underline text-sm font-medium">Click to upload JSON</span>
                       <p className="text-xs text-slate-400 mt-1">{selectedFile ? selectedFile.name : "or drag and drop"}</p>
                   </label>
               </div>
               <button onClick={handleImport} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">Import Data</button>
           </div>
        </div>
       )}
       
       {/* Add Item Modal */}
       {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                  <h3 className="text-lg font-bold text-slate-800">Add Stock Item</h3>
                  <button onClick={() => setIsAddModalOpen(false)}><X className="text-slate-400 hover:text-red-500" /></button>
               </div>
               
               <form onSubmit={handleSaveItem} className="space-y-4">
                  <div className="space-y-2">
                     <label className="block text-xs font-bold text-slate-500 uppercase">Item Name</label>
                     <input 
                       className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                       placeholder="e.g. A4 Bond Paper"
                     />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Category</label>
                        <select 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="Paper">Paper</option>
                            <option value="Ink">Ink</option>
                            <option value="Finishing">Finishing</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Supplier</label>
                        <input 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            value={formData.supplier}
                            onChange={e => setFormData({...formData, supplier: e.target.value})}
                        />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Quantity</label>
                        <input 
                            type="number"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            value={formData.quantity}
                            onChange={e => setFormData({...formData, quantity: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Unit</label>
                        <input 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            value={formData.unit}
                            onChange={e => setFormData({...formData, unit: e.target.value})}
                            placeholder="e.g. Reams, Boxes"
                        />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Cost Price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                            <input 
                                type="number"
                                className="w-full pl-6 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
                                value={formData.costPrice}
                                onChange={e => setFormData({...formData, costPrice: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Sale Price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                            <input 
                                type="number"
                                className="w-full pl-6 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
                                value={formData.salePrice}
                                onChange={e => setFormData({...formData, salePrice: e.target.value})}
                            />
                        </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Low Stock Threshold</label>
                        <input 
                            type="number"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            value={formData.threshold}
                            onChange={e => setFormData({...formData, threshold: e.target.value})}
                            placeholder="Alert when qty drops below..."
                        />
                  </div>

                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 mt-2">
                      Save Stock Item
                  </button>
               </form>
           </div>
        </div>
       )}
    </div>
  );
};

export default Inventory;
