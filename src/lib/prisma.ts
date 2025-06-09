import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in Indian Rupees
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(num);
}

// Convert number to words (Indian numbering system)
export function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';

  function convertToWords(n: number): string {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertToWords(n % 100) : '');
    if (n < 100000) return convertToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertToWords(n % 1000) : '');
    if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertToWords(n % 100000) : '');
    return convertToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convertToWords(n % 10000000) : '');
  }

  const words = convertToWords(Math.floor(num));
  const paise = Math.round((num - Math.floor(num)) * 100);
  
  return words + ' Rupees' + (paise > 0 ? ' and ' + convertToWords(paise) + ' Paise' : '') + ' Only';
}

// Generate invoice number
export function generateInvoiceNumber(userId: string, count: number): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const invoiceCount = (count + 1).toString().padStart(4, '0');
  return `INV-${year}${month}-${invoiceCount}`;
}

// Calculate GST
export function calculateGST(amount: number, gstRate: number, isInterState: boolean) {
  const gstAmount = (amount * gstRate) / 100;
  
  if (isInterState) {
    return {
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      total: amount + gstAmount,
    };
  } else {
    return {
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
      igst: 0,
      total: amount + gstAmount,
    };
  }
}

// Calculate invoice totals
export function calculateInvoiceTotals(items: any[], isInterState: boolean) {
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const calculatedItems = items.map(item => {
    const amount = item.quantity * item.rate;
    const gst = calculateGST(amount, item.gstRate, isInterState);
    
    subtotal += amount;
    totalCgst += gst.cgst;
    totalSgst += gst.sgst;
    totalIgst += gst.igst;

    return {
      ...item,
      amount,
      cgst: gst.cgst,
      sgst: gst.sgst,
      igst: gst.igst,
      totalAmount: gst.total,
    };
  });

  return {
    items: calculatedItems,
    subtotal,
    cgst: totalCgst,
    sgst: totalSgst,
    igst: totalIgst,
    totalAmount: subtotal + totalCgst + totalSgst + totalIgst,
  };
}