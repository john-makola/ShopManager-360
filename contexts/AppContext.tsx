
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { 
  Customer, InventoryItem, JobStatus, PrintJob, Transaction, 
  ExpenseItem, ServiceProduct, Supplier, User, Organization, SupplierCategory 
} from '../types';
import { 
  MOCK_JOBS, MOCK_INVENTORY, MOCK_CUSTOMERS, MOCK_SUPPLIERS, 
  MOCK_TRANSACTIONS, MOCK_EXPENSE_ITEMS, MOCK_SERVICE_PRODUCTS, 
  MOCK_USERS, MOCK_ORGANIZATIONS, MOCK_SUPPLIER_CATEGORIES 
} from '../constants';

interface AppContextType {
  // Data
  jobs: PrintJob[];
  inventory: InventoryItem[];
  customers: Customer[];
  suppliers: Supplier[];
  transactions: Transaction[];
  serviceProducts: ServiceProduct[];
  expenseItems: ExpenseItem[];
  users: User[];
  supplierCategories: SupplierCategory[];
  
  // Auth & Org
  currentUser: User | null;
  isAuthenticated: boolean;
  currentOrganization: Organization | null;
  
  // Actions - Jobs
  addJob: (job: PrintJob) => void;
  updateJob: (job: PrintJob) => void;
  deleteJob: (id: string) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
  
