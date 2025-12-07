
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Customer, InventoryItem, PrintJob, Transaction, ExpenseItem, ServiceProduct, Supplier, User } from '../types';
import { MOCK_CUSTOMERS, MOCK_INVENTORY, MOCK_JOBS, MOCK_TRANSACTIONS, MOCK_EXPENSE_ITEMS, MOCK_SERVICE_PRODUCTS, MOCK_SUPPLIERS, MOCK_USERS } from '../constants';

interface AppContextType {
  jobs: PrintJob[];
  customers: Customer[];
  inventory: InventoryItem[];
  transactions: Transaction[];
  expenseItems: ExpenseItem[];
  serviceProducts: ServiceProduct[];
  suppliers: Supplier[];
  users: User[];
  addJob: (job: PrintJob) => void;
  updateJob: (job: PrintJob) => void;
  updateJobStatus: (id: string, status: PrintJob['status']) => void;
  addTransaction: (transaction: Transaction) => void;
  addExpenseItem: (item: ExpenseItem) => void;
  updateExpenseItem: (item: ExpenseItem) => void;
  deleteExpenseItem: (id: string) => void;
  addServiceProduct: (item: ServiceProduct) => void;
  updateServiceProduct: (item: ServiceProduct) => void;
  deleteServiceProduct: (id: string) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  updateInventoryQuantity: (id: string, change: number) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<PrintJob[]>(MOCK_JOBS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>(MOCK_EXPENSE_ITEMS);
  const [serviceProducts, setServiceProducts] = useState<ServiceProduct[]>(MOCK_SERVICE_PRODUCTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  const addJob = (job: PrintJob) => {
    setJobs(prev => [job, ...prev]);
  };

  const updateJob = (updatedJob: PrintJob) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  const updateJobStatus = (id: string, status: PrintJob['status']) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const addExpenseItem = (item: ExpenseItem) => {
    setExpenseItems(prev => [...prev, item]);
  };

  const updateExpenseItem = (updatedItem: ExpenseItem) => {
    setExpenseItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const deleteExpenseItem = (id: string) => {
    setExpenseItems(prev => prev.filter(i => i.id !== id));
  };

  const addServiceProduct = (item: ServiceProduct) => {
    setServiceProducts(prev => [item, ...prev]);
  };

  const updateServiceProduct = (updatedItem: ServiceProduct) => {
    setServiceProducts(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const deleteServiceProduct = (id: string) => {
    setServiceProducts(prev => prev.filter(i => i.id !== id));
  };

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addSupplier = (supplier: Supplier) => {
    setSuppliers(prev => [supplier, ...prev]);
  };

  const updateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const updateInventoryQuantity = (id: string, change: number) => {
    setInventory(prev => prev.map(item => {
        if (item.id === id) {
            return { ...item, quantity: Math.max(0, item.quantity + change) };
        }
        return item;
    }));
  };

  const addUser = (user: User) => {
    setUsers(prev => [user, ...prev]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <AppContext.Provider value={{ 
      jobs, 
      customers, 
      inventory, 
      transactions, 
      expenseItems,
      serviceProducts,
      suppliers,
      users,
      addJob, 
      updateJob, 
      updateJobStatus, 
      addTransaction,
      addExpenseItem,
      updateExpenseItem,
      deleteExpenseItem,
      addServiceProduct,
      updateServiceProduct,
      deleteServiceProduct,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      updateInventoryQuantity,
      addUser,
      updateUser,
      deleteUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
