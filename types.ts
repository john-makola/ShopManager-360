
export interface Organization {
  id: string;
  name: string;
  type: 'Retail' | 'Wholesale' | 'Service' | 'Mixed';
  logo?: string;
  currency: string; // e.g., 'KES', 'USD'
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string; // VAT/PIN Number
  dbConnectionString?: string; // For Multi-tenancy Data Isolation
}

export enum JobStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  PACKED = 'Packed',
  SHIPPED = 'Shipped', // or Out for Delivery
  READY = 'Ready',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum Priority {
  NORMAL = 'Normal',
  URGENT = 'Urgent',
  EXPRESS = 'Express'
}

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  totalSpent: number;
}

export interface Supplier {
  id: string;
  organizationId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  address?: string;
}

export interface SupplierCategory {
  id: string;
  organizationId: string;
  name: string;
}

export interface SubJob {
  id: string;
  description: string; // Product Name
  size: string; // Variant/Size/Model
  units: number;
  costPerUnit: number;
  total: number;
}

export interface Expense {
  id: string;
  description: string;
  supplier?: string;
  size: string;
  units: number;
  costPerUnit: number;
  total: number;
}

export interface ExpenseItem {
  id: string;
  organizationId: string;
  code: string;
  description: string;
  category: string;
  size: string;
  units: number;
  costPerUnit: number;
  createdAt: string;
  createdBy?: string;
}

export interface ServiceProduct {
  id: string;
  organizationId: string;
  code?: string;
  name: string;
  type: "service" | "product";
  category: string;
  price: number;
  unit: string;
  size?: string;
  description: string;
  createdAt: string;
  createdBy?: string;
  image?: string;
}

export interface PrintJob {
  id: string; // Order ID
  organizationId: string;
  customerId: string; 
  title: string; // Order Title / Reference
  description: string;
  status: JobStatus;
  priority: Priority;
  serviceType: string; // e.g., 'Retail Sale', 'Wholesale Order', 'Service'
  quantity: number;
  price: number; // Total Due
  cost: number; // COGS
  dueDate: string;
  assignedTo?: string; // Staff ID
  files?: string[];
  notes?: string;
  createdAt: string;

  // Extended Fields
  customerName?: string;
  customerPhone?: string;
  handledBy?: 'In-House' | 'Out-Sourced'; // Can stay or change to 'Store' | 'Warehouse'
  subJobs?: SubJob[]; // Line Items
  expenses?: Expense[];
  paymentStatus?: string;
  amountPaid?: number;
  balance?: number;
  
  // Financials
  saleType?: 'Cash' | 'Credit';
  invoiceNumber?: string;
  paymentMethod?: 'Cash' | 'Mpesa' | 'Bank';
  
  commissionRate?: number;
  discount?: number;
}

export interface InventoryItem {
  id: string;
  organizationId: string;
  name: string;
  category: string; // General String to allow any category
  quantity: number;
  unit: string;
  threshold: number; // Low stock alert level
  costPrice: number; // Cost to buy
  salePrice: number; // Price to sell
  supplier: string;
  image?: string;
}

export interface Transaction {
  id: string;
  organizationId: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  date: string;
  referenceId?: string; // Order ID or PO Number
  description: string;
  paymentMethod: 'Cash' | 'Card' | 'Bank' | 'M-PESA';
  jobId?: string;
  customerId?: string;
  supplierId?: string;
  inventoryItemId?: string;
}

export interface ServiceDefinition {
  id: string;
  name: string;
  basePrice: number;
  category: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  activeJobs: number;
}

export interface NextOfKin {
  name: string;
  relationship: string;
  phone: string;
  address?: string;
}

export interface User {
  id: string;
  organizationId: string; // Links user to a specific shop
  firstName: string;
  middleName?: string;
  lastName: string;
  username: string;
  password?: string;
  email: string;
  role: 'Administrator' | 'Operator' | 'User';
  status: 'Active' | 'Disabled';
  
  photo?: string;
  nationalId: string;
  homePhone?: string;
  officePhone?: string;
  contractType: 'Permanent' | 'Contract' | 'Intern';
  residentialAddress?: string;
  nextOfKin?: NextOfKin;
  lastLogin?: string;
}
