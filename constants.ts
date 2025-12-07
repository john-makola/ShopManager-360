
import { Customer, InventoryItem, JobStatus, PrintJob, Priority, ServiceDefinition, StaffMember, Transaction, ExpenseItem, ServiceProduct, Supplier, User } from "./types";
import { 
  LayoutDashboard, 
  Printer, 
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
    icon: Printer,
    children: [
      { label: 'Cash and Mpesa Sales', path: '/sales/cash' },
      { label: 'Credit Sales', path: '/sales/credit' }
    ] 
  },
  { 
    label: 'Expenses', 
    icon: Receipt,
    children: [
      { label: 'General Expenses', path: '/expenses/records' },
      { label: 'Stock / Inventory Expenses', path: '/expenses/list' }
    ]
  },
  { 
    label: 'Inventory', 
    icon: Package, 
    children: [
      { label: 'Stock Items', path: '/inventory' },
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
      { label: 'Profit & Loss Analysis', path: '/reports/pnl' }
    ]
  },
  { label: 'Smart Insights', icon: Sparkles, path: '/insights' },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Acme Corp', email: 'contact@acme.com', phone: '+123456789', balance: 0, totalSpent: 12500 },
  { id: 'c2', name: 'John Doe Designs', email: 'john@doe.com', phone: '+987654321', balance: 150, totalSpent: 4200 },
  { id: 'c3', name: 'Global Tech', email: 'procurement@global.com', phone: '+11223344', balance: 0, totalSpent: 8900 },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'PaperWorld Ltd', contactPerson: 'Mike Ross', email: 'sales@paperworld.co', phone: '+254 711 000 001', category: 'Paper' },
  { id: 'sup2', name: 'InkMaster Supplies', contactPerson: 'Sarah Jen', email: 'orders@inkmaster.com', phone: '+254 722 000 002', category: 'Ink & Toner' },
  { id: 'sup3', name: 'Office Depot', contactPerson: 'General Desk', email: 'info@officedepot.com', phone: '+254 733 000 003', category: 'General' },
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    firstName: 'System',
    lastName: 'Admin',
    username: 'admin',
    email: 'admin@shopmanager360.com',
    role: 'Administrator',
    status: 'Active',
    nationalId: '12345678',
    contractType: 'Permanent',
    officePhone: '+254 700 111 222',
    residentialAddress: '123 Tech Street, Nairobi',
    nextOfKin: {
      name: 'Jane Admin',
      relationship: 'Spouse',
      phone: '+254 700 111 333'
    },
    lastLogin: '2023-10-25T09:00:00'
  },
  {
    id: 'u2',
    firstName: 'Alice',
    middleName: 'Marie',
    lastName: 'Printer',
    username: 'alicep',
    email: 'alice@shopmanager360.com',
    role: 'Operator',
    status: 'Active',
    nationalId: '87654321',
    contractType: 'Contract',
    homePhone: '+254 711 222 333',
    residentialAddress: '45 Green Ave, Mombasa',
    nextOfKin: {
      name: 'Bob Printer',
      relationship: 'Brother',
      phone: '+254 711 222 444'
    },
    lastLogin: '2023-10-24T14:30:00'
  },
  {
    id: 'u3',
    firstName: 'John',
    lastName: 'Sales',
    username: 'johns',
    email: 'john@shopmanager360.com',
    role: 'User',
    status: 'Disabled',
    nationalId: '11223344',
    contractType: 'Intern',
    officePhone: '+254 722 333 444',
    residentialAddress: '78 Blue Rd, Kisumu',
    nextOfKin: {
      name: 'Mary Sales',
      relationship: 'Mother',
      phone: '+254 722 333 555'
    },
    lastLogin: '2023-09-15T10:00:00'
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'A4 80gsm Bond Paper', category: 'Paper', quantity: 45, unit: 'Reams', threshold: 10, costPrice: 5, salePrice: 8, supplier: 'PaperWorld' },
  { id: 'i2', name: 'Glossy Business Card Stock', category: 'Paper', quantity: 8, unit: 'Packs', threshold: 5, costPrice: 25, salePrice: 35, supplier: 'LuxPaper' },
  { id: 'i3', name: 'Cyan Toner (C8000)', category: 'Ink', quantity: 2, unit: 'Cartridges', threshold: 2, costPrice: 120, salePrice: 160, supplier: 'InkMaster' },
  { id: 'i4', name: 'Lamination Roll (Matte)', category: 'Finishing', quantity: 5, unit: 'Rolls', threshold: 2, costPrice: 40, salePrice: 65, supplier: 'FinishLine' },
];

