import React from 'react';
import { JobStatus, Priority } from '../../types';

export const StatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
  const styles = {
    [JobStatus.PENDING]: 'bg-slate-100 text-slate-600',
    [JobStatus.PRE_PRESS]: 'bg-blue-100 text-blue-700',
    [JobStatus.PRINTING]: 'bg-indigo-100 text-indigo-700',
    [JobStatus.FINISHING]: 'bg-purple-100 text-purple-700',
    [JobStatus.READY]: 'bg-green-100 text-green-700',
    [JobStatus.COMPLETED]: 'bg-emerald-100 text-emerald-800',
    [JobStatus.CANCELLED]: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${styles[status] || styles[JobStatus.PENDING]}`}>
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
    const styles = {
        [Priority.NORMAL]: 'text-slate-500 bg-slate-50 border-slate-200',
        [Priority.URGENT]: 'text-amber-600 bg-amber-50 border-amber-200',
        [Priority.EXPRESS]: 'text-red-600 bg-red-50 border-red-200',
    }
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[priority]}`}>
            {priority}
        </span>
    )
}
