
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import { ServiceProduct } from "../types";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  Briefcase,
  Search,
  Upload,
  Edit,
  Printer,
  X,
  FileText,
  Info,
  Download
} from "lucide-react";
import { generatePDFReport, openPDFWindow } from "../utils/pdfUtils";
import { exportToCSV } from "../utils/exportUtils";

const ServicesProducts = () => {
  const { serviceProducts, addServiceProduct, updateServiceProduct, deleteServiceProduct } = useAppContext();
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "service" | "product">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceProduct | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "service" as "service" | "product",
    category: "",
    price: "",
    unit: "",
    size: "",
    description: "",
  });

  // Filter Logic
  const filteredItems = serviceProducts.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === "all" || item.type === filterType;

    return matchesSearch && matchesType;
  });

  // Stats
  const stats = {
    totalServices: serviceProducts.filter((i) => i.type === "service").length,
    totalProducts: serviceProducts.filter((i) => i.type === "product").length,
    totalItems: serviceProducts.length,
  };

  // Handlers
  const handleOpenAddModal = (item?: ServiceProduct) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code || "",
        name: item.name,
        type: item.type,
        category: item.category,
        price: item.price.toString(),
        unit: item.unit,
        size: item.size || "",
        description: item.description,
      });
    } else {
      setEditingItem(null);
      setFormData({
        code: "",
        name: "",
        type: "service",
        category: "",
        price: "",
        unit: "",
        size: "",
        description: "",
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    const item: ServiceProduct = {
      id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
      code: formData.code,
      name: formData.name,
      type: formData.type,
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      unit: formData.unit || "unit",
      size: formData.size,
      description: formData.description,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
    };

    if (editingItem) {
      updateServiceProduct(item);
    } else {
      addServiceProduct(item);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteServiceProduct(id);
    }
  };

  const handleExport = () => {
    exportToCSV(serviceProducts, 'Services_Products_Catalog');
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    try {
      const text = await selectedFile.text();
      const json = JSON.parse(text);

      if (!Array.isArray(json)) {
        throw new Error("Invalid JSON format. Expected an array of items.");
      }

      let successCount = 0;

      for (const item of json) {
        // Parse price (handle ranges like "800 – 1,500" by taking average or first)
        let price = 0;
        if (item["Price (KES)"]) {
          const priceStr = String(item["Price (KES)"]);
          const numbers = priceStr.match(/\d+,?\d*/g);
          if (numbers && numbers.length > 0) {
            const prices = numbers.map((n: string) => parseFloat(n.replace(/,/g, "")));
            price = prices.length === 2 ? (prices[0] + prices[1]) / 2 : prices[0];
          }
        } else if (item.price) {
           price = parseFloat(item.price);
        }

        // Determine type
        const serviceCategories = ["Graphic Design"];
        const type = (item.Category && serviceCategories.includes(item.Category)) ? "service" : "product";

        addServiceProduct({
          id: Math.random().toString(36).substr(2, 9),
          name: item.Item || item.name || "Unknown Item",
          code: item.Code || item.code || "",
          type: item.type || type,
          category: item.Category || item.category || "Uncategorized",
          price: price,
          unit: item.unit || "unit",
          size: item.size || "",
          description: item.description || `${item.Category || "Item"} - ${item.Item || ""}`,
          createdAt: new Date().toISOString(),
        });
        successCount++;
      }

      alert(`Successfully imported ${successCount} items.`);
      setIsImportModalOpen(false);
      setSelectedFile(null);
    } catch (error: any) {
      console.error(error);
      alert("Failed to import file: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePrintPDF = () => {
    const services = filteredItems.filter((i) => i.type === "service");
    const products = filteredItems.filter((i) => i.type === "product");

    const summaryHTML = `
      <div class="totals-grid">
        <div class="total-card">
          <div class="total-label">Total Services</div>
          <div class="total-value neutral">${stats.totalServices}</div>
        </div>
        <div class="total-card">
          <div class="total-label">Total Products</div>
          <div class="total-value neutral">${stats.totalProducts}</div>
        </div>
        <div class="total-card">
          <div class="total-label">Total Items</div>
          <div class="total-value neutral">${stats.totalItems}</div>
        </div>
      </div>
    `;

    const servicesHTML = services.length > 0 ? `
      <h3 style="margin-top:20px; border-bottom:1px solid #ddd;">Services (${services.length})</h3>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Unit</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${services.map(item => `
            <tr>
              <td>${item.code || "-"}</td>
              <td><strong>${item.name}</strong></td>
              <td>${item.category}</td>
              <td class="text-right">KSh ${item.price.toLocaleString()}</td>
              <td>${item.unit}</td>
              <td>${item.description || "-"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    ` : "";

    const productsHTML = products.length > 0 ? `
      <h3 style="margin-top:20px; border-bottom:1px solid #ddd;">Products (${products.length})</h3>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Category</th>
            <th>Size</th>
            <th>Price</th>
            <th>Unit</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(item => `
            <tr>
              <td>${item.code || "-"}</td>
              <td><strong>${item.name}</strong></td>
              <td>${item.category}</td>
              <td>${item.size || "-"}</td>
              <td class="text-right">KSh ${item.price.toLocaleString()}</td>
              <td>${item.unit}</td>
              <td>${item.description || "-"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    ` : "";

    const content = summaryHTML + servicesHTML + productsHTML;
    const html = generatePDFReport({ title: "Services Catalog", content });
    openPDFWindow(html);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </button>
          <div>
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Services
                </h1>
                <button 
                    onClick={() => setShowInfo(!showInfo)} 
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                    title="About Services"
                >
                    <Info size={20} />
                </button>
            </div>
            <p className="text-slate-500">Manage your shop offerings</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrintPDF}
            className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print PDF
          </button>
          <button
            onClick={handleExport}
            className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 shadow-sm"
          >
            <Upload className="h-4 w-4" />
            Import
          </button>
          <button
            onClick={() => handleOpenAddModal()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:from-blue-700 hover:to-purple-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Item
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
                <Info size={16} /> About Services
            </h4>
            <p className="mb-3 leading-relaxed">
              Services offered by the print shop include all activities where the company uses its equipment, skills, and production processes to transform customer requirements into printed or digital output. These services rely on labor, machine time, and consumables to deliver custom print solutions. They are billed based on time, complexity, and the nature of the work rather than stock quantities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
               <div>
                  <h5 className="font-bold text-blue-900 mb-1">Digital Printing:</h5>
                  <p className="text-blue-700">Business cards, flyers, brochures, posters, receipt books</p>
               </div>
               <div>
                  <h5 className="font-bold text-blue-900 mb-1">Large Format Printing:</h5>
                  <p className="text-blue-700">Banners, canvas prints, signage, roll-ups</p>
               </div>
               <div>
                  <h5 className="font-bold text-blue-900 mb-1">Graphic Design Services:</h5>
                  <p className="text-blue-700">Branding, logo creation, layout design</p>
               </div>
               <div>
                  <h5 className="font-bold text-blue-900 mb-1">Finishing Services:</h5>
                  <p className="text-blue-700">Binding, laminating, guillotining, mounting</p>
               </div>
               <div>
                  <h5 className="font-bold text-blue-900 mb-1">Custom Printing Services:</h5>
                  <p className="text-blue-700">T-shirt printing, branded mugs, promotional printing</p>
               </div>
               <div>
                  <h5 className="font-bold text-blue-900 mb-1">Corporate Printing Services:</h5>
                  <p className="text-blue-700">Stationery sets, letterheads, envelopes, ID cards</p>
               </div>
               <div>
                  <h5 className="font-bold text-blue-900 mb-1">Other:</h5>
                  <p className="text-blue-700">Photocopying & Scanning Services</p>
               </div>
            </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-2xl font-bold text-slate-800 mb-1">{stats.totalItems}</h3>
           <p className="text-sm text-slate-500">Total Items</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-2xl font-bold text-slate-800 mb-1">{stats.totalServices}</h3>
           <p className="text-sm text-slate-500">Services</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-2xl font-bold text-slate-800 mb-1">{stats.totalProducts}</h3>
           <p className="text-sm text-slate-500">Products</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search by name, category, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="service">Services Only</option>
            <option value="product">Products Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Code</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Size</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Unit</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                       <Package size={32} className="text-slate-300"/>
                       <p>No items found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        item.type === "service" 
                          ? "bg-purple-50 text-purple-700 border-purple-100" 
                          : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}>
                        {item.type === "service" ? <Briefcase size={10} /> : <Package size={10} />}
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{item.code || "-"}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.size || "-"}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">KSh {item.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.unit}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenAddModal(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
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
              <h3 className="text-lg font-bold text-slate-800">
                {editingItem ? "Edit Item" : "Add New Item"}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveItem} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "service" | "product" })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                >
                  <option value="service">Service</option>
                  <option value="product">Product</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Code</label>
                <input
                  placeholder="e.g. BC001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Name *</label>
                <input
                  required
                  placeholder="e.g. Business Cards"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Category *</label>
                <input
                  required
                  placeholder="e.g. Printing"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Size</label>
                    <input
                      placeholder="e.g. A4"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Unit</label>
                    <input
                      placeholder="e.g. pcs, hour"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Price (KSh) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Description</label>
                <textarea
                  placeholder="Additional details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                  rows={3}
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 shadow-sm"
                >
                  {editingItem ? "Update Item" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Upload size={18} className="text-blue-600" /> Import Items
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
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                  <span className="text-sm font-medium text-blue-600 hover:underline">Click to upload JSON</span>
                  <p className="text-xs text-slate-400 mt-1">{selectedFile ? selectedFile.name : "or drag and drop"}</p>
                </label>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800">
                <strong>Expected Format:</strong> Array of objects with Category, Code, Item, Price (KES).
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
                  {uploading ? "Importing..." : "Import Data"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesProducts;
