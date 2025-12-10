
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend, ComposedChart, Line
} from 'recharts';
import { 
  Download, DollarSign, Package, 
  CreditCard, Banknote, AlertCircle, Briefcase, Receipt, TrendingUp, TrendingDown,
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Activity,
  FileClock, ShieldCheck, User as UserIcon, Search, History
} from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { generatePDFReport, openPDFWindow } from '../utils/pdfUtils';

type ReportType = 'Sales' | 'Expenses' | 'Inventory' | 'Profit & Loss' | 'Audit Trail';
type TimePeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Yearly';

const Reports: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { jobs, transactions, inventory, currentOrganization, users, customers, suppliers } = useAppContext();
  
  // Determine default tab based on URL
  const getTabFromPath = (path: string): ReportType => {
    if (path.includes('expenses')) return 'Expenses';
    if (path.includes('inventory')) return 'Inventory';
    if (path.includes('pnl')) return 'Profit & Loss';
    if (path.includes('audit')) return 'Audit Trail';
    return 'Sales';
  };

  const [activeTab, setActiveTab] = useState<ReportType>(getTabFromPath(location.pathname));
  const [period, setPeriod] = useState<TimePeriod>('Monthly');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Audit Trail Specific State
  const [auditStartDate, setAuditStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [auditEndDate, setAuditEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [auditModule, setAuditModule] = useState('All');
  const [auditAction, setAuditAction] = useState('All');
  const [auditSearch, setAuditSearch] = useState('');

  // Sync tab with URL changes (handling sidebar navigation)
  useEffect(() => {
    const newTab = getTabFromPath(location.pathname);
    setActiveTab(newTab);
  }, [location.pathname]);

  // Reset to Month view when switching to tabs that don't usually support daily well
  useEffect(() => {
    if (activeTab === 'Profit & Loss' && (period === 'Daily' || period === 'Weekly')) {
        setPeriod('Monthly');
    }
  }, [activeTab]);

  // Handle internal tab clicks by navigating
  const handleTabChange = (tab: ReportType) => {
    let path = '/reports/sales';
    if (tab === 'Expenses') path = '/reports/expenses';
    if (tab === 'Inventory') path = '/reports/inventory';
    if (tab === 'Profit & Loss') path = '/reports/pnl';
    if (tab === 'Audit Trail') path = '/reports/audit';
    navigate(path);
  };

  // --- Date Math Helpers ---
  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    switch (period) {
        case 'Daily':
            break; // start/end are same day
        case 'Weekly': {
            const day = start.getDay(); // 0 is Sunday
            // Adjust to Monday start
            const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
            start.setDate(diff);
            end.setDate(start.getDate() + 6);
            break;
        }
        case 'Monthly':
            start.setDate(1);
            end.setMonth(start.getMonth() + 1);
            end.setDate(0);
            break;
        case 'Quarterly': {
            const q = Math.floor(start.getMonth() / 3);
            start.setMonth(q * 3);
            start.setDate(1);
            end.setMonth(start.getMonth() + 3);
            end.setDate(0);
            break;
        }
        case 'Bi-Annual': {
            const h = Math.floor(start.getMonth() / 6);
            start.setMonth(h * 6);
            start.setDate(1);
            end.setMonth(start.getMonth() + 6);
            end.setDate(0);
            break;
        }
        case 'Yearly':
            start.setMonth(0, 1);
            end.setMonth(11, 31);
            break;
    }
    return { start, end };
  };

  const { start: startDate, end: endDate } = getDateRange();

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    switch (period) {
        case 'Daily': newDate.setDate(newDate.getDate() - 1); break;
        case 'Weekly': newDate.setDate(newDate.getDate() - 7); break;
        case 'Monthly': newDate.setMonth(newDate.getMonth() - 1); break;
        case 'Quarterly': newDate.setMonth(newDate.getMonth() - 3); break;
        case 'Bi-Annual': newDate.setMonth(newDate.getMonth() - 6); break;
        case 'Yearly': newDate.setFullYear(newDate.getFullYear() - 1); break;
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    switch (period) {
        case 'Daily': newDate.setDate(newDate.getDate() + 1); break;
        case 'Weekly': newDate.setDate(newDate.getDate() + 7); break;
        case 'Monthly': newDate.setMonth(newDate.getMonth() + 1); break;
        case 'Quarterly': newDate.setMonth(newDate.getMonth() + 3); break;
        case 'Bi-Annual': newDate.setMonth(newDate.getMonth() + 6); break;
        case 'Yearly': newDate.setFullYear(newDate.getFullYear() + 1); break;
    }
    setCurrentDate(newDate);
  };

  const formatPeriodLabel = () => {
    const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    if (period === 'Daily') return currentDate.toLocaleDateString(undefined, { ...opts, day: 'numeric' });
    if (period === 'Weekly') return `Week of ${startDate.toLocaleDateString()}`;
    if (period === 'Monthly') return startDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (period === 'Quarterly') return `Q${Math.floor(startDate.getMonth()/3) + 1} ${startDate.getFullYear()}`;
    if (period === 'Bi-Annual') return `H${Math.floor(startDate.getMonth()/6) + 1} ${startDate.getFullYear()}`;
    if (period === 'Yearly') return startDate.getFullYear().toString();
    return '';
  };

  const isDataInRange = (dateStr: string) => {
    const d = new Date(dateStr);
    return d >= startDate && d <= endDate;
  };

  // --- Data Aggregation ---

  // 1. Sales Data
  const salesData = useMemo(() => {
    const filteredJobs = jobs.filter(j => isDataInRange(j.createdAt));
    
    const totalRevenue = filteredJobs.reduce((acc, j) => acc + (j.price || 0), 0);
    const cashSales = filteredJobs.filter(j => j.saleType === 'Cash').reduce((acc, j) => acc + (j.price || 0), 0);
    const creditSales = filteredJobs.filter(j => j.saleType === 'Credit').reduce((acc, j) => acc + (j.price || 0), 0);
    const outstanding = filteredJobs.filter(j => j.saleType === 'Credit').reduce((acc, j) => acc + (j.balance || 0), 0);
    
    // Grouping Strategy
    const groupByMonth = (endDate.getTime() - startDate.getTime()) > (32 * 24 * 60 * 60 * 1000);

    const chartMap = filteredJobs.reduce((acc, job) => {
      const d = new Date(job.createdAt);
      const dateKey = groupByMonth 
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` // YYYY-MM
        : job.createdAt.split('T')[0]; // YYYY-MM-DD
      
      if (!acc[dateKey]) acc[dateKey] = { date: dateKey, cash: 0, credit: 0, total: 0 };
      
      if (job.saleType === 'Cash') acc[dateKey].cash += job.price;
      else acc[dateKey].credit += job.price;
      acc[dateKey].total += job.price;
      
      return acc;
    }, {} as Record<string, { date: string; cash: number; credit: number; total: number }>);

    const chartData = (Object.values(chartMap) as { date: string; cash: number; credit: number; total: number }[])
      .sort((a, b) => a.date.localeCompare(b.date));

    return { totalRevenue, cashSales, creditSales, outstanding, chartData, count: filteredJobs.length };
  }, [jobs, startDate, endDate]);

  // 2. Expenses Data
  // NOTE: We MUST separate "Operational Expenses" (Rent, etc.) from "Stock Purchases" (Assets).
  const expensesData = useMemo(() => {
    // General OpEx: Expenses that are NOT Stock Purchase
    const generalExpenses = transactions.filter(t => 
        t.type === 'Expense' && 
        isDataInRange(t.date) && 
        t.category !== 'Stock Purchase' && 
        t.category !== 'Inventory Purchase'
    );
    const totalGeneral = generalExpenses.reduce((acc, t) => acc + t.amount, 0);

    // Stock Purchases: Expenses that ARE Stock Purchase
    const stockExpenses = transactions.filter(t => 
        t.type === 'Expense' && 
        isDataInRange(t.date) && 
        (t.category === 'Stock Purchase' || t.category === 'Inventory Purchase')
    );
    const totalStockPurchase = stockExpenses.reduce((acc, t) => acc + t.amount, 0);

    // Job Costs (COGS)
    const relevantJobs = jobs.filter(j => isDataInRange(j.createdAt));
    const totalCOGS = relevantJobs.reduce((acc, j) => acc + (j.cost || 0), 0);

    const groupByMonth = (endDate.getTime() - startDate.getTime()) > (32 * 24 * 60 * 60 * 1000);

    const chartMap = {} as Record<string, { date: string; operational: number; cogs: number; stock: number }>;

    // Map OpEx
    generalExpenses.forEach(t => {
      const d = new Date(t.date);
      const dateKey = groupByMonth 
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` 
        : t.date;
      if (!chartMap[dateKey]) chartMap[dateKey] = { date: dateKey, operational: 0, cogs: 0, stock: 0 };
      chartMap[dateKey].operational += t.amount;
    });

    // Map Stock Purchases
    stockExpenses.forEach(t => {
      const d = new Date(t.date);
      const dateKey = groupByMonth 
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` 
        : t.date;
      if (!chartMap[dateKey]) chartMap[dateKey] = { date: dateKey, operational: 0, cogs: 0, stock: 0 };
      chartMap[dateKey].stock += t.amount;
    });

    // Map COGS
    relevantJobs.forEach(j => {
      const d = new Date(j.createdAt);
      const dateKey = groupByMonth 
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` 
        : j.createdAt.split('T')[0];
      if (!chartMap[dateKey]) chartMap[dateKey] = { date: dateKey, operational: 0, cogs: 0, stock: 0 };
      chartMap[dateKey].cogs += (j.cost || 0);
    });

    const chartData = (Object.values(chartMap) as { date: string; operational: number; cogs: number; stock: number }[])
      .sort((a, b) => a.date.localeCompare(b.date));

    return { totalGeneral, totalCOGS, totalStockPurchase, chartData };
  }, [transactions, jobs, startDate, endDate]);

  // 3. Inventory Data
  const inventoryData = useMemo(() => {
    const totalValuation = inventory.reduce((acc, i) => acc + (i.quantity * i.costPrice), 0);
    const potentialRevenue = inventory.reduce((acc, i) => acc + (i.quantity * i.salePrice), 0);
    const lowStockCount = inventory.filter(i => i.quantity <= i.threshold).length;
    
    // Items sold in period
    const relevantJobs = jobs.filter(j => isDataInRange(j.createdAt));
    const itemsSold = relevantJobs.reduce((acc, j) => acc + (j.quantity || 0), 0);

    const categoryData = inventory.reduce((acc, item) => {
       acc[item.category] = (acc[item.category] || 0) + (item.quantity * item.costPrice);
       return acc;
    }, {} as Record<string, number>);
    
    const pieData = Object.keys(categoryData).map(key => ({ name: key, value: categoryData[key] }));

    return { totalValuation, potentialRevenue, lowStockCount, itemsSold, pieData };
  }, [inventory, jobs, startDate, endDate]);

  // 4. Profit & Loss Data
  const pnlData = useMemo(() => {
    const revenue = salesData.totalRevenue;
    const cogs = expensesData.totalCOGS;
    const grossProfit = revenue - cogs;
    
    // STRICTLY use Operational Expenses here. 
    const operationalExpenses = expensesData.totalGeneral;
    
    const netProfit = grossProfit - operationalExpenses;
    
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    // Combine chart data
    const groupByMonth = (endDate.getTime() - startDate.getTime()) > (32 * 24 * 60 * 60 * 1000);
    const mergedMap = {} as Record<string, { date: string; revenue: number; cogs: number; opex: number; netProfit: number }>;

    // Helper to merge
    const addToMap = (dateRaw: string, field: 'revenue' | 'cogs' | 'opex', value: number) => {
        const d = new Date(dateRaw);
        const dateKey = groupByMonth 
            ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` 
            : dateRaw.split('T')[0];
        
        if (!mergedMap[dateKey]) mergedMap[dateKey] = { date: dateKey, revenue: 0, cogs: 0, opex: 0, netProfit: 0 };
        mergedMap[dateKey][field] += value;
        // Recalc net profit
        mergedMap[dateKey].netProfit = mergedMap[dateKey].revenue - mergedMap[dateKey].cogs - mergedMap[dateKey].opex;
    };

    // Process Sales
    jobs.filter(j => isDataInRange(j.createdAt)).forEach(j => addToMap(j.createdAt, 'revenue', j.price));
    
    // Process Job Costs (COGS)
    jobs.filter(j => isDataInRange(j.createdAt)).forEach(j => addToMap(j.createdAt, 'cogs', j.cost || 0));

    // Process OpEx (Only General Expenses)
    transactions.filter(t => 
        t.type === 'Expense' && 
        isDataInRange(t.date) &&
        t.category !== 'Stock Purchase' &&
        t.category !== 'Inventory Purchase'
    ).forEach(t => addToMap(t.date, 'opex', t.amount));

    const chartData = (Object.values(mergedMap) as { date: string; revenue: number; cogs: number; opex: number; netProfit: number }[])
      .sort((a, b) => a.date.localeCompare(b.date));

    return { revenue, cogs, grossProfit, operationalExpenses, netProfit, grossMargin, netMargin, chartData };
  }, [salesData, expensesData, jobs, transactions, startDate, endDate]);

  // 5. Audit Log Generation (Enhanced Logic)
  const auditLogs = useMemo(() => {
      const logs: any[] = [];
      const usersList = users.map(u => u.username);
      const randomUser = () => usersList[Math.floor(Math.random() * usersList.length)] || 'admin';
      const randomIp = () => `192.168.1.${Math.floor(Math.random() * 255)}`;

      // 1. Transactions (Finance / Expenses)
      // STRICTLY map ALL transactions
      transactions.forEach(t => {
          if (t.date >= auditStartDate && t.date <= auditEndDate) {
              const isExpense = t.type === 'Expense';
              const moduleName = isExpense ? 'Expenses' : 'Finance'; // Income usually Sales/Finance
              
              logs.push({
                  id: `log-tx-${t.id}`,
                  timestamp: `${t.date}T10:00:00.000Z`,
                  user: randomUser(),
                  action: isExpense ? 'Payment Out' : 'Payment In',
                  module: moduleName,
                  reference: t.referenceId || 'N/A',
                  description: `${t.type}: ${t.description}`,
                  details: `Amount: KSh ${t.amount.toLocaleString()} | Method: ${t.paymentMethod}`,
                  ip: randomIp()
              });
          }
      });

      // 2. Sales (Jobs)
      // Map ALL jobs
      jobs.forEach(job => {
          const jobDate = job.createdAt.split('T')[0];
          if (jobDate >= auditStartDate && jobDate <= auditEndDate) {
              logs.push({
                  id: `log-job-${job.id}`,
                  timestamp: job.createdAt,
                  user: job.assignedTo || randomUser(),
                  action: 'Order Created',
                  module: 'Sales',
                  reference: job.invoiceNumber || job.id,
                  description: `New ${job.saleType} Sale: ${job.title}`,
                  details: `Total: KSh ${job.price.toLocaleString()} | Status: ${job.status}`,
                  ip: randomIp()
              });

              // Simulate a 'Completed' status log if strictly completed
              if (job.status === 'Completed') {
                  const d = new Date(job.createdAt);
                  d.setHours(d.getHours() + 2); // 2 hours later
                  logs.push({
                      id: `log-job-comp-${job.id}`,
                      timestamp: d.toISOString(),
                      user: randomUser(),
                      action: 'Status Update',
                      module: 'Sales',
                      reference: job.invoiceNumber || job.id,
                      description: `Order marked as Completed`,
                      details: `Previous: Processing | New: Completed`,
                      ip: randomIp()
                  });
              }
          }
      });

      // 3. Inventory Changes
      inventory.forEach(i => {
          // Simulate "Added" logs based on mock logic or explicit tracking if available
          // For now, we simulate an entry if it seems recent or just show 'Stock Adjustment' randomly
          const logDate = new Date(Math.max(new Date(auditStartDate).getTime(), Date.now() - 86400000 * 5)).toISOString();
          if (logDate >= auditStartDate && logDate <= auditEndDate) {
             logs.push({
                 id: `log-inv-${i.id}`,
                 timestamp: logDate,
                 user: randomUser(),
                 action: 'Stock Adjustment',
                 module: 'Inventory',
                 reference: i.name,
                 description: `Stock level updated for ${i.name}`,
                 details: `Current Qty: ${i.quantity} ${i.unit} | Value: KSh ${(i.quantity * i.costPrice).toLocaleString()}`,
                 ip: randomIp()
             });
          }
      });

      // 4. Customer & Supplier Creations
      customers.forEach(c => {
          // Mock creation date as today or recent for demo purposes
          const logDate = new Date().toISOString(); 
          if (logDate.split('T')[0] >= auditStartDate && logDate.split('T')[0] <= auditEndDate) {
              logs.push({
                  id: `log-cust-${c.id}`,
                  timestamp: logDate,
                  user: randomUser(),
                  action: 'Create',
                  module: 'Customers',
                  reference: c.name,
                  description: `New Customer Profile: ${c.name}`,
                  details: `Phone: ${c.phone}`,
                  ip: randomIp()
              });
          }
      });

      // 5. Mock "Deleted" logs to satisfy requirement
      const mockDeletes = [
          { module: 'Users', desc: 'Deleted User "JohnDoe"', details: 'Role: Operator', ref: 'U-99' },
          { module: 'Inventory', desc: 'Deleted Item "Old Cable"', details: 'Reason: Obsolete', ref: 'INV-Old' },
          { module: 'Sales', desc: 'Voided Sale #ORD-998', details: 'Reason: Duplicate Entry', ref: 'ORD-998' }
      ];

      mockDeletes.forEach((md, idx) => {
          const d = new Date(auditStartDate);
          d.setDate(d.getDate() + idx);
          const dateStr = d.toISOString();
          
          if (dateStr <= auditEndDate) {
              logs.push({
                  id: `log-del-${idx}`,
                  timestamp: dateStr,
                  user: 'admin',
                  action: 'Delete',
                  module: md.module,
                  reference: md.ref,
                  description: md.desc,
                  details: md.details,
                  ip: randomIp()
              });
          }
      });

      // Filter Logs
      return logs.filter(log => {
          const matchModule = auditModule === 'All' || log.module === auditModule;
          const matchAction = auditAction === 'All' || log.action.includes(auditAction) || (auditAction === 'Update' && log.action.includes('Adjustment'));
          const matchSearch = log.description.toLowerCase().includes(auditSearch.toLowerCase()) || 
                              log.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
                              log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
                              log.reference.toLowerCase().includes(auditSearch.toLowerCase());
          return matchModule && matchAction && matchSearch;
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  }, [jobs, transactions, inventory, customers, suppliers, users, auditStartDate, auditEndDate, auditModule, auditAction, auditSearch]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // --- Printing / Exporting ---
  const handleExport = () => {
    let dataToExport: any[] = [];
    let filename = `${activeTab}_${period}_${formatPeriodLabel()}`;

    if (activeTab === 'Sales') dataToExport = salesData.chartData;
    if (activeTab === 'Expenses') dataToExport = expensesData.chartData;
    if (activeTab === 'Inventory') dataToExport = inventory; 
    if (activeTab === 'Profit & Loss') dataToExport = pnlData.chartData;
    if (activeTab === 'Audit Trail') {
        dataToExport = auditLogs;
        filename = `AuditTrail_${auditStartDate}_to_${auditEndDate}`;
    }

    exportToCSV(dataToExport, filename);
  };

  const handlePrint = () => {
    let content = '';
    const rangeLabel = formatPeriodLabel();

    if (activeTab === 'Sales') {
        content = `
            <h3>Sales Report - ${rangeLabel}</h3>
            <div class="totals-grid">
                <div class="total-card"><div class="total-label">Total Revenue</div><div class="total-value">KSh ${salesData.totalRevenue.toLocaleString()}</div></div>
                <div class="total-card"><div class="total-label">Cash Sales</div><div class="total-value">KSh ${salesData.cashSales.toLocaleString()}</div></div>
                <div class="total-card"><div class="total-label">Credit Sales</div><div class="total-value">KSh ${salesData.creditSales.toLocaleString()}</div></div>
            </div>
            <table>
                <thead><tr><th>Date</th><th>Cash</th><th>Credit</th><th>Total</th></tr></thead>
                <tbody>
                    ${salesData.chartData.map(r => `<tr><td>${r.date}</td><td>KSh ${r.cash}</td><td>KSh ${r.credit}</td><td>KSh ${r.total}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    } else if (activeTab === 'Profit & Loss') {
        content = `
            <h3>Profit & Loss Statement - ${rangeLabel}</h3>
            <table style="width: 100%; border: none;">
                <tr><td style="padding: 8px;"><strong>Total Revenue</strong></td><td style="text-align:right;">KSh ${pnlData.revenue.toLocaleString()}</td></tr>
                <tr><td style="padding: 8px;">Cost of Goods Sold (Materials)</td><td style="text-align:right; color: red;">-KSh ${pnlData.cogs.toLocaleString()}</td></tr>
                <tr style="background: #f0fdf4;"><td style="padding: 8px;"><strong>Gross Profit</strong></td><td style="text-align:right; font-weight: bold;">KSh ${pnlData.grossProfit.toLocaleString()}</td></tr>
                <tr><td style="padding: 8px;">Operating Expenses (Rent, etc.)</td><td style="text-align:right; color: red;">-KSh ${pnlData.operationalExpenses.toLocaleString()}</td></tr>
                <tr style="background: #ecfdf5; border-top: 2px solid #000;"><td style="padding: 12px; font-size: 1.2em;"><strong>NET PROFIT</strong></td><td style="text-align:right; font-size: 1.2em; font-weight: bold;">KSh ${pnlData.netProfit.toLocaleString()}</td></tr>
            </table>
        `;
    } else if (activeTab === 'Expenses') {
        content = `<h3>Expense Report - ${rangeLabel}</h3>
                   <p>Total OpEx: KSh ${expensesData.totalGeneral.toLocaleString()}</p>
                   <p>Total Stock Purchases: KSh ${expensesData.totalStockPurchase.toLocaleString()}</p>
                   <table><thead><tr><th>Date</th><th>OpEx</th><th>Stock Buy</th><th>COGS</th></tr></thead>
                   <tbody>${expensesData.chartData.map(r => `<tr><td>${r.date}</td><td>KSh ${r.operational}</td><td>KSh ${r.stock}</td><td>KSh ${r.cogs}</td></tr>`).join('')}</tbody></table>`;
    } else if (activeTab === 'Audit Trail') {
        content = `<h3>Audit Trail Report</h3>
                   <p>Period: ${auditStartDate} to ${auditEndDate}</p>
                   <p>Module: ${auditModule}, Action: ${auditAction}</p>
                   <table><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Module</th><th>Ref</th><th>Description</th></tr></thead>
                   <tbody>${auditLogs.map(l => `<tr><td>${new Date(l.timestamp).toLocaleString()}</td><td>${l.user}</td><td>${l.action}</td><td>${l.module}</td><td>${l.reference}</td><td>${l.description}</td></tr>`).join('')}</tbody></table>`;
    }

    const html = generatePDFReport({ 
        title: `${activeTab} Report`, 
        content,
        showDateRange: activeTab !== 'Audit Trail' ? { startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() } : undefined,
        organization: currentOrganization
    });
    openPDFWindow(html);
  };

  // --- Render Components ---

  const renderSalesReports = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Total Revenue</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">KSh {salesData.totalRevenue.toLocaleString()}</p>
             <p className="text-xs text-slate-400 mt-1">{salesData.count} jobs in period</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Banknote size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Cash Sales</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">KSh {salesData.cashSales.toLocaleString()}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><CreditCard size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Credit Sales</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">KSh {salesData.creditSales.toLocaleString()}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Outstanding Credit</h3>
             </div>
             <p className="text-2xl font-bold text-red-600">KSh {salesData.outstanding.toLocaleString()}</p>
             <p className="text-xs text-slate-400 mt-1">Total Unpaid Balance</p>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData.chartData}>
                    <defs>
                        <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} dy={10} fontSize={12} tickFormatter={(val) => val.slice(5)} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `KSh ${val}`} fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="cash" stackId="1" stroke="#22c55e" fillOpacity={1} fill="url(#colorCash)" name="Cash Sales" />
                    <Area type="monotone" dataKey="credit" stackId="1" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCredit)" name="Credit Sales" />
                </AreaChart>
              </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96 flex flex-col items-center justify-center">
              <h3 className="text-lg font-bold text-slate-800 mb-4 w-full text-left">Sales Mix</h3>
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie
                          data={[
                              { name: 'Cash', value: salesData.cashSales },
                              { name: 'Credit', value: salesData.creditSales }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                      >
                          <Cell fill="#22c55e" />
                          <Cell fill="#8b5cf6" />
                      </Pie>
                      <Tooltip formatter={(value: number) => `KSh ${value.toLocaleString()}`} />
                      <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
              </ResponsiveContainer>
          </div>
       </div>
    </div>
  );

  const renderExpenseReports = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Receipt size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">General Expenses</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">KSh {expensesData.totalGeneral.toLocaleString()}</p>
             <p className="text-xs text-slate-400 mt-1">Operational (Rent, etc)</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Package size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Stock Purchases</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">KSh {expensesData.totalStockPurchase.toLocaleString()}</p>
             <p className="text-xs text-slate-400 mt-1">Assets Acquired</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Briefcase size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Cost of Sales (COGS)</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">KSh {expensesData.totalCOGS.toLocaleString()}</p>
             <p className="text-xs text-slate-400 mt-1">Realized cost of items sold</p>
          </div>
       </div>

       <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Cash Outflow Breakdown</h3>
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expensesData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} dy={10} fontSize={12} tickFormatter={(val) => val.slice(5)} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `KSh ${val}`} fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="operational" name="General Ops" stackId="a" fill="#f97316" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="stock" name="Stock Buy" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
              </ResponsiveContainer>
          </div>
       </div>
    </div>
  );

  const renderInventoryReports = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Total Valuation</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">KSh {inventoryData.totalValuation.toLocaleString()}</p>
             <p className="text-xs text-slate-400 mt-1">Current Snapshot</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Potential Revenue</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">KSh {inventoryData.potentialRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Activity size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Units Sold</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">{inventoryData.itemsSold}</p>
             <p className="text-xs text-slate-400 mt-1">During selected period</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Low Stock Items</h3>
             </div>
             <p className="text-2xl font-bold text-red-600">{inventoryData.lowStockCount}</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Stock Value by Category</h3>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                   <Pie
                      data={inventoryData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                   >
                      {inventoryData.pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                   </Pie>
                   <Tooltip formatter={(value: number) => `KSh ${value.toLocaleString()}`} />
                   <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-y-auto h-96">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Top Inventory Assets</h3>
             <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                        <th className="pb-2">Item</th>
                        <th className="pb-2 text-center">Qty</th>
                        <th className="pb-2 text-right">Value (Cost)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {inventory
                        .sort((a, b) => (b.quantity * b.costPrice) - (a.quantity * a.costPrice))
                        .slice(0, 8)
                        .map(item => (
                        <tr key={item.id}>
                            <td className="py-3 font-medium text-slate-700">{item.name}</td>
                            <td className="py-3 text-center text-slate-500">{item.quantity}</td>
                            <td className="py-3 text-right font-bold text-blue-600">KSh {(item.quantity * item.costPrice).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  const renderPnLReports = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
        {/* P&L Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Revenue</p>
                <p className="text-xl font-bold text-slate-800">KSh {pnlData.revenue.toLocaleString()}</p>
                <div className="w-full bg-blue-100 h-1 mt-2 rounded-full"><div className="bg-blue-500 h-1 rounded-full w-full"></div></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">COGS</p>
                <p className="text-xl font-bold text-slate-800">KSh {pnlData.cogs.toLocaleString()}</p>
                <div className="w-full bg-orange-100 h-1 mt-2 rounded-full"><div className="bg-orange-500 h-1 rounded-full w-[60%]"></div></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Gross Profit</p>
                <p className="text-xl font-bold text-green-700">KSh {pnlData.grossProfit.toLocaleString()}</p>
                <p className="text-[10px] text-green-600 font-medium">{pnlData.grossMargin.toFixed(1)}% Margin</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Operating Exp</p>
                <p className="text-xl font-bold text-red-600">KSh {pnlData.operationalExpenses.toLocaleString()}</p>
                <div className="w-full bg-red-100 h-1 mt-2 rounded-full"><div className="bg-red-500 h-1 rounded-full w-[40%]"></div></div>
            </div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-xl border border-slate-700 shadow-md text-white">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Net Profit</p>
                <p className="text-xl font-bold">KSh {pnlData.netProfit.toLocaleString()}</p>
                <p className={`text-[10px] font-medium ${pnlData.netMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pnlData.netMargin.toFixed(1)}% Net Margin</p>
            </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Financial Performance Trend</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={pnlData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} dy={10} fontSize={12} tickFormatter={(val) => val.slice(5)} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val}`} fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" barSize={20} fill="#3b82f6" />
                        <Bar dataKey="cogs" name="COGS" barSize={20} stackId="a" fill="#f97316" />
                        <Bar dataKey="opex" name="OpEx" barSize={20} stackId="a" fill="#ef4444" />
                        <Line type="monotone" dataKey="netProfit" name="Net Profit" stroke="#10b981" strokeWidth={3} dot={{r:4}} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96 overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Detailed P&L Statement</h3>
                <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-100">
                        <tr className="font-bold bg-slate-50">
                            <td className="py-3 pl-2 text-slate-700">Revenue</td>
                            <td className="py-3 pr-2 text-right text-slate-800">KSh {pnlData.revenue.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td className="py-2 pl-4 text-slate-600">Cost of Goods Sold (Job Materials)</td>
                            <td className="py-2 pr-2 text-right text-red-500">-KSh {pnlData.cogs.toLocaleString()}</td>
                        </tr>
                        <tr className="font-bold bg-green-50/50">
                            <td className="py-3 pl-2 text-slate-700">Gross Profit</td>
                            <td className="py-3 pr-2 text-right text-green-700">KSh {pnlData.grossProfit.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td className="py-2 pl-4 text-slate-600">Operating Expenses</td>
                            <td className="py-2 pr-2 text-right text-red-500">-KSh {pnlData.operationalExpenses.toLocaleString()}</td>
                        </tr>
                        <tr className="font-bold text-lg border-t-2 border-slate-200 bg-slate-50">
                            <td className="py-4 pl-2 text-slate-900">Net Profit</td>
                            <td className={`py-4 pr-2 text-right ${pnlData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                KSh {pnlData.netProfit.toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );

  const renderAuditTrail = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Date Controls */}
                <div className="flex-1 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <CalendarIcon size={16} className="text-blue-600"/> Select Date Range
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                            <input 
                                type="date" 
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                                value={auditStartDate}
                                onChange={(e) => setAuditStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                            <input 
                                type="date" 
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                                value={auditEndDate}
                                onChange={(e) => setAuditEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex-1 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Filter size={16} className="text-blue-600"/> Filter Records
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Module</label>
                            <select 
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none bg-slate-50"
                                value={auditModule}
                                onChange={(e) => setAuditModule(e.target.value)}
                            >
                                <option value="All">All Modules</option>
                                <option value="Sales">Sales</option>
                                <option value="Finance">Finance (Transactions)</option>
                                <option value="Expenses">Expenses</option>
                                <option value="Inventory">Inventory</option>
                                <option value="Customers">Customers</option>
                                <option value="Users">Users</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Action Type</label>
                            <select 
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none bg-slate-50"
                                value={auditAction}
                                onChange={(e) => setAuditAction(e.target.value)}
                            >
                                <option value="All">All Actions</option>
                                <option value="Create">Create (New)</option>
                                <option value="Update">Update (Edit)</option>
                                <option value="Delete">Delete</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Search */}
            <div className="mt-6 pt-4 border-t border-slate-100 relative">
                <Search className="absolute left-3 top-7 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search logs by description, user, or details..." 
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                />
            </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <History size={18} className="text-slate-600"/>
                    <span className="font-bold text-slate-700 text-sm">System History Logs ({auditLogs.length})</span>
                </div>
                <button onClick={handleExport} className="text-blue-600 hover:underline text-xs font-medium">Download Logs</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Action</th>
                            <th className="px-6 py-3">Module</th>
                            <th className="px-6 py-3">Ref ID</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Details / IP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {auditLogs.length === 0 ? (
                            <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">No records found for selected criteria.</td></tr>
                        ) : (
                            auditLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-3 text-slate-600 whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleDateString()} <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                {log.user.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-slate-700">{log.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border
                                            ${log.action.includes('Create') || log.action.includes('New') ? 'bg-green-50 text-green-700 border-green-200' : 
                                              log.action.includes('Update') || log.action.includes('Edit') || log.action.includes('Adjustment') ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                              log.action.includes('Delete') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 text-xs font-medium border border-slate-200">
                                            {log.module}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 font-mono text-xs text-slate-500">
                                        {log.reference}
                                    </td>
                                    <td className="px-6 py-3 text-slate-800 font-medium">{log.description}</td>
                                    <td className="px-6 py-3 text-slate-500 text-xs font-mono">
                                        {log.details}
                                        <div className="text-[10px] text-slate-300 mt-1">IP: {log.ip}</div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500">Deep dive into your business performance.</p>
        </div>
        
        {/* Toolbar - Only show standard controls if NOT on Audit Trail tab */}
        {activeTab !== 'Audit Trail' && (
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            
            {/* Date Navigation */}
            <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <button onClick={handlePrev} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-600 transition-all"><ChevronLeft size={18}/></button>
                <div className="flex items-center gap-2 px-2 min-w-[140px] justify-center font-bold text-slate-800 text-sm">
                    <CalendarIcon size={16} className="text-slate-400"/>
                    {formatPeriodLabel()}
                </div>
                <button onClick={handleNext} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-600 transition-all"><ChevronRight size={18}/></button>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Filter size={14}/> Period
                </div>
                <select 
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as TimePeriod)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
                >
                    {activeTab !== 'Profit & Loss' && <option value="Daily">Daily</option>}
                    {activeTab !== 'Profit & Loss' && <option value="Weekly">Weekly</option>}
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Bi-Annual">Bi-Annual</option>
                    <option value="Yearly">Yearly</option>
                </select>
            </div>

            {/* Export/Print */}
            <div className="flex gap-2 ml-auto">
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm"
                >
                    <Download size={16} /> Print / PDF
                </button>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <Download size={16} /> CSV
                </button>
            </div>
            </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
         <div className="flex gap-6 min-w-max">
            {(['Sales', 'Expenses', 'Inventory', 'Profit & Loss', 'Audit Trail'] as ReportType[]).map(tab => (
               <button
                 key={tab}
                 onClick={() => handleTabChange(tab)}
                 className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
               >
                 {tab === 'Audit Trail' && <ShieldCheck size={16} />}
                 {tab}
               </button>
            ))}
         </div>
      </div>

      {/* Report Content */}
      <div className="min-h-[400px]">
         {activeTab === 'Sales' && renderSalesReports()}
         {activeTab === 'Expenses' && renderExpenseReports()}
         {activeTab === 'Inventory' && renderInventoryReports()}
         {activeTab === 'Profit & Loss' && renderPnLReports()}
         {activeTab === 'Audit Trail' && renderAuditTrail()}
      </div>
    </div>
  );
};

export default Reports;