  // Actions - Inventory
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  
  // Actions - Transactions
  addTransaction: (transaction: Omit<Transaction, 'organizationId'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  
  // Actions - Customers
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  
  // Actions - Suppliers
  addSupplier: (supplier: Omit<Supplier, 'organizationId'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  addSupplierCategory: (category: string) => void;
  deleteSupplierCategory: (id: string) => void;
  
  // Actions - Services
  addServiceProduct: (item: Omit<ServiceProduct, 'organizationId'>) => void;
  updateServiceProduct: (item: ServiceProduct) => void;
  deleteServiceProduct: (id: string) => void;
  
  // Actions - Expenses
  addExpenseItem: (item: ExpenseItem) => void;
  updateExpenseItem: (item: ExpenseItem) => void;
  deleteExpenseItem: (id: string) => void;
  
  // Actions - Users
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  updateCurrentUser: (user: User) => void;
  
  // Actions - Org
  updateOrganization: (org: Organization) => void;
  
  // Auth
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Raw State initialization with Mock Data (Contains data for ALL organizations)
  const [allJobs, setAllJobs] = useState<PrintJob[]>(MOCK_JOBS);
  const [allInventory, setAllInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [allCustomers, setAllCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [allServiceProducts, setAllServiceProducts] = useState<ServiceProduct[]>(MOCK_SERVICE_PRODUCTS);
  const [allExpenseItems, setAllExpenseItems] = useState<ExpenseItem[]>(MOCK_EXPENSE_ITEMS);
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>(MOCK_ORGANIZATIONS);
  const [allSupplierCategories, setAllSupplierCategories] = useState<SupplierCategory[]>(MOCK_SUPPLIER_CATEGORIES);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);

  const isAuthenticated = !!currentUser;

  // --- Auth Actions ---
  const login = async (username: string, pass: string): Promise<boolean> => {
    // Simple mock authentication against ALL users
    const user = allUsers.find(u => u.username === username && u.password === pass);
    if (user) {
        const org = allOrganizations.find(o => o.id === user.organizationId);
        setCurrentUser({ ...user, lastLogin: new Date().toISOString() });
        setCurrentOrganization(org || null);
        return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentOrganization(null);
  };

  const updateCurrentUser = (updatedUser: User) => {
      setCurrentUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const updateOrganization = (updatedOrg: Organization) => {
      setCurrentOrganization(updatedOrg);
      setAllOrganizations(prev => prev.map(o => o.id === updatedOrg.id ? updatedOrg : o));
  };

  // --- Data Filtering (Multi-tenancy Isolation) ---
  const currentOrgId = currentOrganization?.id;

  const jobs = useMemo(() => allJobs.filter(j => j.organizationId === currentOrgId), [allJobs, currentOrgId]);
  const inventory = useMemo(() => allInventory.filter(i => i.organizationId === currentOrgId), [allInventory, currentOrgId]);
  const customers = useMemo(() => allCustomers.filter(c => c.organizationId === currentOrgId), [allCustomers, currentOrgId]);
  const suppliers = useMemo(() => allSuppliers.filter(s => s.organizationId === currentOrgId), [allSuppliers, currentOrgId]);
  const transactions = useMemo(() => allTransactions.filter(t => t.organizationId === currentOrgId), [allTransactions, currentOrgId]);
  const serviceProducts = useMemo(() => allServiceProducts.filter(s => s.organizationId === currentOrgId), [allServiceProducts, currentOrgId]);
  const expenseItems = useMemo(() => allExpenseItems.filter(e => e.organizationId === currentOrgId), [allExpenseItems, currentOrgId]);
  const supplierCategories = useMemo(() => allSupplierCategories.filter(sc => sc.organizationId === currentOrgId), [allSupplierCategories, currentOrgId]);
  const users = useMemo(() => allUsers.filter(u => u.organizationId === currentOrgId), [allUsers, currentOrgId]);

  // --- Data Actions (Updating Raw State) ---

  // Jobs
  const addJob = (job: PrintJob) => {
      if (!currentOrgId) return;
      const newJob = { ...job, organizationId: currentOrgId };
      setAllJobs(prev => [newJob, ...prev]);
  };

  const updateJob = (updatedJob: PrintJob) => {
      setAllJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  const deleteJob = (id: string) => {
      setAllJobs(prev => prev.filter(j => j.id !== id));
  };

  const updateJobStatus = (id: string, status: JobStatus) => {
      setAllJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  };

  // Transactions
  const addTransaction = (t: Omit<Transaction, 'organizationId'>) => {
      if (!currentOrgId) return;
      const newTransaction = { ...t, organizationId: currentOrgId };
      setAllTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (t: Transaction) => {
      setAllTransactions(prev => prev.map(item => item.id === t.id ? t : item));
  };

  const deleteTransaction = (id: string) => {
      setAllTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Customers
  const addCustomer = (c: Customer) => {
      if (!currentOrgId) return;
      const newCustomer = { ...c, organizationId: currentOrgId };
      setAllCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (c: Customer) => {
      setAllCustomers(prev => prev.map(cust => cust.id === c.id ? c : cust));
  };

  const deleteCustomer = (id: string) => {
      setAllCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Suppliers
  const addSupplier = (s: Omit<Supplier, 'organizationId'>) => {
      if (!currentOrgId) return;
      const newSupplier = { ...s, organizationId: currentOrgId };
      setAllSuppliers(prev => [...prev, newSupplier]);
  };

  const updateSupplier = (s: Supplier) => {
      setAllSuppliers(prev => prev.map(sup => sup.id === s.id ? s : sup));
  };

  const deleteSupplier = (id: string) => {
      setAllSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const addSupplierCategory = (category: string) => {
      if (!currentOrgId) return;
      const newCategory: SupplierCategory = {
          id: Math.random().toString(36).substr(2, 9),
          organizationId: currentOrgId,
          name: category
      };
      setAllSupplierCategories(prev => [...prev, newCategory]);
  };

  const deleteSupplierCategory = (id: string) => {
      setAllSupplierCategories(prev => prev.filter(sc => sc.id !== id));
  };

  // Services
  const addServiceProduct = (s: Omit<ServiceProduct, 'organizationId'>) => {
      if (!currentOrgId) return;
      const newService = { ...s, organizationId: currentOrgId };
      setAllServiceProducts(prev => [...prev, newService]);
  };

  const updateServiceProduct = (s: ServiceProduct) => {
      setAllServiceProducts(prev => prev.map(item => item.id === s.id ? s : item));
  };

  const deleteServiceProduct = (id: string) => {
      setAllServiceProducts(prev => prev.filter(s => s.id !== id));
  };

  // Expense Items (Catalog)
  const addExpenseItem = (e: ExpenseItem) => {
      if (!currentOrgId) return;
      const newItem = { ...e, organizationId: currentOrgId };
      setAllExpenseItems(prev => [...prev, newItem]);
  };

  const updateExpenseItem = (e: ExpenseItem) => {
      setAllExpenseItems(prev => prev.map(item => item.id === e.id ? e : item));
  };

  const deleteExpenseItem = (id: string) => {
      setAllExpenseItems(prev => prev.filter(e => e.id !== id));
  };

  // Users
  const addUser = (u: User) => {
      if (!currentOrgId) return;
      const newUser = { ...u, organizationId: currentOrgId };
      setAllUsers(prev => [...prev, newUser]);
  };

  const updateUser = (u: User) => {
      setAllUsers(prev => prev.map(user => user.id === u.id ? u : user));
      if (currentUser && currentUser.id === u.id) {
          setCurrentUser(u);
      }
  };

  const deleteUser = (id: string) => {
      setAllUsers(prev => prev.filter(u => u.id !== id));
  };

  // Inventory
  const addInventoryItem = (item: InventoryItem) => {
      if (!currentOrgId) return;
      const newItem = { ...item, organizationId: currentOrgId };
      setAllInventory(prev => [...prev, newItem]);
  };

  const updateInventoryItem = (item: InventoryItem) => {
      setAllInventory(prev => prev.map(i => i.id === item.id ? item : i));
  };

  const deleteInventoryItem = (id: string) => {
      setAllInventory(prev => prev.filter(i => i.id !== id));
  };

  return (
    <AppContext.Provider value={{
        jobs, inventory, customers, suppliers, transactions, serviceProducts, expenseItems, users, supplierCategories,
        currentUser, isAuthenticated, currentOrganization,
        addJob, updateJob, deleteJob, updateJobStatus,
        addTransaction, updateTransaction, deleteTransaction,
        addCustomer, updateCustomer, deleteCustomer,
        addSupplier, updateSupplier, deleteSupplier, addSupplierCategory, deleteSupplierCategory,
        addServiceProduct, updateServiceProduct, deleteServiceProduct,
        addExpenseItem, updateExpenseItem, deleteExpenseItem,
        addUser, updateUser, deleteUser, updateCurrentUser,
        updateOrganization,
        addInventoryItem, updateInventoryItem, deleteInventoryItem,
        login, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
