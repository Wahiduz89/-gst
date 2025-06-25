// src/lib/db-service.ts

import { PrismaClient, Prisma } from '@prisma/client';
import { uploadImage, deleteImage } from './cloudinary';
import { 
  generateInvoiceNumber, 
  calculateInvoiceAmounts,
  validatePhoneNumber,
  formatPhoneNumber,
  validateGSTNumber,
  validatePAN
} from './invoice';

const prisma = new PrismaClient();

// User/Business Service
export const userService = {
  async getBusinessInfo(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          businessName: true,
          businessAddress: true,
          businessGST: true,
          businessPAN: true,
          businessPhone: true,
          businessEmail: true,
          businessState: true,
          businessLogo: true,
        }
      });
      
      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      console.error('Error fetching business info:', error);
      throw error;
    }
  },

  async updateBusinessInfo(
    userId: string, 
    data: {
      businessName?: string;
      businessAddress?: string;
      businessGST?: string;
      businessPAN?: string;
      businessPhone?: string;
      businessEmail?: string;
      businessState?: string;
    }
  ) {
    try {
      // Validate GST if provided
      if (data.businessGST && !validateGSTNumber(data.businessGST)) {
        throw new Error('Invalid GST number format');
      }
      
      // Validate PAN if provided
      if (data.businessPAN && !validatePAN(data.businessPAN)) {
        throw new Error('Invalid PAN format');
      }
      
      // Validate and format phone if provided
      if (data.businessPhone) {
        if (!validatePhoneNumber(data.businessPhone)) {
          throw new Error('Invalid phone number format');
        }
        data.businessPhone = formatPhoneNumber(data.businessPhone);
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data,
      });
      
      return updated;
    } catch (error) {
      console.error('Error updating business info:', error);
      throw error;
    }
  },

  async uploadBusinessLogo(userId: string, fileBuffer: Buffer) {
    try {
      // Get current user to check for existing logo
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { businessLogo: true }
      });

      // Delete old logo if exists
      if (user?.businessLogo) {
        const publicId = user.businessLogo.split('/').pop()?.split('.')[0];
        if (publicId) {
          await deleteImage(`gst-invoice/logos/${publicId}`);
        }
      }

      // Upload new logo
      const uploadResult = await uploadImage(fileBuffer, {
        folder: 'gst-invoice/logos',
        public_id: `business-logo-${userId}-${Date.now()}`,
        transformation: [
          { width: 300, height: 300, crop: 'limit' },
          { quality: 'auto:best' }
        ]
      });

      // Update user with new logo URL
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { businessLogo: uploadResult.secure_url }
      });

      return updated;
    } catch (error) {
      console.error('Error uploading business logo:', error);
      throw error;
    }
  }
};

