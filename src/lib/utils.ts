// src/lib/utils.ts - Fixed generateInvoiceNumber function

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  const convertToIndianSystem = (n: number): string => {
    if (n < 1000) return convertLessThanThousand(n);
    
    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const remainder = n % 1000;
    
    let result = '';
    
    if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
    if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
    if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
    if (remainder > 0) result += convertLessThanThousand(remainder);
    
    return result.trim();
  };

  const wholePart = Math.floor(num);
  const decimalPart = Math.round((num - wholePart) * 100);
  
  let words = convertToIndianSystem(wholePart) + ' Rupees';
  
  if (decimalPart > 0) {
    words += ' and ' + convertLessThanThousand(decimalPart) + ' Paise';
  }
  
  return words + ' Only';
}

export async function generateInvoiceNumber(userId: string, prefix: string = 'INV'): Promise<string> {
  const { prisma } = await import('@/lib/prisma');
  
  const count = await prisma.invoice.count({
    where: { userId }
  });
  
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const invoiceCount = String(count + 1).padStart(4, '0');
  
  return `${prefix}-${year}${month}-${invoiceCount}`;
}

export function calculateInvoiceTotals(
  items: Array<{
    quantity: number;
    rate: number;
    gstRate: number;
  }>,
  isInterState: boolean
) {
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const itemsWithCalculations = items.map(item => {
    const amount = Number(item.quantity) * Number(item.rate);
    const gstAmount = (amount * Number(item.gstRate)) / 100;
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    if (isInterState) {
      igst = gstAmount;
      totalIgst += igst;
    } else {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
      totalCgst += cgst;
      totalSgst += sgst;
    }
    
    subtotal += amount;
    
    return {
      amount,
      cgst,
      sgst,
      igst,
      totalAmount: amount + gstAmount,
    };
  });

  const totalAmount = subtotal + totalCgst + totalSgst + totalIgst;

  return {
    subtotal,
    cgst: totalCgst,
    sgst: totalSgst,
    igst: totalIgst,
    totalAmount,
    items: itemsWithCalculations,
  };
}

export function getGSTType(sellerState: string, buyerState: string): 'inter' | 'intra' {
  const normalizeState = (state: string) => state.toLowerCase().trim();
  return normalizeState(sellerState) === normalizeState(buyerState) ? 'intra' : 'inter';
}

export function validateGSTNumber(gst: string): boolean {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function getDaysFromNow(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}