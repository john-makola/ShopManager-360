
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend, ComposedChart, Line
} from 'recharts';
import { 
  Download, DollarSign, Package, 
  CreditCard, Banknote, AlertCircle, Briefcase, Receipt, TrendingUp, TrendingDown,
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Activity
} from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { generatePDFReport, openPDFWindow } from '../utils/pdfUtils';

type ReportType = 'Sales' | 'Expenses' | 'Inventory' | 'Profit & Loss';
type TimePeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Yearly';

const Reports: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { jobs, transactions, inventory } = useAppContext();
  
  // Determine default tab based on URL
  const getTabFromPath = (path: string): ReportType => {
    if (path.includes('expenses')) return 'Expenses';
    if (path.includes('inventory')) return 'Inventory';
    if (path.includes('pnl')) return 'Profit & Loss';
    return 'Sales';
  };

  const [activeTab, setActiveTab] = useState<ReportType>(getTabFromPath(location.pathname));
  const [period, setPeriod] = useState<TimePeriod>('Monthly');
  const [currentDate, setCurrentDate] = useState(new Date());

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
    
    // Grouping Strategy based on period length
    // If > 31 days, group by Month. Else group by Day.
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
  const expensesData = useMemo(() => {
    const generalExpenses = transactions.filter(t => t.type === 'Expense' && isDataInRange(t.date));
    const totalGeneral = generalExpenses.reduce((acc, t) => acc + t.amount, 0);

    const relevantJobs = jobs.filter(j => isDataInRange(j.createdAt));
    const totalCOGS = relevantJobs.reduce((acc, j) => acc + (j.cost || 0), 0);

    const totalExpenses = totalGeneral + totalCOGS;

    const groupByMonth = (endDate.getTime() - startDate.getTime()) > (32 * 24 * 60 * 60 * 1000);

    const chartMap = {} as Record<string, { date: string; operational: number; cogs: number }>;

    generalExpenses.forEach(t => {
      const d = new Date(t.date);
      const dateKey = groupByMonth 
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` 
        : t.date;
      if (!chartMap[dateKey]) chartMap[dateKey] = { date: dateKey, operational: 0, cogs: 0 };
      chartMap[dateKey].operational += t.amount;
    });

    relevantJobs.forEach(j => {
      const d = new Date(j.createdAt);
      const dateKey = groupByMonth 
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` 
        : j.createdAt.split('T')[0];
      if (!chartMap[dateKey]) chartMap[dateKey] = { date: dateKey, operational: 0, cogs: 0 };
      chartMap[dateKey].cogs += (j.cost || 0);
    });

    const chartData = (Object.values(chartMap) as { date: string; operational: number; cogs: number }[])
      .sort((a, b) => a.date.localeCompare(b.date));

    return { totalGeneral, totalCOGS, totalExpenses, chartData, count: generalExpenses.length };
  }, [transactions, jobs, startDate, endDate]);

  // 3. Inventory Data
  // Note: Inventory valuation is generally a snapshot of NOW. 
  // However, we can show "Sales Quantity" during this period as "Inventory Movement"
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

    // Process Expenses
    transactions.filter(t => t.type === 'Expense' && isDataInRange(t.date)).forEach(t => addToMap(t.date, 'opex', t.amount));

    const chartData = (Object.values(mergedMap) as { date: string; revenue: number; cogs: number; opex: number; netProfit: number }[])
      .sort((a, b) => a.date.localeCompare(b.date));

    return { revenue, cogs, grossProfit, operationalExpenses, netProfit, grossMargin, netMargin, chartData };
  }, [salesData, expensesData, jobs, transactions, startDate, endDate]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // --- Printing / Exporting ---
  const handleExport = () => {
    let dataToExport: any[] = [];
    let filename = `${activeTab}_${period}_${formatPeriodLabel()}`;

    if (activeTab === 'Sales') dataToExport = salesData.chartData;
    if (activeTab === 'Expenses') dataToExport = expensesData.chartData;
    if (activeTab === 'Inventory') dataToExport = inventory; 
    if (activeTab === 'Profit & Loss') dataToExport = pnlData.chartData;

    exportToCSV(dataToExport, filename);
  };

  const handlePrint = () => {
    let content = '';
    const rangeLabel = formatPeriodLabel();

    if (activeTab === 'Sales') {
        content = `
            <h3>Sales Report - ${rangeLabel}</h3>
            <div class="totals-grid">
                <div class="total-card"><div class="total-label">Total Revenue</div><div class="total-value">$${salesData.totalRevenue.toLocaleString()}</div></div>
                <div class="total-card"><div class="total-label">Cash Sales</div><div class="total-value">$${salesData.cashSales.toLocaleString()}</div></div>
                <div class="total-card"><div class="total-label">Credit Sales</div><div class="total-value">$${salesData.creditSales.toLocaleString()}</div></div>
            </div>
            <table>
                <thead><tr><th>Date</th><th>Cash</th><th>Credit</th><th>Total</th></tr></thead>
                <tbody>
                    ${salesData.chartData.map(r => `<tr><td>${r.date}</td><td>$${r.cash}</td><td>$${r.credit}</td><td>$${r.total}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    } else if (activeTab === 'Profit & Loss') {
        content = `
            <h3>Profit & Loss Statement - ${rangeLabel}</h3>
            <table style="width: 100%; border: none;">
                <tr><td style="padding: 8px;"><strong>Total Revenue</strong></td><td style="text-align:right;">$${pnlData.revenue.toLocaleString()}</td></tr>
                <tr><td style="padding: 8px;">Cost of Goods Sold</td><td style="text-align:right; color: red;">-$${pnlData.cogs.toLocaleString()}</td></tr>
                <tr style="background: #f0fdf4;"><td style="padding: 8px;"><strong>Gross Profit</strong></td><td style="text-align:right; font-weight: bold;">$${pnlData.grossProfit.toLocaleString()}</td></tr>
                <tr><td style="padding: 8px;">Operating Expenses</td><td style="text-align:right; color: red;">-$${pnlData.operationalExpenses.toLocaleString()}</td></tr>
                <tr style="background: #ecfdf5; border-top: 2px solid #000;"><td style="padding: 12px; font-size: 1.2em;"><strong>NET PROFIT</strong></td><td style="text-align:right; font-size: 1.2em; font-weight: bold;">$${pnlData.netProfit.toLocaleString()}</td></tr>
            </table>
        `;
    } else if (activeTab === 'Expenses') {
        content = `<h3>Expense Report - ${rangeLabel}</h3>
                   <p>Total: $${expensesData.totalExpenses.toLocaleString()}</p>
                   <table><thead><tr><th>Date</th><th>Operational</th><th>Job Costs</th></tr></thead>
                   <tbody>${expensesData.chartData.map(r => `<tr><td>${r.date}</td><td>$${r.operational}</td><td>$${r.cogs}</td></tr>`).join('')}</tbody></table>`;
    }

    const html = generatePDFReport({ 
        title: `${activeTab} Report`, 
        content,
        showDateRange: { startDate: startDate.toLocaleDateString(), endDate: endDate.toLocaleDateString() }
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
             <p className="text-2xl font-bold text-slate-800">${salesData.totalRevenue.toLocaleString()}</p>
             <p className="text-xs text-slate-400 mt-1">{salesData.count} jobs in period</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Banknote size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Cash Sales</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">${salesData.cashSales.toLocaleString()}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><CreditCard size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Credit Sales</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">${salesData.creditSales.toLocaleString()}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Outstanding Credit</h3>
             </div>
             <p className="text-2xl font-bold text-red-600">${salesData.outstanding.toLocaleString()}</p>
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
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} fontSize={12} />
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
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
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
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><TrendingDown size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Total Expenses</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">${expensesData.totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Receipt size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">General Expenses</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">${expensesData.totalGeneral.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Briefcase size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Cost of Sales</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">${expensesData.totalCOGS.toLocaleString()}</p>
          </div>
       </div>

       <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Expense Breakdown Trend</h3>
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expensesData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} dy={10} fontSize={12} tickFormatter={(val) => val.slice(5)} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="operational" name="General Ops" stackId="a" fill="#f97316" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="cogs" name="Job Costs" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
              </ResponsiveContainer>
          </div>
       </div>
    </div>
  );

  const renderInventoryReports = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
       {/* Inventory stats are snapshots, but 'Items Sold' is period-based */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Total Valuation</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">${inventoryData.totalValuation.toLocaleString()}</p>
             <p className="text-xs text-slate-400 mt-1">Current Snapshot</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
                <h3 className="text-slate-500 text-xs uppercase font-bold">Potential Revenue</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">${inventoryData.potentialRevenue.toLocaleString()}</p>
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
                   <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
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
                            <td className="py-3 text-right font-bold text-blue-600">${(item.quantity * item.costPrice).toLocaleString()}</td>
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
                <p className="text-xl font-bold text-slate-800">${pnlData.revenue.toLocaleString()}</p>
                <div className="w-full bg-blue-100 h-1 mt-2 rounded-full"><div className="bg-blue-500 h-1 rounded-full w-full"></div></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">COGS</p>
                <p className="text-xl font-bold text-slate-800">${pnlData.cogs.toLocaleString()}</p>
                <div className="w-full bg-orange-100 h-1 mt-2 rounded-full"><div className="bg-orange-500 h-1 rounded-full w-[60%]"></div></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Gross Profit</p>
                <p className="text-xl font-bold text-green-700">${pnlData.grossProfit.toLocaleString()}</p>
                <p className="text-[10px] text-green-600 font-medium">{pnlData.grossMargin.toFixed(1)}% Margin</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Operating Exp</p>
                <p className="text-xl font-bold text-red-600">${pnlData.operationalExpenses.toLocaleString()}</p>
                <div className="w-full bg-red-100 h-1 mt-2 rounded-full"><div className="bg-red-500 h-1 rounded-full w-[40%]"></div></div>
            </div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-xl border border-slate-700 shadow-md text-white">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Net Profit</p>
                <p className="text-xl font-bold">${pnlData.netProfit.toLocaleString()}</p>
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
                            <td className="py-3 pr-2 text-right text-slate-800">${pnlData.revenue.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td className="py-2 pl-4 text-slate-600">Cost of Goods Sold (Job Materials)</td>
                            <td className="py-2 pr-2 text-right text-red-500">-${pnlData.cogs.toLocaleString()}</td>
                        </tr>
                        <tr className="font-bold bg-green-50/50">
                            <td className="py-3 pl-2 text-slate-700">Gross Profit</td>
                            <td className="py-3 pr-2 text-right text-green-700">${pnlData.grossProfit.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td className="py-2 pl-4 text-slate-600">Operating Expenses</td>
                            <td className="py-2 pr-2 text-right text-red-500">-${pnlData.operationalExpenses.toLocaleString()}</td>
                        </tr>
                        <tr className="font-bold text-lg border-t-2 border-slate-200 bg-slate-50">
                            <td className="py-4 pl-2 text-slate-900">Net Profit</td>
                            <td className={`py-4 pr-2 text-right ${pnlData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${pnlData.netProfit.toLocaleString()}
                            </td>
                        </tr>
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
        
        {/* Toolbar */}
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
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
         <div className="flex gap-6 min-w-max">
            {(['Sales', 'Expenses', 'Inventory', 'Profit & Loss'] as ReportType[]).map(tab => (
               <button
                 key={tab}
                 onClick={() => handleTabChange(tab)}
                 className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
               >
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
      </div>
    </div>
  );
};

export default Reports;
