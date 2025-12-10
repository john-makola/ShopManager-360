
import React, { useState, useEffect } from 'react';
import { Customer, Supplier } from '../types';
import { X, Sparkles, Send, RefreshCw, Mail, Copy } from 'lucide-react';
import { generateNotificationDraft } from '../services/geminiService';

interface EmailGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: Customer | Supplier | null;
  type: 'Customer' | 'Supplier';
}

export const EmailGeneratorModal: React.FC<EmailGeneratorModalProps> = ({ isOpen, onClose, recipient, type }) => {
  const [template, setTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Set default templates based on type
  const templates = type === 'Customer' 
    ? ['Late Payment Reminder', 'Statement of Account', 'Thank You Note', 'Promotional Offer']
    : ['Request for Quotation', 'Purchase Order', 'Statement Request', 'Payment Confirmation'];

  useEffect(() => {
    if (isOpen) {
        setTemplate(templates[0]);
        setSubject('');
        setBody('');
    }
  }, [isOpen, type]);

  const handleGenerate = async () => {
    if (!recipient) return;
    setIsGenerating(true);
    const result = await generateNotificationDraft(recipient, type, template);
    setSubject(result.subject);
    setBody(result.body);
    setIsGenerating(false);
  };

  const handleSend = () => {
    setIsSending(true);
    // Simulation of sending
    setTimeout(() => {
        setIsSending(false);
        alert(`Email sent to ${recipient?.email || 'recipient'} successfully!`);
        onClose();
    }, 1000);
  };

  if (!isOpen || !recipient) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
           <div className="flex items-center gap-2">
               <div className={`p-2 rounded-lg text-white ${type === 'Customer' ? 'bg-indigo-600' : 'bg-teal-600'}`}>
                   <Mail size={20} />
               </div>
               <div>
                   <h3 className="font-bold text-slate-800">Email Notification</h3>
                   <p className="text-xs text-slate-500">To: {recipient.name} &lt;{recipient.email || 'No Email'}&gt;</p>
               </div>
           </div>
           <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
             <X size={20} />
           </button>
        </div>

        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            
            {/* Template Selection */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notification Type</label>
                <div className="flex gap-2">
                    <select 
                        value={template} 
                        onChange={(e) => setTemplate(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                    >
                        {templates.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                    >
                        {isGenerating ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16} />}
                        Generate
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="space-y-3 pt-2">
                <div>
                    <input 
                        type="text" 
                        placeholder="Subject Line"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold focus:border-blue-500 outline-none"
                    />
                </div>
                <div>
                    <textarea 
                        rows={10}
                        placeholder="Email content will appear here..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none resize-none leading-relaxed"
                    />
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
            <button className="text-slate-500 hover:text-blue-600 text-sm flex items-center gap-1">
                <Copy size={14} /> Copy to Clipboard
            </button>
            <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-white">
                    Cancel
                </button>
                <button 
                    onClick={handleSend}
                    disabled={isSending || !body}
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50"
                >
                    {isSending ? 'Sending...' : 'Send Email'} <Send size={16} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
