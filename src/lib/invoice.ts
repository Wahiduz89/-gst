// src/lib/invoice.ts

import { Prisma } from '@prisma/client';

export interface InvoiceFormData {
  customerId?: string;
  customerName: string;
  customerGST?: string;
  customerAddress: string;
  customerPhone?: string;
  customerEmail?: string;
  customerState: string;
  businessState: string;
  invoiceDate: Date;
  dueDate?: Date;
  termsConditions?: string;
  notes?: string;
  items: InvoiceItemData[];
}

export interface InvoiceItemData {
  description: string;
  quantity: number;
  rate: number;
  gstRate: number;
}

export function generateInvoiceNumber(): string {
  const prefix = 'INV';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function calculateInvoiceAmounts(
  items: InvoiceItemData[],
  isInterState: boolean
): {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  itemsWithAmounts: any[];
} {
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const itemsWithAmounts = items.map(item => {
    const amount = item.quantity * item.rate;
    const gstAmount = (amount * item.gstRate) / 100;
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = gstAmount;
    } else {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
    }

    subtotal += amount;
    totalCgst += cgst;
    totalSgst += sgst;
    totalIgst += igst;

    return {
      ...item,
      amount,
      cgst,
      sgst,
      igst,
      totalAmount: amount + gstAmount
    };
  });

  return {
    subtotal,
    cgst: totalCgst,
    sgst: totalSgst,
    igst: totalIgst,
    totalAmount: subtotal + totalCgst + totalSgst + totalIgst,
    itemsWithAmounts
  };
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function validateGSTNumber(gst: string): boolean {
  // GST format: 2 digits state code + 10 char PAN + 1 entity + 1 letter Z + 1 check digit
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
}

export function validatePAN(pan: string): boolean {
  // PAN format: 5 letters + 4 digits + 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}

export function validatePhoneNumber(phone: string): boolean {
  // Indian phone number: +91 followed by 10 digits or just 10 digits
  const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s\-]/g, ''));
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export const invoiceStatuses = {
  DRAFT: { label: 'Draft', color: 'gray' },
  GENERATED: { label: 'Generated', color: 'blue' },
  CANCELLED: { label: 'Cancelled', color: 'red' }
};

export const paymentStatuses = {
  PENDING: { label: 'Pending', color: 'yellow' },
  PARTIAL: { label: 'Partial', color: 'orange' },
  PAID: { label: 'Paid', color: 'green' }
};