// Customer Service
export const customerService = {
  async createCustomer(
    userId: string,
    data: {
      name: string;
      gstNumber?: string;
      panNumber?: string;
      address: string;
      phone?: string;
      email?: string;
      state: string;
    }
  ) {
    try {
      // Validate GST if provided
      if (data.gstNumber && !validateGSTNumber(data.gstNumber)) {
        throw new Error('Invalid GST number format');
      }
      
      // Validate PAN if provided
      if (data.panNumber && !validatePAN(data.panNumber)) {
        throw new Error('Invalid PAN format');
      }
      
      // Validate and format phone if provided
      if (data.phone) {
        if (!validatePhoneNumber(data.phone)) {
          throw new Error('Invalid phone number format. Please enter a valid Indian phone number');
        }
        data.phone = formatPhoneNumber(data.phone);
      }

      const customer = await prisma.customer.create({
        data: {
          ...data,
          userId,
        }
      });
      
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  async getCustomers(userId: string) {
    try {
      const customers = await prisma.customer.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      
      return customers;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  async updateCustomer(
    customerId: string,
    userId: string,
    data: Partial<{
      name: string;
      gstNumber?: string;
      panNumber?: string;
      address: string;
      phone?: string;
      email?: string;
      state: string;
    }>
  ) {
    try {
      // Validate ownership
      const customer = await prisma.customer.findFirst({
        where: { id: customerId, userId }
      });
      
      if (!customer) throw new Error('Customer not found');
      
      // Validate fields if provided
      if (data.gstNumber !== undefined && data.gstNumber && !validateGSTNumber(data.gstNumber)) {
        throw new Error('Invalid GST number format');
      }
      
      if (data.panNumber !== undefined && data.panNumber && !validatePAN(data.panNumber)) {
        throw new Error('Invalid PAN format');
      }
      
      if (data.phone !== undefined && data.phone) {
        if (!validatePhoneNumber(data.phone)) {
          throw new Error('Invalid phone number format');
        }
        data.phone = formatPhoneNumber(data.phone);
      }

      const updated = await prisma.customer.update({
        where: { id: customerId },
        data
      });
      
      return updated;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  async deleteCustomer(customerId: string, userId: string) {
    try {
      // Validate ownership
      const customer = await prisma.customer.findFirst({
        where: { id: customerId, userId }
      });
      
      if (!customer) throw new Error('Customer not found');
      
      await prisma.customer.delete({
        where: { id: customerId }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }
};

// Invoice Service
export const invoiceService = {
  async createInvoice(
    userId: string,
    data: {
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
      items: Array<{
        description: string;
        quantity: number;
        rate: number;
        gstRate: number;
      }>;
    }
  ) {
    try {
      const invoiceNumber = generateInvoiceNumber();
      const isInterState = data.businessState !== data.customerState;
      
      const { 
        subtotal, 
        cgst, 
        sgst, 
        igst, 
        totalAmount, 
        itemsWithAmounts 
      } = calculateInvoiceAmounts(data.items, isInterState);

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          userId,
          customerId: data.customerId,
          customerName: data.customerName,
          customerGST: data.customerGST,
          customerAddress: data.customerAddress,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          businessState: data.businessState,
          customerState: data.customerState,
          subtotal,
          cgst,
          sgst,
          igst,
          totalAmount,
          isInterState,
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate,
          termsConditions: data.termsConditions,
          notes: data.notes,
          items: {
            create: itemsWithAmounts
          }
        },
        include: {
          items: true,
          customer: true,
          user: {
            select: {
              businessName: true,
              businessAddress: true,
              businessGST: true,
              businessPAN: true,
              businessPhone: true,
              businessEmail: true,
              businessState: true,
              businessLogo: true,
            }
          }
        }
      });
      
      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  async getInvoices(
    userId: string,
    options?: {
      status?: string;
      paymentStatus?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const skip = (page - 1) * limit;

      const where: Prisma.InvoiceWhereInput = {
        userId,
        ...(options?.status && { status: options.status as any }),
        ...(options?.paymentStatus && { paymentStatus: options.paymentStatus as any }),
        ...(options?.startDate && options?.endDate && {
          invoiceDate: {
            gte: options.startDate,
            lte: options.endDate
          }
        }),
        ...(options?.search && {
          OR: [
            { invoiceNumber: { contains: options.search, mode: 'insensitive' } },
            { customerName: { contains: options.search, mode: 'insensitive' } }
          ]
        })
      };

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          include: {
            customer: true,
            items: true
          },
          orderBy: { invoiceDate: 'desc' },
          skip,
          take: limit
        }),
        prisma.invoice.count({ where })
      ]);

      return {
        invoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  async getInvoiceById(invoiceId: string, userId: string) {
    try {
      const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, userId },
        include: {
          items: true,
          customer: true,
          user: {
            select: {
              businessName: true,
              businessAddress: true,
              businessGST: true,
              businessPAN: true,
              businessPhone: true,
              businessEmail: true,
              businessState: true,
              businessLogo: true,
            }
          }
        }
      });
      
      if (!invoice) throw new Error('Invoice not found');
      return invoice;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  },

  async updateInvoiceStatus(
    invoiceId: string,
    userId: string,
    status: 'DRAFT' | 'GENERATED' | 'CANCELLED'
  ) {
    try {
      const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, userId }
      });
      
      if (!invoice) throw new Error('Invoice not found');
      
      const updated = await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status }
      });
      
      return updated;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  },

  async updatePaymentStatus(
    invoiceId: string,
    userId: string,
    data: {
      paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID';
      paidAmount: number;
      paymentDate?: Date;
    }
  ) {
    try {
      const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, userId }
      });
      
      if (!invoice) throw new Error('Invoice not found');
      
      const updated = await prisma.invoice.update({
        where: { id: invoiceId },
        data
      });
      
      return updated;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }
};

export default { userService, customerService, invoiceService };