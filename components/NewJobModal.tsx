import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Package, Briefcase, Calculator, Search, ChevronDown, CheckCircle, Printer, Loader2, ArrowRight, Save } from 'lucide-react';
import { PrintJob, Priority, JobStatus, SubJob, Expense, ServiceProduct, ExpenseItem } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { openPDFWindow } from '../utils/pdfUtils';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: PrintJob) => void;
  initialData?: PrintJob | null;
  saleType?: 'Cash' | 'Credit';
}

export const NewJobModal: React.FC<NewJobModalProps> = ({ isOpen, onClose, onSubmit, initialData, saleType = 'Cash' }) => {
  const { customers, serviceProducts, addServiceProduct, expenseItems } = useAppContext();
  
  // --- Core Job Info ---
  const [jobNumber, setJobNumber] = useState(''); // JC-XXXX for Cash
  const [invoiceNumber, setInvoiceNumber] = useState(''); // INV-XXXX for Credit
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.NORMAL);
  const [status, setStatus] = useState<JobStatus>(JobStatus.PENDING);
  const [handledBy, setHandledBy] = useState<'In-House' | 'Out-Sourced'>('In-House');

  // --- Customer Info ---
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // --- Sales & Expenses ---
  const [subJobs, setSubJobs] = useState<SubJob[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // --- Financials ---
  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  // --- Payment ---
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Mpesa' | 'Bank'>('Cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  
  // Computed Payment Status (Derived state)
  const [paymentStatus, setPaymentStatus] = useState('Unpaid');

  // --- UI State ---
  const [focusedSubJobId, setFocusedSubJobId] = useState<string | null>(null);
  const [focusedExpenseId, setFocusedExpenseId] = useState<string | null>(null);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasReset, setHasReset] = useState(false);
  
  // Comprehensive Service Data State
  const [newServiceData, setNewServiceData] = useState({ 
    code: '',
    name: '', 
    type: 'service' as 'service' | 'product',
    category: '', 
    price: '', 
    unit: '',
    size: '',
    description: ''
  });
  
  // Keep track of the row that triggered "Add New" to autofill it later
  const [triggeringSubJobId, setTriggeringSubJobId] = useState<string | null>(null);

  // --- Calculations ---
  const totalSales = subJobs.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  
  const totalDue = Math.max(0, totalSales - discount);
  const profit = totalDue - totalExpenses;
  // Calculate commission based on selected rate (e.g., 30 means 30%)
  const commission = profit > 0 ? profit * (commissionRate / 100) : 0; 
  
  const balance = Math.max(0, totalDue - amountPaid);

  // Effect to Auto-calculate Payment Status
  useEffect(() => {
    if (balance <= 0 && totalDue > 0) {
        setPaymentStatus('Fully Paid');
    } else if (amountPaid > 0 && balance > 0) {
        setPaymentStatus('Partly Paid');
    } else {
        setPaymentStatus('Unpaid');
    }
  }, [amountPaid, totalDue, balance]);

  // Initialize form when opened
  useEffect(() => {
    if (isOpen) {
      if (initialData && !hasReset) {
        // Edit Mode
        const jobNoMatch = initialData.description.match(/Job No: (JC-\d+)/);
        setJobNumber(jobNoMatch ? jobNoMatch[1] : (initialData.id.startsWith('JC-') ? initialData.id : ''));
        setInvoiceNumber(initialData.invoiceNumber || '');
        
        setDate(initialData.createdAt.split('T')[0]);
        setDueDate(initialData.dueDate);
        setPriority(initialData.priority);
        setStatus(initialData.status);
        setHandledBy(initialData.handledBy || 'In-House');
        
        setCustomerId(initialData.customerId || '');
        setCustomerName(initialData.customerName || '');
        setCustomerPhone(initialData.customerPhone || '');
        
        setSubJobs(initialData.subJobs || []);
        setExpenses(initialData.expenses || []);
        
        setCommissionRate(initialData.commissionRate || 0);
        setDiscount(initialData.discount || 0);

        setPaymentMethod(initialData.paymentMethod || 'Cash');
        setAmountPaid(initialData.amountPaid || 0);

      } else if (!initialData || hasReset) {
        // Create Mode
        resetForm();
      }
      setShowSuccess(false);
    }
  }, [isOpen, initialData, saleType, hasReset]);

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    
    // Generate IDs based on sale type
    if (saleType === 'Cash') {
        setJobNumber(`JC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
        setInvoiceNumber('');
    } else {
        setInvoiceNumber(`INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
        setJobNumber('');
    }
    
    setDate(today);
    setDueDate(nextWeek);
    setPriority(Priority.NORMAL);
    setStatus(JobStatus.PENDING);
    setHandledBy('In-House');
    setCustomerId('');
    setCustomerName('');
    setCustomerPhone('');
    setSubJobs([{ 
      id: '1', 
      description: '', 
      size: '', 
      units: 1, 
      costPerUnit: 0, 
      total: 0 
    }]);
    setExpenses([]);
    setCommissionRate(0);
    setDiscount(0);
    setPaymentMethod('Cash');
    setAmountPaid(0);
  };

  const handleAddNewSale = () => {
    setHasReset(true);
    setShowSuccess(false);
    resetForm();
  };

  // Handle Customer Selection
  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    const selected = customers.find(c => c.id === id);
    if (selected) {
      setCustomerName(selected.name);
      setCustomerPhone(selected.phone);
    } else {
      setCustomerName('');
      setCustomerPhone('');
    }
  };

  // --- Handlers ---
  const addSubJob = () => {
    setSubJobs([
      ...subJobs, 
      { id: Math.random().toString(), description: '', size: '', units: 1, costPerUnit: 0, total: 0 }
    ]);
  };

  const updateSubJob = (id: string, field: keyof SubJob, value: any) => {
    setSubJobs(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'units' || field === 'costPerUnit') {
          updated.total = (Number(updated.units) || 0) * (Number(updated.costPerUnit) || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const fillSubJobWithService = (id: string, service: ServiceProduct) => {
    setSubJobs(prev => prev.map(item => {
      if (item.id === id) {
        const cost = service.price;
        return {
          ...item,
          description: service.name,
          size: service.size || item.size,
          costPerUnit: cost,
          total: (item.units || 1) * cost
        };
      }
      return item;
    }));
    setFocusedSubJobId(null);
  };

  const removeSubJob = (id: string) => {
    if (subJobs.length > 1) {
      setSubJobs(prev => prev.filter(item => item.id !== id));
    }
  };

  const addExpense = () => {
    setExpenses([
      ...expenses, 
      { id: Math.random().toString(), description: '', size: '', units: 1, costPerUnit: 0, total: 0 }
    ]);
  };

  const updateExpense = (id: string, field: keyof Expense, value: any) => {
    setExpenses(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'units' || field === 'costPerUnit') {
          updated.total = (Number(updated.units) || 0) * (Number(updated.costPerUnit) || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const fillExpenseWithItem = (id: string, item: ExpenseItem) => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id === id) {
        return {
          ...exp,
          description: item.description,
          size: item.size || exp.size,
          costPerUnit: item.costPerUnit,
          total: (exp.units || 1) * item.costPerUnit,
        };
      }
      return exp;
    }));
    setFocusedExpenseId(null);
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  // --- New Service Creation ---
  const handleOpenAddService = (subJobId: string) => {
    setTriggeringSubJobId(subJobId);
    // Pre-fill name if user typed something
    const currentDesc = subJobs.find(s => s.id === subJobId)?.description || '';
    setNewServiceData({ 
      code: '',
      name: currentDesc, 
      type: 'product',
      category: 'Printing', 
      price: '', 
      unit: 'pcs',
      size: '',
      description: ''
    });
    setIsAddServiceModalOpen(true);
    setFocusedSubJobId(null); // Close dropdown
  };

  const handleSaveNewService = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newServiceData.name || !newServiceData.price || !newServiceData.category) return;

    const newService: ServiceProduct = {
      id: Math.random().toString(36).substr(2, 9),
      code: newServiceData.code || `NEW-${Math.floor(Math.random()*1000)}`,
      name: newServiceData.name,
      type: newServiceData.type,
      category: newServiceData.category,
      price: parseFloat(newServiceData.price),
      unit: newServiceData.unit || 'unit',
      size: newServiceData.size,
      description: newServiceData.description,
      createdAt: new Date().toISOString()
    };

    addServiceProduct(newService);
    
    // Auto-select for the row that triggered it
    if (triggeringSubJobId) {
      fillSubJobWithService(triggeringSubJobId, newService);
    }
    
    setIsAddServiceModalOpen(false);
    setTriggeringSubJobId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate appropriate title/description based on sale type
    const baseTitle = subJobs[0]?.description || 'Order';
    const generatedTitle = `${baseTitle} - ${customerName}`;
    const descriptionPrefix = saleType === 'Credit' ? `Invoice No: ${invoiceNumber}` : `Job No: ${jobNumber}`;

    const job: PrintJob = {
      id: (initialData?.id && !hasReset) ? initialData.id : Math.random().toString(36).substr(2, 9),
      customerId: customerId || customerName || 'Walk-in',
      customerName,
      customerPhone,
      title: (initialData?.title && !hasReset) ? initialData.title : generatedTitle,
      description: `${descriptionPrefix}. Contains ${subJobs.length} items.`,
      status: status, 
      priority,
      serviceType: subJobs[0]?.description || 'General',
      quantity: subJobs.reduce((acc, s) => acc + Number(s.units), 0),
      price: totalDue, // Use the net total after discount
      cost: totalExpenses,
      dueDate: dueDate || date,
      createdAt: (initialData?.createdAt && !hasReset) ? initialData.createdAt : new Date().toISOString(),
      handledBy: handledBy,
      subJobs,
      expenses,
      paymentStatus,
      amountPaid,
      balance,
      
      // New fields
      saleType: saleType as 'Cash' | 'Credit',
      invoiceNumber: saleType === 'Credit' ? invoiceNumber : undefined,
      commissionRate,
      discount,
      paymentMethod
    };
    
    onSubmit(job);
    setIsSaving(false);
    setShowSuccess(true);
  };

  const handlePrint = () => {
    const docTitle = saleType === 'Credit' ? 'INVOICE' : 'RECEIPT';
    const docNumber = saleType === 'Credit' ? invoiceNumber : jobNumber;
    
    // 80mm thermal receipt HTML layout
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle} #${docNumber}</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body { 
              font-family: 'Courier New', monospace; 
              width: 72mm; 
              margin: 0 auto; 
              padding: 4mm;
              font-size: 12px;
              line-height: 1.2;
              color: #000;
            }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
            .shop-name { font-size: 16px; font-weight: bold; text-transform: uppercase; }
            .shop-info { font-size: 10px; margin-bottom: 4px; }
            .doc-title { font-weight: bold; margin-top: 6px; font-size: 14px; }
            
            .section { margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .label { font-weight: bold; }
            
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 8px; }
            th { text-align: left; border-bottom: 1px solid #000; padding: 2px 0; }
            td { vertical-align: top; padding: 2px 0; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            
            .totals { font-size: 12px; }
            .grand-total { font-weight: bold; font-size: 14px; border-top: 1px solid #000; border-bottom: 1px solid #000; margin: 4px 0; padding: 4px 0; }
            
            .footer { text-align: center; font-size: 10px; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="shop-name">Shop Manager 360</div>
            <div class="shop-info">Professional Printing & Design</div>
            <div class="shop-info">Tel: +254 700 000 000</div>
            <div class="doc-title">${docTitle}</div>
          </div>

          <div class="section">
            <div class="row"><span>No:</span> <strong>${docNumber}</strong></div>
            <div class="row"><span>Date:</span> <span>${date}</span></div>
            <div class="row"><span>Due:</span> <span>${dueDate}</span></div>
          </div>

          <div class="section">
            <div><strong>To:</strong> ${customerName}</div>
            ${customerPhone ? `<div>Tel: ${customerPhone}</div>` : ''}
            <div style="margin-top: 4px;">
               <strong>Pay Method:</strong> ${paymentMethod}<br/>
               <strong>Status:</strong> ${paymentStatus}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 45%">Item</th>
                <th style="width: 15%" class="text-center">Qty</th>
                <th style="width: 20%" class="text-right">Price</th>
                <th style="width: 20%" class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${subJobs.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td class="text-center">${item.units}</td>
                  <td class="text-right">${item.costPerUnit.toLocaleString()}</td>
                  <td class="text-right">${item.total.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="row"><span>Subtotal:</span> <span>${totalSales.toLocaleString()}</span></div>
            ${discount > 0 ? `<div class="row"><span>Discount:</span> <span>-${discount.toLocaleString()}</span></div>` : ''}
            
            <div class="row grand-total">
               <span>TOTAL:</span> <span>${totalDue.toLocaleString()}</span>
            </div>
            
            <div class="row"><span>Paid (${paymentMethod}):</span> <span>${amountPaid.toLocaleString()}</span></div>
            <div class="row"><span>Balance:</span> <span>${balance.toLocaleString()}</span></div>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Served by: ${handledBy}</p>
          </div>
        </body>
      </html>
    `;
    
    openPDFWindow(html);
  };

  const handleClose = () => {
    setHasReset(false); // Reset internal state
    onClose();
  }

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200 relative">
        
        {/* Success Overlay */}
        {showSuccess && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Saved Successfully!</h2>
                <p className="text-slate-500 mb-8">{saleType === 'Credit' ? 'Invoice' : 'Sale'} has been recorded.</p>
                
                <div className="flex gap-4">
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 rounded-xl shadow-sm text-slate-700 font-bold hover:bg-slate-50 transition-all hover:scale-105"
                    >
                        <Printer size={20} /> Print Receipt
                    </button>
                    
                    <button 
                        onClick={handleAddNewSale}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md font-bold hover:bg-blue-700 transition-all hover:scale-105"
                    >
                        <Plus size={20} /> Add New {saleType === 'Credit' ? 'Invoice' : 'Sale'}
                    </button>
                    
                    <button 
                        onClick={handleClose}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                        Dashboard <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
           <div>
               <h3 className={`text-xl font-bold bg-clip-text text-transparent ${saleType === 'Credit' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-green-600 to-emerald-600'}`}>
                 {initialData && !hasReset ? 'Edit ' : 'New '} {saleType === 'Credit' ? 'Credit Invoice' : 'Cash Sale'}
               </h3>
               <p className="text-xs text-slate-500">
                 {initialData && !hasReset ? 'Update details below.' : `Create a new ${saleType.toLowerCase()} order.`}
               </p>
           </div>
           <div className="flex items-center gap-2">
             <button 
               onClick={handlePrint}
               className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
               title="Print Preview"
             >
               <Printer size={20} />
             </button>
             <button onClick={handleClose} className="text-slate-400 hover:text-red-500 transition-colors bg-slate-100 rounded-full p-2 hover:bg-red-50">
               <X size={20} />
             </button>
           </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Section 1: Job Info */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Sales Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Dynamic Number Field */}
              {saleType === 'Credit' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Invoice Number</label>
                  <input 
                    type="text" 
                    value={invoiceNumber} 
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm font-mono text-purple-700"
                    readOnly={!!(initialData && !hasReset)}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Job Number</label>
                  <input 
                    type="text" 
                    value={jobNumber} 
                    onChange={e => setJobNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-mono text-green-700"
                    readOnly={!!(initialData && !hasReset)}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  readOnly={!!(initialData && !hasReset)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Due Date</label>
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-semibold text-slate-500 mb-1">Select Customer</label>
                   <select 
                     value={customerId}
                     onChange={(e) => handleCustomerSelect(e.target.value)}
                     className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                   >
                     <option value="">-- Manual Entry --</option>
                     {customers.map(c => (
                       <option key={c.id} value={c.id}>{c.name}</option>
                     ))}
                   </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Name *</label>
                  <input 
                    required
                    type="text" 
                    value={customerName} 
                    onChange={e => {
                        setCustomerName(e.target.value);
                        if (customerId) setCustomerId('');
                    }}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Phone</label>
                <input 
                  type="text" 
                  value={customerPhone} 
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+1 234 567 890"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Handled By</label>
                <select 
                  value={handledBy}
                  onChange={e => setHandledBy(e.target.value as 'In-House' | 'Out-Sourced')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="In-House">In-House</option>
                  <option value="Out-Sourced">Out-Sourced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Priority</label>
                <select 
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value={Priority.NORMAL}>Normal</option>
                  <option value={Priority.URGENT}>Urgent</option>
                  <option value={Priority.EXPRESS}>Express</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                <select 
                  value={status}
                  onChange={e => setStatus(e.target.value as JobStatus)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  {Object.values(JobStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Sales & Expenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             
             {/* Sales Items */}
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-visible z-20">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                   <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider flex items-center gap-2">
                     <Package size={16}/> Sales Items
                   </h4>
                   <button type="button" onClick={addSubJob} className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                     <Plus size={14}/> Add Item
                   </button>
                </div>
                
                <div className="space-y-3 flex-1">
                  {subJobs.map((item, index) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                       <div className="flex gap-2 mb-2 relative">
                          <div className="flex-1 relative">
                              <input 
                                placeholder="Description (Search Service)"
                                className="w-full px-2 py-1 pr-8 border border-slate-200 rounded text-sm focus:border-blue-400 focus:outline-none"
                                value={item.description}
                                onChange={e => updateSubJob(item.id, 'description', e.target.value)}
                                onFocus={() => setFocusedSubJobId(item.id)}
                                onBlur={() => setTimeout(() => setFocusedSubJobId(null), 200)}
                              />
                              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                              {focusedSubJobId === item.id && (
                                <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 z-[100] max-h-60 overflow-y-auto">
                                   {serviceProducts.filter(p => p.name.toLowerCase().includes(item.description.toLowerCase())).length > 0 ? (
                                     serviceProducts.filter(p => p.name.toLowerCase().includes(item.description.toLowerCase())).map(service => (
                                       <button
                                         key={service.id}
                                         type="button"
                                         className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm flex justify-between items-center"
                                         onClick={(e) => {
                                            e.preventDefault();
                                            fillSubJobWithService(item.id, service);
                                         }}
                                       >
                                         <span className="font-medium">{service.name}</span>
                                         <span className="text-xs text-slate-500">${service.price}</span>
                                       </button>
                                     ))
                                   ) : (
                                     <div className="px-3 py-2 text-xs text-slate-400">No matching services</div>
                                   )}
                                   <button
                                      type="button"
                                      className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 text-blue-600 text-xs font-bold border-t border-slate-100 flex items-center gap-1"
                                      onMouseDown={(e) => {
                                        e.preventDefault(); // Prevent blur
                                        handleOpenAddService(item.id);
                                      }}
                                   >
                                     <Plus size={12} /> Add New Service/Product
                                   </button>
                                </div>
                              )}
                          </div>
                          
                          <input 
                            placeholder="Size"
                            className="w-20 px-2 py-1 border border-slate-200 rounded text-sm"
                            value={item.size}
                            onChange={e => updateSubJob(item.id, 'size', e.target.value)}
                          />
                       </div>
                       <div className="flex gap-2 items-center">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">Qty</span>
                            <input 
                              type="number"
                              className="w-16 px-2 py-1 border border-slate-200 rounded text-sm"
                              value={item.units}
                              onChange={e => updateSubJob(item.id, 'units', e.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">@</span>
                            <input 
                              type="number"
                              className="w-20 px-2 py-1 border border-slate-200 rounded text-sm"
                              value={item.costPerUnit}
                              onChange={e => updateSubJob(item.id, 'costPerUnit', e.target.value)}
                            />
                          </div>
                          <div className="flex-1 text-right font-bold text-slate-700">
                             ${item.total.toFixed(2)}
                          </div>
                          {subJobs.length > 1 && (
                            <button type="button" onClick={() => removeSubJob(item.id)} className="text-red-400 hover:text-red-600 p-1">
                              <Trash2 size={14}/>
                            </button>
                          )}
                       </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                   <span className="text-sm text-slate-500">Gross Sales</span>
                   <span className="text-lg font-bold text-green-600">${totalSales.toFixed(2)}</span>
                </div>
             </div>

             {/* Expenses */}
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full z-10 overflow-visible">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                   <h4 className="text-sm font-bold text-orange-700 uppercase tracking-wider flex items-center gap-2">
                     <Briefcase size={16}/> Expenses
                   </h4>
                   <button type="button" onClick={addExpense} className="text-xs bg-orange-50 text-orange-700 hover:bg-orange-100 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                     <Plus size={14}/> Add Expense
                   </button>
                </div>
                
                <div className="space-y-3 flex-1">
                  {expenses.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-sm italic">No expenses recorded</div>
                  )}
                  {expenses.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                       <div className="flex gap-2 mb-2 relative">
                          <div className="flex-1 relative">
                              <input 
                                placeholder="Item / Material"
                                className="w-full px-2 py-1 pr-8 border border-slate-200 rounded text-sm focus:border-orange-400 focus:outline-none"
                                value={item.description}
                                onChange={e => updateExpense(item.id, 'description', e.target.value)}
                                onFocus={() => setFocusedExpenseId(item.id)}
                                onBlur={() => setTimeout(() => setFocusedExpenseId(null), 200)}
                              />
                              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                              {focusedExpenseId === item.id && (
                                <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 z-[100] max-h-48 overflow-y-auto">
                                    {expenseItems.filter(e => 
                                        e.description.toLowerCase().includes(item.description.toLowerCase()) || 
                                        e.code.toLowerCase().includes(item.description.toLowerCase())
                                    ).length > 0 ? (
                                        expenseItems.filter(e => 
                                            e.description.toLowerCase().includes(item.description.toLowerCase()) || 
                                            e.code.toLowerCase().includes(item.description.toLowerCase())
                                        ).map(expItem => (
                                            <button
                                                key={expItem.id}
                                                type="button"
                                                className="w-full text-left px-3 py-2 hover:bg-orange-50 text-sm flex justify-between items-center border-b border-slate-50 last:border-0"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    fillExpenseWithItem(item.id, expItem);
                                                }}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-700">{expItem.description}</span>
                                                    <span className="text-[10px] text-slate-400">{expItem.code} • {expItem.category}</span>
                                                </div>
                                                <span className="text-xs font-bold text-orange-600">
                                                    ${expItem.costPerUnit.toLocaleString()}
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-xs text-slate-400 italic">No matching items found</div>
                                    )}
                                </div>
                              )}
                          </div>
                          <input 
                            placeholder="Supplier"
                            className="w-1/3 px-2 py-1 border border-slate-200 rounded text-sm"
                            value={item.supplier || ''}
                            onChange={e => updateExpense(item.id, 'supplier', e.target.value)}
                          />
                       </div>
                       <div className="flex gap-2 items-center">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">Qty</span>
                            <input 
                              type="number"
                              className="w-16 px-2 py-1 border border-slate-200 rounded text-sm"
                              value={item.units}
                              onChange={e => updateExpense(item.id, 'units', e.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">@</span>
                            <input 
                              type="number"
                              className="w-20 px-2 py-1 border border-slate-200 rounded text-sm"
                              value={item.costPerUnit}
                              onChange={e => updateExpense(item.id, 'costPerUnit', e.target.value)}
                            />
                          </div>
                          <div className="flex-1 text-right font-bold text-slate-700">
                             ${item.total.toFixed(2)}
                          </div>
                          <button type="button" onClick={() => removeExpense(item.id)} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 size={14}/>
                          </button>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                   <span className="text-sm text-slate-500">Total Expenses</span>
                   <span className="text-lg font-bold text-orange-600">${totalExpenses.toFixed(2)}</span>
                </div>
             </div>
          </div>

          {/* Section 3: Summary & Payment */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
             {/* Sales Summary */}
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wider mb-2">Sales Summary</h4>
                
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600">Total Sale</span>
                        <span className="font-medium">${totalSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600">Total Expense</span>
                        <span className="font-medium text-orange-600">-${totalExpenses.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600">Discount</span>
                        <div className="flex items-center gap-1">
                            <span className="text-slate-400 text-xs">$</span>
                            <input 
                                type="number" 
                                value={discount}
                                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 text-right border border-slate-200 rounded text-sm focus:border-purple-300 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <div className="flex flex-col">
                            <span className="text-slate-600">Commission</span>
                            <select 
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(Number(e.target.value))}
                                className="text-[10px] text-purple-600 bg-transparent outline-none cursor-pointer hover:underline"
                            >
                                <option value={0}>0%</option>
                                <option value={20}>20%</option>
                                <option value={30}>30%</option>
                                <option value={40}>40%</option>
                            </select>
                        </div>
                        <span className="font-medium text-purple-600">${commission.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                        <span className="font-bold text-slate-800">Total Due</span>
                        <span className="font-bold text-lg text-slate-800">${totalDue.toFixed(2)}</span>
                    </div>
                </div>
             </div>

             {/* Payment Details */}
             <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">Payment</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                   <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-2">Payment Method</label>
                      <div className="flex gap-4">
                         {['Cash', 'Mpesa', 'Bank'].map((method) => (
                            <label key={method} className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-colors w-full">
                               <input 
                                 type="radio" 
                                 name="paymentMethod"
                                 checked={paymentMethod === method}
                                 onChange={() => setPaymentMethod(method as any)}
                                 className="text-blue-600 focus:ring-blue-500"
                               />
                               <span className="text-sm font-medium text-slate-700">{method}</span>
                            </label>
                         ))}
                      </div>
                   </div>

                   {/* Total Due */}
                   <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Total Due (Auto)</label>
                      <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800">
                         ${totalDue.toFixed(2)}
                      </div>
                   </div>

                   {/* Amount Paid */}
                   <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Amount Paid (Input)</label>
                      <div className="flex gap-2">
                          <input 
                            type="number"
                            value={amountPaid}
                            onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                      </div>
                   </div>

                   {/* Balance Due */}
                   <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Balance Due (Auto)</label>
                      <div className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                         ${balance.toFixed(2)}
                      </div>
                   </div>

                   {/* Payment Status */}
                   <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Status (Auto)</label>
                      <div className={`w-full px-3 py-2 border rounded-lg text-sm font-bold flex items-center gap-2
                        ${paymentStatus === 'Fully Paid' ? 'bg-green-50 border-green-200 text-green-700' : 
                          paymentStatus === 'Partly Paid' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                          'bg-slate-50 border-slate-200 text-slate-600'}`}>
                         {paymentStatus === 'Fully Paid' && <CheckCircle size={16}/>}
                         {paymentStatus}
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 sticky bottom-0">
           <button 
             onClick={handleClose}
             className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-colors text-sm"
           >
             Cancel
           </button>
           <button 
             onClick={handleSubmit}
             disabled={isSaving}
             className={`px-6 py-2 text-white rounded-lg font-medium shadow-sm transition-colors text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${saleType === 'Credit' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}`}
           >
             {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
             {isSaving ? 'Saving...' : 'Save'}
           </button>
        </div>

      </div>
    </div>
    
    {/* Add New Service Nested Modal */}
    {isAddServiceModalOpen && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
           <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0">
             <h3 className="text-lg font-bold text-slate-800">Add New Service / Product</h3>
             <button onClick={() => setIsAddServiceModalOpen(false)} className="text-slate-400 hover:text-red-500">
               <X size={18} />
             </button>
           </div>
           <form onSubmit={handleSaveNewService} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Type *</label>
                <select
                  value={newServiceData.type}
                  onChange={(e) => setNewServiceData({ ...newServiceData, type: e.target.value as "service" | "product" })}
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
                  value={newServiceData.code}
                  onChange={(e) => setNewServiceData({ ...newServiceData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Name *</label>
                <input
                  required
                  placeholder="e.g. Business Cards"
                  value={newServiceData.name}
                  onChange={(e) => setNewServiceData({ ...newServiceData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Category *</label>
                <input
                  required
                  placeholder="e.g. Printing"
                  value={newServiceData.category}
                  onChange={(e) => setNewServiceData({ ...newServiceData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Size</label>
                    <input
                      placeholder="e.g. A4"
                      value={newServiceData.size}
                      onChange={(e) => setNewServiceData({ ...newServiceData, size: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Unit</label>
                    <input
                      placeholder="e.g. pcs, hour"
                      value={newServiceData.unit}
                      onChange={(e) => setNewServiceData({ ...newServiceData, unit: e.target.value })}
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
                  value={newServiceData.price}
                  onChange={(e) => setNewServiceData({ ...newServiceData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Description</label>
                <textarea
                  placeholder="Additional details..."
                  value={newServiceData.description}
                  onChange={(e) => setNewServiceData({ ...newServiceData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                  rows={3}
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 mt-2"
              >
                Save & Add Item
              </button>
           </form>
        </div>
      </div>
    )}
    </>
  );
};