import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { JobStatus, Priority, PrintJob } from '../types';
import { StatusBadge, PriorityBadge } from '../components/ui/StatusBadge';
import { Plus, Filter, MoreHorizontal, Calendar, ArrowRight, X, CheckCircle, Download, Printer, LayoutList, Kanban, FileText, Banknote, Upload, Info } from 'lucide-react';
import { NewJobModal } from '../components/NewJobModal';
import { exportToCSV } from '../utils/exportUtils';
import { generatePDFReport, openPDFWindow } from '../utils/pdfUtils';

interface JobsProps {
  mode?: 'Cash' | 'Credit';
}

const Jobs: React.FC<JobsProps> = ({ mode = 'Cash' }) => {
  const { jobs, addJob, updateJob, updateJobStatus } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<PrintJob | null>(null);
  const [activeTab, setActiveTab] = useState<'List' | 'Kanban'>('List');
  const [showInfo, setShowInfo] = useState(false);
  
  // Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Filter jobs based on the route mode
  // If saleType is undefined in legacy data, assume Cash
  const filteredJobs = jobs.filter(j => (j.saleType || 'Cash') === mode);

  // Define the strict workflow order
  const WORKFLOW_STEPS = [
    JobStatus.PENDING,
    JobStatus.PRE_PRESS,
    JobStatus.PRINTING,
    JobStatus.FINISHING,
    JobStatus.READY,
    JobStatus.COMPLETED
  ];

  // Helper to determine next step in the workflow
  const getNextStatus = (current: JobStatus): JobStatus | null => {
    const idx = WORKFLOW_STEPS.indexOf(current);
    if (idx !== -1 && idx < WORKFLOW_STEPS.length - 1) {
      return WORKFLOW_STEPS[idx + 1];
    }
    return null;
  };

  // Columns to display in Kanban view (includes Cancelled)
  const KANBAN_COLUMNS = [
    ...WORKFLOW_STEPS,
    JobStatus.CANCELLED
  ];

  const handleOpenNewJob = () => {
    setSelectedJob(null);
    setIsModalOpen(true);
  };

  const handleOpenEditJob = (job: PrintJob) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleSaveJob = (job: PrintJob) => {
    if (selectedJob) {
      updateJob(job);
    } else {
      addJob(job);
    }
    // Modal closing logic is now handled by the modal's internal success flow
  };

  const handleExport = () => {
    const exportData = filteredJobs.map(j => ({
        ID: j.id,
        DocNumber: mode === 'Credit' ? j.invoiceNumber : j.description.match(/(JC-\d+)/)?.[0],
        Title: j.title,
        Customer: j.customerName,
        Status: j.status,
        Amount: j.price,
        Balance: j.balance,
        Date: j.createdAt.split('T')[0]
    }));
    exportToCSV(exportData, `${mode}_Sales_Orders`);
  };

  const handlePrint = () => {
    const content = `
      <h3>${mode} Sales List</h3>
      <table>
        <thead>
           <tr>
             <th>Date</th>
             <th>${mode === 'Credit' ? 'Invoice #' : 'Job #'}</th>
             <th>Customer</th>
             <th>Title</th>
             <th>Status</th>
             <th class="text-right">Amount</th>
           </tr>
        </thead>
        <tbody>
           ${filteredJobs.map(j => `
             <tr>
               <td>${j.createdAt.split('T')[0]}</td>
               <td>${mode === 'Credit' ? (j.invoiceNumber || '-') : (j.description.match(/(JC-\d+)/)?.[0] || j.id)}</td>
               <td>${j.customerName}</td>
               <td>${j.title}</td>
               <td>${j.status}</td>
               <td class="text-right">$${j.price.toFixed(2)}</td>
             </tr>
           `).join('')}
        </tbody>
      </table>
    `;
    const html = generatePDFReport({ title: `${mode} Sales List`, content });
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

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {mode === 'Credit' ? <FileText className="text-purple-600" /> : <Banknote className="text-green-600" />}
              {mode === 'Credit' ? 'Credit Sales (Invoices)' : 'Cash & Mpesa Sales'}
            </h1>
            <button 
                onClick={() => setShowInfo(!showInfo)} 
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title={`About ${mode} Sales`}
            >
                <Info size={20} />
            </button>
          </div>
          <p className="text-slate-500">
            {mode === 'Credit' ? 'Manage invoices, credit accounts and payments.' : 'Manage daily cash orders and counter sales.'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggles */}
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
             <button 
                onClick={() => setActiveTab('List')}
                className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium ${activeTab === 'List' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                title="List View"
             >
               <LayoutList size={16} />
               <span className="hidden sm:inline">List</span>
             </button>
             <button 
                onClick={() => setActiveTab('Kanban')}
                className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium ${activeTab === 'Kanban' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                title="Board View"
             >
               <Kanban size={16} />
               <span className="hidden sm:inline">Board</span>
             </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
             <button onClick={handlePrint} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 shadow-sm" title="Print List">
               <Printer size={16} /> Print
             </button>
             <button onClick={handleExport} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 shadow-sm" title="Export CSV">
               <Download size={16} /> Export
             </button>
             <button onClick={() => setIsImportModalOpen(true)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 shadow-sm" title="Import Sales">
               <Upload size={16} /> Import
             </button>
          </div>

          <button 
            onClick={handleOpenNewJob}
            className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors ${mode === 'Credit' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New {mode === 'Credit' ? 'Invoice' : 'Sale'}</span>
          </button>
        </div>
      </div>

      {showInfo && mode === 'Cash' && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 text-sm text-blue-800 relative">
            <button 
                onClick={() => setShowInfo(false)} 
                className="absolute top-3 right-3 text-blue-400 hover:text-blue-700"
            >
                <X size={16} />
            </button>
            <h4 className="font-bold mb-2 flex items-center gap-2">
                <Info size={16} /> About Cash & Mpesa Sales
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
               <div>
                  <h5 className="font-bold text-blue-900 mb-1">Cash Sales</h5>
                  <p className="mb-2 text-blue-700">Transactions where customers pay instantly using physical cash for printing services, merchandise, or consumables. The sale is completed immediately.</p>
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                      <li>Customer pays cash for photocopying</li>
                      <li>Cash payment for printing business cards</li>
                      <li>Cash purchase of stationery (paper, binding covers, etc.)</li>
                      <li>Walk-in client pays cash to print posters</li>
                  </ul>
               </div>
               <div>
                  <h5 className="font-bold text-blue-900 mb-1">Mpesa Sales</h5>
                  <p className="mb-2 text-blue-700">Transactions where customers make immediate payment using mobile money platforms such as Mpesa. Payments are received digitally.</p>
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                      <li>Customer pays via Mpesa Till number for printing services</li>
                      <li>Payment for large format printing</li>
                      <li>Mpesa payment for ID card printing, lamination, binding, etc.</li>
                  </ul>
               </div>
            </div>
        </div>
      )}

      {showInfo && mode === 'Credit' && (
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 text-sm text-purple-800 relative">
            <button 
                onClick={() => setShowInfo(false)} 
                className="absolute top-3 right-3 text-purple-400 hover:text-purple-700"
            >
                <X size={16} />
            </button>
            <h4 className="font-bold mb-2 flex items-center gap-2">
                <Info size={16} /> About Credit Sales
            </h4>
            <p className="mb-3 text-purple-700 font-medium">
              Credit sales occur when the print shop completes a job and allows the customer to pay later.
            </p>
            
            <div>
                <h5 className="font-bold text-purple-900 mb-1">Description</h5>
                <p className="text-purple-700 leading-relaxed">
                  Credit sales are transactions where goods or services are delivered to the customer, but payment is postponed to a future date. This is common for corporate clients, schools, churches, government offices, and repeat clients requesting monthly billing.
                </p>
            </div>
        </div>
      )}

      {activeTab === 'List' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{mode === 'Credit' ? 'Invoice #' : 'Job ID'}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                      No {mode.toLowerCase()} sales found.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => {
                  const nextStatus = getNextStatus(job.status);
                  const identifier = mode === 'Credit' ? (job.invoiceNumber || 'N/A') : (job.description.match(/(JC-\d+)/)?.[0] || job.id);
                  
                  return (
                    <tr 
                      key={job.id} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => handleOpenEditJob(job)}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                         {identifier}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{job.title}</div>
                        <div className="text-sm text-slate-500">{job.serviceType} • {job.quantity.toLocaleString()} units</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {job.customerName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar size={14} />
                          {job.dueDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="font-medium text-slate-900">${job.price.toFixed(2)}</div>
                         {mode === 'Credit' && job.balance && job.balance > 0 ? (
                            <div className="text-xs text-red-500 font-medium">Due: ${job.balance.toFixed(2)}</div>
                         ) : null}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        {nextStatus ? (
                          <button 
                             onClick={() => updateJobStatus(job.id, nextStatus)}
                             className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                             title={`Move to ${nextStatus}`}
                          >
                             Next <ArrowRight size={14} />
                          </button>
                        ) : job.status === JobStatus.COMPLETED ? (
                             <span className="text-green-600"><CheckCircle size={18} /></span>
                        ) : (
                          <button className="text-slate-400 hover:text-slate-600">
                            <MoreHorizontal size={20} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {KANBAN_COLUMNS.map(status => (
            <div key={status} className="min-w-[280px] w-[280px] flex-col flex bg-slate-100/50 rounded-xl border border-slate-200/60 max-h-full">
               <div className="p-3 border-b border-slate-200/50 flex items-center justify-between sticky top-0 bg-slate-100/95 backdrop-blur-sm rounded-t-xl z-10">
                  <h3 className="font-semibold text-slate-700 text-sm">{status}</h3>
                  <span className="bg-white text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                    {filteredJobs.filter(j => j.status === status).length}
                  </span>
               </div>
               <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                 {filteredJobs.filter(j => j.status === status).map(job => {
                   const nextStatus = getNextStatus(job.status);
                   return (
                     <div 
                       key={job.id} 
                       className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all group cursor-pointer"
                       onClick={() => handleOpenEditJob(job)}
                     >
                        <div className="flex justify-between items-start mb-2">
                           <PriorityBadge priority={job.priority} />
                           <span className="text-[10px] text-slate-400 font-mono">
                             {mode === 'Credit' ? job.invoiceNumber : (job.description.match(/(JC-\d+)/)?.[0] || `#${job.id}`)}
                           </span>
                        </div>
                        <h4 className="font-medium text-slate-900 text-sm mb-1 leading-tight">{job.title}</h4>
                        <p className="text-xs text-slate-500 mb-3">{job.customerName}</p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                           <span className="text-[10px] text-slate-400 flex items-center gap-1">
                             <Calendar size={10} /> {job.dueDate}
                           </span>
                           <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              {nextStatus && (
                                <button 
                                  onClick={() => updateJobStatus(job.id, nextStatus)}
                                  className="text-[10px] flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-medium transition-colors"
                                >
                                  Next: {nextStatus.replace('-', ' ')} <ArrowRight size={10} />
                                </button>
                              )}
                              {job.status === JobStatus.COMPLETED && (
                                <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                                    <CheckCircle size={10} /> Done
                                </span>
                              )}
                           </div>
                        </div>
                     </div>
                   );
                 })}
                 {filteredJobs.filter(j => j.status === status).length === 0 && (
                    <div className="text-center py-8 text-slate-300 text-xs italic">
                        No jobs
                    </div>
                 )}
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Shared New/Edit Job Modal */}
      <NewJobModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJob(null);
        }} 
        onSubmit={handleSaveJob} 
        initialData={selectedJob}
        saleType={mode}
      />
      
      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Import {mode} Sales</h3>
                  <button onClick={() => setIsImportModalOpen(false)}><X className="text-slate-400 hover:text-red-500" /></button>
               </div>
               <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center mb-4">
                   <input type="file" className="hidden" id="sales-upload" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                   <label htmlFor="sales-upload" className="cursor-pointer block">
                       <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                       <span className="text-blue-600 hover:underline text-sm font-medium">Click to upload CSV/JSON</span>
                       <p className="text-xs text-slate-400 mt-1">{selectedFile ? selectedFile.name : "or drag and drop"}</p>
                   </label>
               </div>
               <button onClick={handleImport} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">Import Data</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;