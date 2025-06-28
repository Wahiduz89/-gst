import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';

export const userService = {
  async getBusinessInfo(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        businessName: true,
        businessAddress: true,
        businessGST: true,
        businessPAN: true,
        businessPhone: true,
        businessEmail: true,
        businessState: true,
        businessLogo: true,
      },
    });
  },

  async updateBusinessInfo(userId: string, data: any) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  async uploadBusinessLogo(userId: string, buffer: Buffer) {
    // Implement logo upload logic
    const logoUrl = `/uploads/logos/logo-${userId}-${Date.now()}.jpg`;
    
    return await prisma.user.update({
      where: { id: userId },
      data: { businessLogo: logoUrl },
    });
  },
};