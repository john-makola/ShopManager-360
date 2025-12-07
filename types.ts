
export enum JobStatus {
  PENDING = 'Pending',
  PRE_PRESS = 'Pre-Press',
  PRINTING = 'Printing',
  FINISHING = 'Finishing',
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
  name: string;
  email: string;
  phone: string;
  balance: number;
  totalSpent: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  address?: string;
}

export interface SubJob {
  id: string;
  description: string;
  size: string;
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
}

export interface PrintJob {
  id: string;
  customerId: string; // Used as Customer Name often or ID
  title: string;
  description: string;
  status: JobStatus;
  priority: Priority;
  serviceType: string; // e.g., 'Business Cards', 'Brochures'
  quantity: number;
  price: number; // This is typically the final billed amount (Total Due)
  cost: number; // Internal cost
  dueDate: string;
  assignedTo?: string; // Staff ID
  files?: string[];
  notes?: string;
  createdAt: string;

  // Extended Fields for Detailed Job Cards
  customerName?: string;
  customerPhone?: string;
  handledBy?: 'In-House' | 'Out-Sourced';
  subJobs?: SubJob[];
  expenses?: Expense[];
  paymentStatus?: string;
  amountPaid?: number;
  balance?: number;
  
  // New Fields for Credit vs Cash logic
  saleType?: 'Cash' | 'Credit';
  invoiceNumber?: string;
  paymentMethod?: 'Cash' | 'Mpesa' | 'Bank';
  
  // Commission & Financials Logic
  commissionRate?: number;
  discount?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Paper' | 'Ink' | 'Finishing' | 'Other';
  quantity: number;
  unit: string;
  threshold: number; // Low stock alert level
  costPrice: number; // Cost to buy
  salePrice: number; // Price to sell (if applicable)
  supplier: string;
}

export interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  date: string;
  referenceId?: string; // Job ID or PO Number
  description: string;
  paymentMethod: 'Cash' | 'Card' | 'Bank' | 'M-PESA';
  // Linkage fields
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
  firstName: string;
  middleName?: string;
  lastName: string;
  username: string;
  email: string;
  role: 'Administrator' | 'Operator' | 'User';
  status: 'Active' | 'Disabled';
  
  // Details
  photo?: string; // URL
  nationalId: string;
  homePhone?: string;
  officePhone?: string;
  contractType: 'Permanent' | 'Contract' | 'Intern';
  residentialAddress?: string;
  
  nextOfKin?: NextOfKin;
  
  lastLogin?: string;
}