export const MOCK_JOBS: PrintJob[] = [
  { 
    id: 'j1', customerId: 'c1', title: 'Q3 Marketing Flyers', description: '5000 flyers, double sided, glossy', 
    status: JobStatus.PRINTING, priority: Priority.NORMAL, serviceType: 'Flyers', 
    quantity: 5000, price: 450, cost: 200, dueDate: '2023-10-25', assignedTo: 's1', createdAt: '2023-10-20',
    saleType: 'Cash', customerName: 'Acme Corp', amountPaid: 450, balance: 0, paymentStatus: 'Fully Paid'
  },
  { 
    id: 'j2', customerId: 'c2', title: 'Urgent Biz Cards', description: '200 cards, matte finish, rounded corners', 
    status: JobStatus.PRE_PRESS, priority: Priority.URGENT, serviceType: 'Business Cards', 
    quantity: 200, price: 80, cost: 20, dueDate: '2023-10-22', assignedTo: 's2', createdAt: '2023-10-21',
    saleType: 'Cash', customerName: 'John Doe Designs', amountPaid: 80, balance: 0, paymentStatus: 'Fully Paid'
  },
  { 
    id: 'j3', customerId: 'c3', title: 'Training Manuals', description: '50 booklets, spiral bound', 
    status: JobStatus.PENDING, priority: Priority.NORMAL, serviceType: 'Booklets', 
    quantity: 50, price: 750, cost: 300, dueDate: '2023-10-30', createdAt: '2023-10-21',
    saleType: 'Credit', invoiceNumber: 'INV-1001', customerName: 'Global Tech', amountPaid: 0, balance: 750, paymentStatus: 'Unpaid'
  },
  { 
    id: 'j4', customerId: 'c1', title: 'Roll-up Banner', description: 'Standard size, stand included', 
    status: JobStatus.READY, priority: Priority.EXPRESS, serviceType: 'Large Format', 
    quantity: 2, price: 200, cost: 80, dueDate: '2023-10-21', assignedTo: 's1', createdAt: '2023-10-19',
    saleType: 'Cash', customerName: 'Acme Corp', amountPaid: 200, balance: 0, paymentStatus: 'Fully Paid'
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'Income', category: 'Sales', amount: 450, date: '2023-10-20', description: 'Payment for Job #j1', paymentMethod: 'Bank' },
  { id: 't2', type: 'Expense', category: 'Materials', amount: 500, date: '2023-10-19', description: 'Paper Restock', paymentMethod: 'Card' },
  { id: 't3', type: 'Income', category: 'Sales', amount: 200, date: '2023-10-19', description: 'Payment for Job #j4', paymentMethod: 'Cash' },
];

export const MOCK_EXPENSE_ITEMS: ExpenseItem[] = [
    { id: 'e1', code: 'DP001', description: 'A4 Color Click', category: 'DIGITAL PRINTING', size: 'A4', units: 1, costPerUnit: 5, createdAt: '2023-10-01' },
    { id: 'e2', code: 'DP002', description: 'A3 Color Click', category: 'DIGITAL PRINTING', size: 'A3', units: 1, costPerUnit: 10, createdAt: '2023-10-01' },
    { id: 'e3', code: 'LF001', description: 'Vinyl Sticker per m2', category: 'LARGE FORMAT PRINTING', size: 'm2', units: 1, costPerUnit: 450, createdAt: '2023-10-01' },
    { id: 'e4', code: 'FS001', description: 'Lamination A4', category: 'FINISHING SERVICES EXPENSES', size: 'A4', units: 1, costPerUnit: 15, createdAt: '2023-10-02' },
];

export const MOCK_SERVICE_PRODUCTS: ServiceProduct[] = [
    { id: 'sp1', code: 'BC001', name: 'Standard Business Cards', type: 'product', category: 'Printing', price: 1000, unit: '100 pcs', size: '85x55mm', description: 'Matte or Gloss finish', createdAt: '2023-10-01' },
    { id: 'sp2', code: 'FL001', name: 'A5 Flyers', type: 'product', category: 'Printing', price: 5000, unit: '1000 pcs', size: 'A5', description: '130gsm gloss paper', createdAt: '2023-10-02' },
    { id: 'sp3', code: 'DS001', name: 'Graphic Design Hourly', type: 'service', category: 'Design', price: 1500, unit: 'hour', description: 'Professional design services', createdAt: '2023-10-01' },
];

export const SERVICES: ServiceDefinition[] = [
    { id: 'srv1', name: 'Business Cards (100)', basePrice: 20, category: 'Small Format' },
    { id: 'srv2', name: 'A4 Flyers (1000)', basePrice: 80, category: 'Small Format' },
    { id: 'srv3', name: 'Roll-up Banner', basePrice: 85, category: 'Large Format' },
    { id: 'srv4', name: 'A3 Poster', basePrice: 5, category: 'Large Format' },
];

export const STAFF: StaffMember[] = [
    { id: 's1', name: 'Alice Printer', role: 'Operator', activeJobs: 2 },
    { id: 's2', name: 'Bob Designer', role: 'Designer', activeJobs: 1 },
];
