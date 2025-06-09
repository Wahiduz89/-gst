import { User as PrismaUser, Customer as PrismaCustomer, Invoice as PrismaInvoice, InvoiceItem as PrismaInvoiceItem } from '@prisma/client';

// Extend Prisma types with relations
export type User = PrismaUser & {
  invoices?: Invoice[];
  customers?: Customer[];
};

export type Customer = PrismaCustomer & {
  user?: User;
  invoices?: Invoice[];
};

export type Invoice = PrismaInvoice & {
  user?: User;
  customer?: Customer;
  items?: InvoiceItem[];
};

export type InvoiceItem = PrismaInvoiceItem & {
  invoice?: Invoice;
};

// Form types
export interface InvoiceFormData {
  customerId?: string;
  customerName: string;
  customerGST?: string;
  customerAddress: string;
  customerPhone?: string;
  customerEmail?: string;
  invoiceDate: Date;
  dueDate?: Date;
  isInterState: boolean;
  termsConditions?: string;
  notes?: string;
  items: InvoiceItemFormData[];
}

export interface InvoiceItemFormData {
  description: string;
  quantity: number;
  rate: number;
  gstRate: number;
}

export interface CustomerFormData {
  name: string;
  gstNumber?: string;
  address: string;
  phone?: string;
  email?: string;
}

export interface BusinessFormData {
  businessName: string;
  businessAddress: string;
  businessGST?: string;
  businessPhone?: string;
  businessEmail?: string;
}

// Calculation helpers
export interface InvoiceCalculations {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  items: {
    amount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
  }[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalInvoices: number;
  thisMonthInvoices: number;
  totalRevenue: number;
  thisMonthRevenue: number;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'DRAFT' | 'GENERATED' | 'CANCELLED';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}