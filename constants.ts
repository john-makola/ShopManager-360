
import { Customer, InventoryItem, JobStatus, PrintJob, Priority, Transaction, ExpenseItem, ServiceProduct, Supplier, User, Organization, SupplierCategory } from "./types";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  BarChart3, 
  Sparkles, 
  Receipt, 
  Truck, 
  UserCog
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { 
    label: 'Sales', 
    icon: ShoppingCart,
    children: [
      { label: 'Cash Sales', path: '/sales/cash' },
      { label: 'Credit Sales', path: '/sales/credit' }
    ] 
  },
  { 
    label: 'Expenses', 
    icon: Receipt,
    children: [
      { label: 'General Expenses', path: '/expenses/records' },
      { label: 'Stock Purchases', path: '/expenses/list' }
    ]
  },
  { 
    label: 'Inventory', 
    icon: Package, 
    children: [
      { label: 'Products', path: '/inventory' },
      { label: 'Services', path: '/services' }
    ]
  },
  { label: 'Customers', icon: Users, path: '/customers' },
  { label: 'Suppliers', icon: Truck, path: '/suppliers' },
  { label: 'Users', icon: UserCog, path: '/users' },
  { 
    label: 'Reports', 
    icon: BarChart3, 
    children: [
      { label: 'Sales Reports', path: '/reports/sales' },
      { label: 'Expense Reports', path: '/reports/expenses' },
      { label: 'Inventory Reports', path: '/reports/inventory' },
      { label: 'Profit & Loss Analysis', path: '/reports/pnl' },
      { label: 'Audit Trail', path: '/reports/audit' }
    ]
  },
  { label: 'Smart Insights', icon: Sparkles, path: '/insights' },
];

// --- MULTI-TENANCY MOCK DATA ---

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 'org_1',
    name: 'Metro Retail & Wholesalers',
    type: 'Mixed',
    currency: 'KES',
    address: '123 Moi Avenue, Nairobi',
    phone: '+254 700 000 000',
    email: 'info@metroretail.co.ke',
    taxId: 'P051234567Z'
  },
  {
    id: 'org_2',
    name: 'Tech Haven Electronics',
    type: 'Retail',
    currency: 'KES',
    address: 'Westlands Square, Nairobi',
    phone: '+254 711 111 111',
    email: 'sales@techhaven.io',
    taxId: 'P059876543A'
  }
];

