
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Settings from './pages/Settings';
import Home from './pages/Home';
import FeaturesPage from './pages/FeaturesPage';
import About from './pages/About';
import Contact from './pages/Contact';
import LearnMore from './pages/LearnMore';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Wrapper to handle conditional layout
const AppContent: React.FC = () => {
    const { isAuthenticated } = useAppContext();
    const location = useLocation();

    // Routes that don't require authentication and have their own layout
    const publicRoutes = ['/', '/features', '/about', '/contact', '/learn-more'];
    
    // If accessing a public route while not authenticated, show that page
    // Note: '/' is Home, which handles login.
    if (!isAuthenticated) {
        if (location.pathname === '/features') return <FeaturesPage />;
        if (location.pathname === '/about') return <About />;
        if (location.pathname === '/contact') return <Contact />;
        if (location.pathname === '/learn-more') return <LearnMore />;
        
        // Default to Home for any other unauthenticated path
        // We use strict matching for Home to avoid loop if * is matched
        if (location.pathname !== '/' && !publicRoutes.includes(location.pathname)) {
             return <Navigate to="/" replace />;
        }
        return <Home />;
    }

    // If authenticated, prevent access to Home/Login page, redirect to Dashboard
    if (isAuthenticated && location.pathname === '/') {
        return <Navigate to="/dashboard" replace />;
    }
    
    // Authenticated Layout Routes
    return (
        <Layout>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
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
            <Route path="/reports/audit" element={<Reports />} />
            
            <Route path="/customers" element={<Customers />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Catch all for authenticated users */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
    );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <ThemeProvider>
        <Router>
           <AppContent />
        </Router>
      </ThemeProvider>
    </AppProvider>
  );
};

export default App;
