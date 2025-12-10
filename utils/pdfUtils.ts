
export const generatePDFReport = ({ title, content, showDateRange, organization }: { title: string, content: string, showDateRange?: { startDate: string, endDate: string }, organization?: any }) => {
  const dateStr = new Date().toLocaleDateString();
  const dateRangeStr = showDateRange ? `<p>Period: ${showDateRange.startDate} to ${showDateRange.endDate}</p>` : '';
  
  const orgName = organization?.name || 'Shop Manager 360';
  const orgAddress = organization?.address ? `<div>${organization.address}</div>` : '';
  const orgContact = [organization?.phone, organization?.email].filter(Boolean).join(' | ');
  const orgContactHtml = orgContact ? `<div>${orgContact}</div>` : '';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
          h1 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 5px; }
          .header { margin-bottom: 40px; text-align: left; }
          .company { font-size: 1.5rem; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
          .org-details { font-size: 0.85rem; color: #64748b; margin-bottom: 10px; }
          .meta { font-size: 0.9rem; color: #64748b; margin-top: 10px;}
          
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
          th { background-color: #f8fafc; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 11px; }
          
          .text-right { text-align: right; }
          
          .totals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; page-break-inside: avoid; }
          .total-card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; background: #f8fafc; }
          .total-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
          .total-value { font-size: 24px; font-weight: bold; }
          .negative { color: #dc2626; }
          .neutral { color: #334155; }
          
          @media print {
            body { padding: 0; }
            .totals-grid { gap: 10px; }
            .total-card { border: 1px solid #ccc; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">${orgName}</div>
          <div class="org-details">
            ${orgAddress}
            ${orgContactHtml}
          </div>
          <h1>${title}</h1>
          <div class="meta">
            Generated on: ${dateStr}<br/>
            ${dateRangeStr}
          </div>
        </div>
        ${content}
      </body>
    </html>
  `;
};

export const openPDFWindow = (htmlContent: string) => {
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(htmlContent);
    win.document.close();
    // Allow styles to load before print
    setTimeout(() => {
        win.focus();
        win.print();
    }, 500);
    return true;
  }
  return false;
};