// Users belong to organizations
export const MOCK_USERS: User[] = [
  {
    id: 'u1', organizationId: 'org_1',
    firstName: 'Admin', lastName: 'Metro', username: 'admin', password: 'password123', email: 'admin@metro.com',
    role: 'Administrator', status: 'Active', nationalId: '12345678', contractType: 'Permanent'
  },
  {
    id: 'u2', organizationId: 'org_1',
    firstName: 'Alice', lastName: 'Sales', username: 'alice', password: 'password123', email: 'alice@metro.com',
    role: 'Operator', status: 'Active', nationalId: '87654321', contractType: 'Contract'
  },
  // User for the second organization
  {
    id: 'u3', organizationId: 'org_2',
    firstName: 'John', lastName: 'Tech', username: 'john', password: 'password123', email: 'john@techhaven.com',
    role: 'Administrator', status: 'Active', nationalId: '11223344', contractType: 'Permanent'
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', organizationId: 'org_1', name: 'Metro Hotel & Spa', email: 'procurement@metrohotel.com', phone: '+254 711 000 001', balance: 0, totalSpent: 45000 },
  { id: 'c2', organizationId: 'org_1', name: 'John Kamau', email: 'john.k@gmail.com', phone: '+254 722 000 002', balance: 1500, totalSpent: 38200 },
  { id: 'c3', organizationId: 'org_2', name: 'Sunrise Schools', email: 'admin@sunriseschools.co.ke', phone: '+254 733 000 003', balance: 100000, totalSpent: 150000 },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup1', organizationId: 'org_1', name: 'Global Electronics Ltd', contactPerson: 'David Chen', email: 'sales@globalelec.com', phone: '+254 700 111 222', category: 'Electronics' },
  { id: 'sup2', organizationId: 'org_1', name: 'Nairobi Wholesalers', contactPerson: 'Sarah Kim', email: 'orders@nbiwholesale.com', phone: '+254 711 333 444', category: 'Groceries' },
  { id: 'sup3', organizationId: 'org_2', name: 'BuildBest Hardware', contactPerson: 'Tom Mboya', email: 'info@buildbest.co.ke', phone: '+254 722 555 666', category: 'Hardware' },
];

export const MOCK_SUPPLIER_CATEGORIES: SupplierCategory[] = [
  { id: 'sc1', organizationId: 'org_1', name: 'Electronics' },
  { id: 'sc2', organizationId: 'org_1', name: 'Groceries' },
  { id: 'sc3', organizationId: 'org_1', name: 'Stationery' },
  { id: 'sc4', organizationId: 'org_1', name: 'Maintenance' },
  { id: 'sc5', organizationId: 'org_2', name: 'Hardware' },
  { id: 'sc6', organizationId: 'org_2', name: 'Accessories' },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  // Org 1 Items
  { id: 'i1', organizationId: 'org_1', name: 'Samsung 43" Smart TV', category: 'Electronics', quantity: 12, unit: 'Units', threshold: 3, costPrice: 28000, salePrice: 35000, supplier: 'Global Electronics Ltd', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=300&q=80' },
  { id: 'i3', organizationId: 'org_1', name: 'Basmati Rice (25kg)', category: 'Groceries', quantity: 45, unit: 'Bags', threshold: 10, costPrice: 3200, salePrice: 3800, supplier: 'Nairobi Wholesalers', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80' },
  { id: 'i5', organizationId: 'org_1', name: 'Cooking Oil 20L', category: 'Groceries', quantity: 15, unit: 'Jerricans', threshold: 5, costPrice: 3800, salePrice: 4500, supplier: 'Nairobi Wholesalers', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80' },
  
  // Org 2 Items
  { id: 'i2', organizationId: 'org_2', name: 'Cement 50kg Bags', category: 'Hardware', quantity: 200, unit: 'Bags', threshold: 50, costPrice: 650, salePrice: 800, supplier: 'BuildBest Hardware', image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=300&q=80' },
  { id: 'i4', organizationId: 'org_2', name: 'Wireless Mouse', category: 'Accessories', quantity: 50, unit: 'Pcs', threshold: 5, costPrice: 400, salePrice: 800, supplier: 'Global Electronics Ltd', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=300&q=80' },
];

export const MOCK_JOBS: PrintJob[] = [
  { 
    id: 'ORD-1001', organizationId: 'org_1', customerId: 'c2', title: 'TV & Accessories', description: 'Samsung TV + Wall Mount', 
    status: JobStatus.COMPLETED, priority: Priority.NORMAL, serviceType: 'Retail', 
    quantity: 2, price: 38000, cost: 30000, dueDate: '2023-10-20', assignedTo: 'u2', createdAt: '2023-10-20',
    saleType: 'Cash', customerName: 'John Kamau', amountPaid: 38000, balance: 0, paymentStatus: 'Fully Paid',
    invoiceNumber: 'REC-5001'
  },
  { 
    id: 'ORD-1002', organizationId: 'org_2', customerId: 'c3', title: 'Monthly Food Supplies', description: 'Rice, Oil, Sugar for School', 
    status: JobStatus.SHIPPED, priority: Priority.URGENT, serviceType: 'Wholesale', 
    quantity: 50, price: 150000, cost: 120000, dueDate: '2023-10-25', assignedTo: 'u3', createdAt: '2023-10-22',
    saleType: 'Credit', customerName: 'Sunrise Schools', amountPaid: 50000, balance: 100000, paymentStatus: 'Partly Paid',
    invoiceNumber: 'INV-2001'
  },
  { 
    id: 'ORD-1004', organizationId: 'org_1', customerId: '', title: 'Walk-in Sale', description: 'Mouse, Keyboard, USB Cable', 
    status: JobStatus.COMPLETED, priority: Priority.NORMAL, serviceType: 'Retail', 
    quantity: 3, price: 2500, cost: 1200, dueDate: '2023-10-24', assignedTo: 'u2', createdAt: '2023-10-24',
    saleType: 'Cash', customerName: 'Walk-in Customer', amountPaid: 2500, balance: 0, paymentStatus: 'Fully Paid'
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', organizationId: 'org_1', customerId: 'c2', type: 'Income', category: 'Sales', amount: 38000, date: '2023-10-20', description: 'Sale #ORD-1001', paymentMethod: 'M-PESA' },
  { id: 't2', organizationId: 'org_1', type: 'Expense', category: 'Rent', amount: 25000, date: '2023-10-01', description: 'Shop Rent Oct', paymentMethod: 'Bank' },
  { id: 't3', organizationId: 'org_1', type: 'Income', category: 'Sales', amount: 2500, date: '2023-10-24', description: 'Sale #ORD-1004', paymentMethod: 'Cash' },
  { id: 't4', organizationId: 'org_2', type: 'Expense', category: 'Stock Purchase', amount: 120000, date: '2023-10-15', description: 'Groceries Restock', paymentMethod: 'Bank' },
  { id: 't5', organizationId: 'org_2', customerId: 'c3', type: 'Income', category: 'Sales', amount: 50000, date: '2023-10-22', description: 'Part Payment INV-2001', paymentMethod: 'Bank' },
];

export const MOCK_EXPENSE_ITEMS: ExpenseItem[] = [
    { id: 'e1', organizationId: 'org_1', code: 'STK001', description: 'Shipping Cost (Per Carton)', category: 'LOGISTICS', size: 'Standard', units: 1, costPerUnit: 500, createdAt: '2023-10-01' },
    { id: 'e2', organizationId: 'org_1', code: 'OPS001', description: 'Packaging Bags (Large)', category: 'PACKAGING', size: 'L', units: 100, costPerUnit: 20, createdAt: '2023-10-01' },
    { id: 'e3', organizationId: 'org_2', code: 'UTL001', description: 'Internet Subscription', category: 'UTILITIES', size: 'Monthly', units: 1, costPerUnit: 3000, createdAt: '2023-10-01' },
];

export const MOCK_SERVICE_PRODUCTS: ServiceProduct[] = [
    { id: 'sp1', organizationId: 'org_1', code: 'SRV001', name: 'Delivery (Within CBD)', type: 'service', category: 'Logistics', price: 300, unit: 'Trip', description: 'Bike delivery', createdAt: '2023-10-01', image: 'https://images.unsplash.com/photo-1616409416478-4339907f3301?auto=format&fit=crop&w=300&q=80' },
    { id: 'sp2', organizationId: 'org_2', code: 'SRV002', name: 'Installation Service', type: 'service', category: 'Technical', price: 1500, unit: 'Hour', description: 'TV/Appliance Setup', createdAt: '2023-10-02', image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a783?auto=format&fit=crop&w=300&q=80' },
    { id: 'sp3', organizationId: 'org_1', code: 'PROD001', name: 'HDMI Cable 2m', type: 'product', category: 'Accessories', price: 500, unit: 'Pcs', description: 'High speed cable', createdAt: '2023-10-01', image: 'https://images.unsplash.com/photo-1558237375-45220c3a8ef5?auto=format&fit=crop&w=300&q=80' },
];
