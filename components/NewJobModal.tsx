
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Package, Briefcase, Calculator, Search, ChevronDown, CheckCircle, Printer, Loader2, ArrowRight, Save, UserPlus, FileText, CreditCard } from 'lucide-react';
import { PrintJob, Priority, JobStatus, SubJob, Expense, ServiceProduct, ExpenseItem, Customer } from '../types';
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
  const { 
    customers, serviceProducts, addServiceProduct, expenseItems, addCustomer, currentOrganization,
    inventory, updateInventoryItem, addTransaction 
  } = useAppContext();
  
  const [jobNumber, setJobNumber] = useState(''); // ORD-XXXX
  const [invoiceNumber, setInvoiceNumber] = useState(''); // INV-XXXX
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.NORMAL);
  const [status, setStatus] = useState<JobStatus>(JobStatus.PENDING);
  const [handledBy, setHandledBy] = useState<'In-House' | 'Out-Sourced'>('In-House');

  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [saveNewCustomer, setSaveNewCustomer] = useState(false);

  const [subJobs, setSubJobs] = useState<SubJob[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Mpesa' | 'Bank'>('Cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState('Unpaid');

  const [focusedSubJobId, setFocusedSubJobId] = useState<string | null>(null);
  const [focusedExpenseId, setFocusedExpenseId] = useState<string | null>(null);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasReset, setHasReset] = useState(false);
  
  const [newServiceData, setNewServiceData] = useState({ 
    code: '', name: '', type: 'service' as 'service' | 'product', category: '', price: '', unit: '', size: '', description: ''
  });
  
  const [triggeringSubJobId, setTriggeringSubJobId] = useState<string | null>(null);

  // Unified Theme Constants - Using Blue (Primary) for both to match dashboard theming request
  const iconColor = 'text-blue-600';
  const iconBg = 'bg-blue-50';

  const totalSales = subJobs.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const totalDue = Math.max(0, totalSales - discount);
  const profit = totalDue - totalExpenses;
  const commission = profit > 0 ? profit * (commissionRate / 100) : 0; 
  const balance = Math.max(0, totalDue - amountPaid);

  useEffect(() => {
    if (balance <= 0 && totalDue > 0) {
        setPaymentStatus('Fully Paid');
    } else if (amountPaid > 0 && balance > 0) {
        setPaymentStatus('Partly Paid');
    } else {
        setPaymentStatus('Unpaid');
    }
  }, [amountPaid, totalDue, balance]);

  useEffect(() => {
    if (isOpen) {
      if (initialData && !hasReset) {
        const jobNoMatch = initialData.description.match(/Order No: (ORD-\d+)/);
        setJobNumber(jobNoMatch ? jobNoMatch[1] : (initialData.id.startsWith('ORD-') ? initialData.id : ''));
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
        setSaveNewCustomer(false);

      } else if (!initialData || hasReset) {
        resetForm();
      }
      setShowSuccess(false);
    }
  }, [isOpen, initialData, saleType, hasReset]);

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    
    if (saleType === 'Cash') {
        setJobNumber(`ORD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
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
    setSaveNewCustomer(false);
    setSubJobs([{ id: '1', description: '', size: '', units: 1, costPerUnit: 0, total: 0 }]);
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

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    const selected = customers.find(c => c.id === id);
    if (selected) {
      setCustomerName(selected.name);
      setCustomerPhone(selected.phone);
      setSaveNewCustomer(false);
    } else {
      setCustomerName('');
      setCustomerPhone('');
    }
  };

  const addSubJob = () => setSubJobs([...subJobs, { id: Math.random().toString(), description: '', size: '', units: 1, costPerUnit: 0, total: 0 }]);
  
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

  const removeSubJob = (id: string) => subJobs.length > 1 && setSubJobs(prev => prev.filter(item => item.id !== id));

  const addExpense = () => setExpenses([...expenses, { id: Math.random().toString(), description: '', size: '', units: 1, costPerUnit: 0, total: 0 }]);

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

  const removeExpense = (id: string) => setExpenses(prev => prev.filter(item => item.id !== id));

  const handleOpenAddService = (subJobId: string) => {
    setTriggeringSubJobId(subJobId);
    const currentDesc = subJobs.find(s => s.id === subJobId)?.description || '';
    setNewServiceData({ code: '', name: currentDesc, type: 'product', category: 'General', price: '', unit: 'pcs', size: '', description: '' });
    setIsAddServiceModalOpen(true);
    setFocusedSubJobId(null); 
  };

  const handleSaveNewService = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newServiceData.name || !newServiceData.price || !newServiceData.category) return;

    const newService: Omit<ServiceProduct, 'organizationId'> = {
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
    if (triggeringSubJobId) fillSubJobWithService(triggeringSubJobId, { ...newService, organizationId: '' }); 
    setIsAddServiceModalOpen(false);
    setTriggeringSubJobId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    let finalCustomerId = customerId;

    // 1. Handle New Customer
    if (!finalCustomerId && saveNewCustomer && customerName) {
        const newId = Math.random().toString(36).substr(2, 9);
        const newCustomer: Customer = {
            id: newId,
            organizationId: '', 
            name: customerName,
            phone: customerPhone,
            email: '',
            balance: 0,
            totalSpent: 0
        };
        addCustomer(newCustomer);
        finalCustomerId = newId;
    } else if (!finalCustomerId) {
        finalCustomerId = customerName || 'Walk-in';
    }

    const descriptionPrefix = saleType === 'Credit' ? `Invoice No: ${invoiceNumber}` : `Order No: ${jobNumber}`;
    const generatedTitle = `${subJobs[0]?.description || 'Order'} - ${customerName}`;

    // 2. Sync Inventory: Deduct stock for items that exist in inventory
    // We only deduct on NEW sales or if not previously edited to avoid double deduction in this simplified mock
    if (!initialData || hasReset) {
      subJobs.forEach(jobItem => {
        // Try to find matching item by name in inventory
        const inventoryItem = inventory.find(i => i.name.toLowerCase() === jobItem.description.toLowerCase());
        if (inventoryItem) {
           const qtySold = Number(jobItem.units) || 0;
           updateInventoryItem({
             ...inventoryItem,
             quantity: Math.max(0, inventoryItem.quantity - qtySold)
           });
        }
      });
    }

    // 3. Sync Financials: Add Income Transaction
    if ((amountPaid > 0) && (!initialData || hasReset)) {
       addTransaction({
          id: Math.random().toString(36).substr(2, 9),
          type: 'Income',
          category: 'Sales',
          amount: amountPaid,
          date: date || new Date().toISOString().split('T')[0],
          description: `${descriptionPrefix} - ${customerName}`,
          paymentMethod: paymentMethod, // 'Cash', 'Mpesa', 'Bank'
          referenceId: saleType === 'Credit' ? invoiceNumber : jobNumber,
          customerId: finalCustomerId
       });
    }

    // 4. Save Job
    const job: PrintJob = {
      id: (initialData?.id && !hasReset) ? initialData.id : Math.random().toString(36).substr(2, 9),
      organizationId: initialData?.organizationId || '',
      customerId: finalCustomerId,
      customerName,
      customerPhone,
      title: (initialData?.title && !hasReset) ? initialData.title : generatedTitle,
      description: `${descriptionPrefix}. Contains ${subJobs.length} items.`,
      status: status, 
      priority,
      serviceType: subJobs[0]?.description || 'General',
      quantity: subJobs.reduce((acc, s) => acc + Number(s.units), 0),
      price: totalDue, 
      cost: totalExpenses,
      dueDate: dueDate || date,
      createdAt: (initialData?.createdAt && !hasReset) ? initialData.createdAt : new Date().toISOString(),
      handledBy: handledBy,
      subJobs,
      expenses,
      paymentStatus,
      amountPaid,
      balance,
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
    
    const orgName = currentOrganization?.name || 'Shop Manager 360';
    const orgAddress = currentOrganization?.address ? `<div>${currentOrganization.address}</div>` : '';
    const orgContact = [currentOrganization?.phone, currentOrganization?.email].filter(Boolean).join(' | ');
    const orgContactHtml = orgContact ? `<div>${orgContact}</div>` : '';
    const orgTaxHtml = currentOrganization?.taxId ? `<div style="margin-top:2px;">TIN: ${currentOrganization.taxId}</div>` : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle} #${docNumber}</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body { font-family: 'Courier New', monospace; width: 72mm; margin: 0 auto; padding: 4mm; font-size: 12px; line-height: 1.2; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
            .shop-name { font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
            .org-details { font-size: 10px; color: #333; margin-bottom: 4px; }
            .doc-title { font-weight: bold; margin-top: 6px; font-size: 14px; }
            .section { margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 8px; }
            th { text-align: left; border-bottom: 1px solid #000; padding: 2px 0; }
            td { vertical-align: top; padding: 2px 0; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .grand-total { font-weight: bold; font-size: 14px; border-top: 1px solid #000; border-bottom: 1px solid #000; margin: 4px 0; padding: 4px 0; }
            .footer { text-align: center; font-size: 10px; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="shop-name">${orgName}</div>
            <div class="org-details">
                ${orgAddress}
                ${orgContactHtml}
                ${orgTaxHtml}
            </div>
            <div class="doc-title">${docTitle}</div>
          </div>
          <div class="section">
            <div class="row"><span>No:</span> <strong>${docNumber}</strong></div>
            <div class="row"><span>Date:</span> <span>${date}</span></div>
          </div>
          <div class="section">
            <div><strong>To:</strong> ${customerName}</div>
            <div style="margin-top: 4px;"><strong>Pay Method:</strong> ${paymentMethod}</div>
          </div>
          <table>
            <thead><tr><th style="width: 45%">Item</th><th style="width: 15%" class="text-center">Qty</th><th style="width: 20%" class="text-right">Price</th><th style="width: 20%" class="text-right">Total</th></tr></thead>
            <tbody>
              ${subJobs.map(item => `<tr><td>${item.description}</td><td class="text-center">${item.units}</td><td class="text-right">KSh ${item.costPerUnit.toLocaleString()}</td><td class="text-right">KSh ${item.total.toLocaleString()}</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="totals">
            <div class="row"><span>Subtotal:</span> <span>KSh ${totalSales.toLocaleString()}</span></div>
            ${discount > 0 ? `<div class="row"><span>Discount:</span> <span>-KSh ${discount.toLocaleString()}</span></div>` : ''}
            <div class="row grand-total"><span>TOTAL:</span> <span>KSh ${totalDue.toLocaleString()}</span></div>
            <div class="row"><span>Paid:</span> <span>KSh ${amountPaid.toLocaleString()}</span></div>
            <div class="row"><span>Balance:</span> <span>KSh ${balance.toLocaleString()}</span></div>
          </div>
          <div class="footer"><p>Thank you for shopping with us!</p></div>
        </body>
      </html>
    `;
    openPDFWindow(html);
  };

  const handleClose = () => { setHasReset(false); onClose(); }

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200 relative">
        
        {showSuccess && (
            <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                <div className="relative z-10 flex flex-col items-center max-w-md text-center p-8">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 animate-in zoom-in duration-500">
                        <CheckCircle className="w-10 h-10 text-white" strokeWidth={3} />
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
                        Saved Successfully!
                    </h2>
                    <p className="text-slate-400 text-lg mb-10">
                        Transaction recorded. Inventory updated.
                    </p>
                    
                    <div className="flex flex-col w-full gap-3">
                        <button onClick={handlePrint} className="w-full py-3.5 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg group">
                            <Printer size={20} className="text-blue-600 group-hover:scale-110 transition-transform" /> Print Receipt
                        </button>
                        
                        <div className="flex gap-3 mt-2">
                            <button onClick={handleAddNewSale} className="flex-1 py-3.5 bg-slate-800 text-white border border-slate-700 rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                                <Plus size={20} /> Add New
                            </button>
                            <button onClick={handleClose} className="flex-1 py-3.5 bg-transparent text-slate-400 border border-slate-700 rounded-xl font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-10 shadow-sm">
           <div>
               <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>
                        {saleType === 'Credit' ? <FileText size={24}/> : <Package size={24}/>}
                   </div>
                   <div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                            {initialData && !hasReset ? 'Edit ' : 'New '} {saleType === 'Credit' ? 'Credit Invoice' : 'Cash Sale'}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Transaction Entry</p>
                   </div>
               </div>
           </div>
           <div className="flex items-center gap-2">
             <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full p-2"><X size={20} /></button>
           </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-5 flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-2">
                Sale Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {saleType === 'Credit' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Invoice Number</label>
                  <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm font-mono text-blue-700 focus:outline-none" readOnly={!!(initialData && !hasReset)} />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Sale Number</label>
                  <input type="text" value={jobNumber} onChange={e => setJobNumber(e.target.value)} className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm font-mono text-blue-700 focus:outline-none" readOnly={!!(initialData && !hasReset)} />
                </div>
              )}
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-slate-50 focus:bg-white" /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Due Date</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-slate-50 focus:bg-white" /></div>
              
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Select Customer</label>
                   <select value={customerId} onChange={(e) => handleCustomerSelect(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-slate-50 focus:bg-white">
                     <option value="">-- Manual Entry --</option>
                     {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                   </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Customer Name *</label>
                  <input required type="text" value={customerName} onChange={e => {setCustomerName(e.target.value); if (customerId) setCustomerId('');}} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-slate-50 focus:bg-white" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Customer Phone</label>
                <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-slate-50 focus:bg-white" />
                {!customerId && customerName && (
                    <div className="flex items-center gap-2 mt-3 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                        <input 
                            type="checkbox" 
                            id="saveNewCustomer" 
                            checked={saveNewCustomer} 
                            onChange={e => setSaveNewCustomer(e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="saveNewCustomer" className="text-xs text-blue-700 font-bold cursor-pointer select-none flex items-center gap-1">
                            <UserPlus size={14} /> Save to Customer List
                        </label>
                    </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as JobStatus)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-slate-50 focus:bg-white">
                  {Object.values(JobStatus).map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-visible z-20">
                <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                   <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-slate-800">
                       <Package size={16} className={iconColor}/> Items
                   </h4>
                   <button type="button" onClick={addSubJob} className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all font-bold ${iconBg} ${iconColor} hover:bg-blue-100`}>
                       <Plus size={14}/> Add Item
                   </button>
                </div>
                <div className="space-y-3 flex-1">
                  {subJobs.map((item, index) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm hover:border-slate-300 transition-colors">
                       <div className="flex gap-2 mb-2 relative">
                          <div className="flex-1 relative">
                              <input placeholder="Product / Service" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" value={item.description} onChange={e => updateSubJob(item.id, 'description', e.target.value)} onFocus={() => setFocusedSubJobId(item.id)} />
                              {focusedSubJobId === item.id && (
                                <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 z-[100] max-h-60 overflow-y-auto">
                                   {serviceProducts.map(service => (
                                       <button key={service.id} type="button" className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm flex justify-between" onMouseDown={(e) => { e.preventDefault(); fillSubJobWithService(item.id, service); }}>
                                         <span>{service.name}</span><span className="text-xs text-slate-500">KSh {service.price}</span>
                                       </button>
                                   ))}
                                   <button type="button" className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 text-blue-600 text-xs font-bold border-t border-slate-100" onMouseDown={(e) => { e.preventDefault(); handleOpenAddService(item.id); }}>+ Add New Product</button>
                                </div>
                              )}
                          </div>
                          <input placeholder="Size" className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" value={item.size} onChange={e => updateSubJob(item.id, 'size', e.target.value)} />
                       </div>
                       <div className="flex gap-2 items-center">
                          <input type="number" className="w-16 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" value={item.units} onChange={e => updateSubJob(item.id, 'units', e.target.value)} />
                          <input type="number" className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" value={item.costPerUnit} onChange={e => updateSubJob(item.id, 'costPerUnit', e.target.value)} />
                          <div className="flex-1 text-right font-bold text-slate-700">KSh {item.total.toFixed(2)}</div>
                          <button type="button" onClick={() => removeSubJob(item.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
                       </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center"><span className="text-sm font-bold text-slate-500 uppercase">Subtotal</span><span className={`text-lg font-bold ${iconColor}`}>KSh {totalSales.toFixed(2)}</span></div>
             </div>

             {/* Expenses Section */}
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full z-10 overflow-visible">
                <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                   <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2"><Briefcase size={16} className="text-orange-600"/> Associated Costs</h4>
                   <button type="button" onClick={addExpense} className="text-xs bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-bold"><Plus size={14}/> Add Expense</button>
                </div>
                <div className="space-y-3 flex-1">
                  {expenses.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm hover:border-slate-300 transition-colors">
                       <div className="flex gap-2 mb-2 relative">
                          <div className="flex-1 relative">
                              <input placeholder="Item / Material" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-100 outline-none" value={item.description} onChange={e => updateExpense(item.id, 'description', e.target.value)} onFocus={() => setFocusedExpenseId(item.id)} />
                              {focusedExpenseId === item.id && (
                                <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 z-[100] max-h-48 overflow-y-auto">
                                    {expenseItems.map(expItem => (
                                        <button key={expItem.id} type="button" className="w-full text-left px-3 py-2 hover:bg-orange-50 text-sm flex justify-between" onMouseDown={(e) => { e.preventDefault(); fillExpenseWithItem(item.id, expItem); }}>
                                            <span>{expItem.description}</span><span className="text-xs font-bold text-orange-600">KSh {expItem.costPerUnit}</span>
                                        </button>
                                    ))}
                                </div>
                              )}
                          </div>
                       </div>
                       <div className="flex gap-2 items-center">
                          <input type="number" className="w-16 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-100 outline-none" value={item.units} onChange={e => updateExpense(item.id, 'units', e.target.value)} />
                          <input type="number" className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-100 outline-none" value={item.costPerUnit} onChange={e => updateExpense(item.id, 'costPerUnit', e.target.value)} />
                          <div className="flex-1 text-right font-bold text-slate-700">KSh {item.total.toFixed(2)}</div>
                          <button type="button" onClick={() => removeExpense(item.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
                       </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center"><span className="text-sm font-bold text-slate-500 uppercase">Total Costs</span><span className="text-lg font-bold text-orange-600">KSh {totalExpenses.toFixed(2)}</span></div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2 text-slate-800">Summary</h4>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center"><span className="text-slate-600">Total Sale</span><span className="font-bold text-slate-800">KSh {totalSales.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-600">Total Cost</span><span className="font-bold text-orange-600">-KSh {totalExpenses.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-600">Discount</span><input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1 text-right border border-slate-200 rounded bg-slate-50 focus:bg-white text-sm" /></div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200"><span className="font-bold text-slate-800">Total Due</span><span className="font-bold text-xl text-slate-800">KSh {totalDue.toFixed(2)}</span></div>
                </div>
             </div>

             <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-800">Payment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                   <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Payment Method</label>
                      <div className="flex gap-4">
                         {['Cash', 'Mpesa', 'Bank'].map((method) => (
                            <label key={method} className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all w-full"><input type="radio" name="paymentMethod" checked={paymentMethod === method} onChange={() => setPaymentMethod(method as any)} className="w-4 h-4 text-blue-600" /><span className="text-sm font-bold text-slate-700">{method}</span></label>
                         ))}
                      </div>
                   </div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Amount Paid</label><input type="number" value={amountPaid} onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none" /></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Payment Status</label><div className={`w-full px-4 py-3 border rounded-xl text-sm font-bold text-center ${paymentStatus === 'Fully Paid' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>{paymentStatus}</div></div>
                </div>
             </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 sticky bottom-0 z-20">
           <button onClick={handleClose} className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-bold transition-colors text-sm">Cancel</button>
           <button onClick={handleSubmit} disabled={isSaving} className="px-8 py-2.5 bg-slate-900 text-white rounded-lg font-bold shadow-md hover:bg-slate-800 transition-all text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
               {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save {saleType === 'Credit' ? 'Invoice' : 'Sale'}
           </button>
        </div>
      </div>
    </div>
    </>
  );
};
