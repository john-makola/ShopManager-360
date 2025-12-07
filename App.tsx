
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Inventory from './pages/Inventory';
import AiInsights from './pages/AiInsights';
import Expenses from './pages/Expenses';
import ExpenseRecords from './pages/ExpenseRecords';
import ServicesProducts from './pages/ServicesProducts';
import Reports from './pages/Reports';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import SearchResults from './pages/SearchResults';
import Users from './pages/Users';
import { AppProvider } from './contexts/AppContext';

// Placeholder components for routes not fully implemented in this demo
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-64 text-slate-400">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-300 mb-2">{title}</h2>
      <p>Module coming soon.</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* Sales Routes */}
            <Route path="/sales/cash" element={<Jobs mode="Cash" />} />
            <Route path="/sales/credit" element={<Jobs mode="Credit" />} />
            
            {/* Redirect old path */}
            <Route path="/jobs" element={<Navigate to="/sales/cash" replace />} />
            
            <Route path="/expenses/list" element={<Expenses />} />
            <Route path="/expenses/records" element={<ExpenseRecords />} />
            <Route path="/services" element={<ServicesProducts />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/insights" element={<AiInsights />} />
            
            {/* Global Search */}
            <Route path="/search" element={<SearchResults />} />
            
            {/* Reports Routes - All mapping to Reports component which handles internal tabs */}
            <Route path="/reports/sales" element={<Reports />} />
            <Route path="/reports/expenses" element={<Reports />} />
            <Route path="/reports/inventory" element={<Reports />} />
            <Route path="/reports/pnl" element={<Reports />} />
            
            <Route path="/customers" element={<Customers />} />
            <Route path="/users" element={<Users />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;
