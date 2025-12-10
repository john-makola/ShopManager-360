
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { InventoryItem } from '../types';
import { Package, AlertTriangle, Plus, LayoutGrid, LayoutList, Download, Printer, Upload, X, Info, Edit, Trash2 } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { generatePDFReport, openPDFWindow } from '../utils/pdfUtils';

const Inventory: React.FC = () => {
  const { inventory, currentOrganization, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useAppContext();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  
  const [formData, setFormData] = useState({
      name: '', category: 'General', quantity: '', unit: '', threshold: '', costPrice: '', salePrice: '', supplier: '', image: ''
  });

  const handleExport = () => exportToCSV(inventory, 'Inventory_Report');
  const handlePrint = () => {
    const content = `
      <h3>Inventory Report</h3>
      <table>
        <thead><tr><th>Item</th><th>Category</th><th>Supplier</th><th>Qty</th><th>Cost</th><th>Sale</th></tr></thead>
        <tbody>${inventory.map(i => `<tr><td>${i.name}</td><td>${i.category}</td><td>${i.supplier}</td><td>${i.quantity} ${i.unit}</td><td>KSh ${i.costPrice}</td><td>KSh ${i.salePrice}</td></tr>`).join('')}</tbody>
      </table>
    `;
    const html = generatePDFReport({ 
        title: 'Inventory List', 
        content,
        organization: currentOrganization
    });
    openPDFWindow(html);
  };

  const handleImport = () => {
    if (selectedFile) {
        alert("Import functionality simulated.");
        setIsImportModalOpen(false);
        setSelectedFile(null);
    }
  };
  
  const handleOpenAddModal = (item?: InventoryItem) => {
      if (item) {
          setEditingItem(item);
          setFormData({
              name: item.name,
              category: item.category,
              quantity: item.quantity.toString(),
              unit: item.unit,
              threshold: item.threshold.toString(),
              costPrice: item.costPrice.toString(),
              salePrice: item.salePrice.toString(),
              supplier: item.supplier,
              image: item.image || ''
          });
      } else {
          setEditingItem(null);
          setFormData({ name: '', category: 'General', quantity: '', unit: '', threshold: '', costPrice: '', salePrice: '', supplier: '', image: '' });
      }
      setIsAddModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
      e.preventDefault();
      
      const itemData: InventoryItem = {
          id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
          organizationId: editingItem?.organizationId || '',
          name: formData.name,
          category: formData.category,
          quantity: parseFloat(formData.quantity) || 0,
          unit: formData.unit,
          threshold: parseFloat(formData.threshold) || 0,
          costPrice: parseFloat(formData.costPrice) || 0,
          salePrice: parseFloat(formData.salePrice) || 0,
          supplier: formData.supplier,
          image: formData.image
      };

      if (editingItem) {
          updateInventoryItem(itemData);
      } else {
          addInventoryItem(itemData);
      }
      
      setIsAddModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
      if (window.confirm('Are you sure you want to delete this product?')) {
          deleteInventoryItem(id);
      }
  };

  const renderBoardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {inventory.map(item => {
             const isLow = item.quantity <= item.threshold;
             return (
                 <div key={item.id} className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group ${isLow ? 'border-red-200' : 'border-slate-200'}`}>
                     <div className="h-40 bg-slate-50 relative">
                        {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Package size={48} />
                            </div>
                        )}
                        {isLow && (
                            <div className="absolute top-2 right-2 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                                <AlertTriangle size={12} /> Low Stock
                            </div>
                        )}
                        {/* Action Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={() => handleOpenAddModal(item)} className="p-2 bg-white rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => handleDeleteItem(item.id)} className="p-2 bg-white rounded-full text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 size={18} />
                            </button>
                        </div>
                     </div>
                     <div className="p-5 flex flex-col flex-1">
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 mb-1 leading-tight">{item.name}</h3>
                            <p className="text-xs text-slate-500 mb-3">{item.category} • {item.supplier}</p>
                        </div>
                        <div className="flex items-end justify-between mt-2 pt-3 border-t border-slate-100">
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold">In Stock</p>
                                <p className={`text-lg font-bold ${isLow ? 'text-red-600' : 'text-slate-800'}`}>{item.quantity} <span className="text-xs font-normal text-slate-500">{item.unit}</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 uppercase font-bold">Value</p>
                                <p className="text-sm font-bold text-slate-700">KSh {(item.quantity * item.costPrice).toFixed(0)}</p>
                            </div>
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
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase w-20">Image</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Item Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Supplier</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Quantity</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Cost</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Sale</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => {
                    const isLow = item.quantity <= item.threshold;
                    return (
                        <tr key={item.id} className="hover:bg-slate-50 group">
                            <td className="px-6 py-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                                    {item.image ? (
                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <Package size={16} />
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                            <td className="px-6 py-4 text-slate-600">{item.category}</td>
                            <td className="px-6 py-4 text-slate-600">{item.supplier}</td>
                            <td className="px-6 py-4 font-mono text-slate-800">{item.quantity} {item.unit}</td>
                            <td className="px-6 py-4 text-slate-600">KSh {item.costPrice}</td>
                            <td className="px-6 py-4 text-green-600 font-medium">KSh {item.salePrice}</td>
                            <td className="px-6 py-4">{isLow ? <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Low</span> : <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">OK</span>}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleOpenAddModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
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
           <h1 className="text-2xl font-bold text-slate-800">Products & Inventory</h1>
           <p className="text-slate-500">Track stock levels, valuation, and suppliers.</p>
         </div>
         <div className="flex flex-wrap items-center gap-2">
             <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}><LayoutList size={18} /></button>
                <button onClick={() => setViewMode('board')} className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}><LayoutGrid size={18} /></button>
             </div>
             <button onClick={handlePrint} className="p-2 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"><Printer size={16} /></button>
             <button onClick={() => handleOpenAddModal()} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"><Plus size={18} /> Add Product</button>
         </div>
       </div>

       {showInfo && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 text-sm text-blue-800 relative">
            <button onClick={() => setShowInfo(false)} className="absolute top-3 right-3 text-blue-400 hover:text-blue-700"><X size={16} /></button>
            <h4 className="font-bold mb-2 flex items-center gap-2"><Info size={16} /> About Inventory</h4>
            <p>Track all physical goods available for sale. Set low stock alerts to ensure you never run out of top-selling items.</p>
        </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Package size={24} /></div>
              <div><h3 className="text-2xl font-bold text-slate-800">{inventory.length}</h3><p className="text-sm text-slate-500">Total Products</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-full"><AlertTriangle size={24} /></div>
              <div><h3 className="text-2xl font-bold text-slate-800">{inventory.filter(i => i.quantity <= i.threshold).length}</h3><p className="text-sm text-slate-500">Low Stock Alerts</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-full"><span className="font-bold text-xl">KSh</span></div>
              <div><h3 className="text-2xl font-bold text-slate-800">KSh {inventory.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0).toLocaleString()}</h3><p className="text-sm text-slate-500">Total Stock Value</p></div>
          </div>
       </div>

       {viewMode === 'list' ? renderListView() : renderBoardView()}

       {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                  <h3 className="text-lg font-bold text-slate-800">{editingItem ? 'Edit Product' : 'Add Product'}</h3>
                  <button onClick={() => setIsAddModalOpen(false)}><X className="text-slate-400 hover:text-red-500" /></button>
               </div>
               <form onSubmit={handleSaveItem} className="space-y-4">
                  <div className="space-y-2"><label className="block text-xs font-bold text-slate-500 uppercase">Product Name</label><input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Wireless Mouse" /></div>
                  <div className="space-y-2"><label className="block text-xs font-bold text-slate-500 uppercase">Image URL (Optional)</label><input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://example.com/image.jpg" /></div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Category</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option value="General">General</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Groceries">Groceries</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Clothing">Clothing</option>
                        </select>
                    </div>
                    <div className="space-y-2"><label className="block text-xs font-bold text-slate-500 uppercase">Supplier</label><input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} placeholder="Supplier Name" /></div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><label className="block text-xs font-bold text-slate-500 uppercase">Quantity</label><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} /></div>
                    <div className="space-y-2"><label className="block text-xs font-bold text-slate-500 uppercase">Unit</label><input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="pcs" /></div>
                    <div className="space-y-2"><label className="block text-xs font-bold text-slate-500 uppercase">Low Stock</label><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.threshold} onChange={e => setFormData({...formData, threshold: e.target.value})} /></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="block text-xs font-bold text-slate-500 uppercase">Cost Price</label><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} /></div>
                    <div className="space-y-2"><label className="block text-xs font-bold text-slate-500 uppercase">Sale Price</label><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: e.target.value})} /></div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">{editingItem ? 'Update' : 'Save'}</button>
                  </div>
               </form>
           </div>
        </div>
       )}
    </div>
  );
};

export default Inventory;
