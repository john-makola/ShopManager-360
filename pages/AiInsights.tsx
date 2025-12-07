import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { generateBusinessInsights, generateCustomerEmail } from '../services/geminiService';
import { Sparkles, RefreshCw, Mail } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AiInsights: React.FC = () => {
  const { jobs, transactions, inventory } = useAppContext();
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  // Email Generator State
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [emailDraft, setEmailDraft] = useState<string>("");
  const [emailLoading, setEmailLoading] = useState(false);

  const handleGenerateInsights = async () => {
    setLoading(true);
    const result = await generateBusinessInsights(jobs, transactions, inventory);
    setInsight(result);
    setLoading(false);
  };

  const handleGenerateEmail = async () => {
    if(!selectedJobId) return;
    setEmailLoading(true);
    const job = jobs.find(j => j.id === selectedJobId);
    if(job) {
        const result = await generateCustomerEmail(job, "Valued Customer");
        setEmailDraft(result);
    }
    setEmailLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-purple-600" />
            Smart Insights Assistant
        </h1>
        <p className="text-slate-500">Powered by Google Gemini to help run your shop better.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Strategist Card */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
                <h2 className="text-lg font-bold mb-2">Daily Shop Analysis</h2>
                <p className="text-purple-100 text-sm mb-4">Analyze inventory, sales, and bottlenecks.</p>
                <button 
                    onClick={handleGenerateInsights}
                    disabled={loading}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                    {loading ? 'Analyzing...' : 'Generate Report'}
                </button>
            </div>
            <div className="p-6 min-h-[200px] bg-purple-50/30">
                {insight ? (
                    <div className="prose prose-purple prose-sm max-w-none">
                        <ReactMarkdown>{insight}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="text-center text-slate-400 py-10">
                        <Sparkles className="mx-auto mb-2 opacity-30" size={48} />
                        <p>Click generate to see AI insights.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Client Communicator Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Mail size={20} className="text-blue-500"/>
                    Client Communicator
                </h2>
                <p className="text-sm text-slate-500 mt-1">Draft updates for job status changes.</p>
            </div>
            <div className="p-6 flex-1 flex flex-col space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Select Job</label>
                    <select 
                        className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                    >
                        <option value="">-- Choose a Job --</option>
                        {jobs.map(j => (
                            <option key={j.id} value={j.id}>{j.title} ({j.status})</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200">
                    {emailDraft ? (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{emailDraft}</p>
                    ) : (
                        <p className="text-sm text-slate-400 italic text-center mt-8">Select a job and click generate.</p>
                    )}
                </div>

                <button 
                    onClick={handleGenerateEmail}
                    disabled={!selectedJobId || emailLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {emailLoading ? 'Drafting...' : 'Generate Email Draft'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AiInsights;
