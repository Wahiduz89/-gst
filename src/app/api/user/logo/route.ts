// src/app/api/user/logo/route.ts - Logo Upload API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp'; // Install: npm install sharp

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('logo') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `logo-${session.user.id}-${timestamp}.webp`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'logos');
    const filePath = join(uploadDir, filename);

    // Ensure upload directory exists
    const { mkdir } = await import('fs/promises');
    await mkdir(uploadDir, { recursive: true });

    // Process and save image
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Use sharp to process the image - resize, optimize, and convert to WebP
    await sharp(buffer)
      .resize(300, 300, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(filePath);

    // Delete old logo if exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { businessLogo: true },
    });

    if (user?.businessLogo) {
      const oldPath = join(process.cwd(), 'public', user.businessLogo);
      try {
        await unlink(oldPath);
      } catch (error) {
        console.error('Failed to delete old logo:', error);
      }
    }

    // Update user record with new logo path
    const logoUrl = `/uploads/logos/${filename}`;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { businessLogo: logoUrl },
    });

    return NextResponse.json({ logoUrl });
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current logo path
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { businessLogo: true },
    });

    if (user?.businessLogo) {
      const logoPath = join(process.cwd(), 'public', user.businessLogo);
      
      // Delete file
      try {
        await unlink(logoPath);
      } catch (error) {
        console.error('Failed to delete logo file:', error);
      }

      // Update database
      await prisma.user.update({
        where: { id: session.user.id },
        data: { businessLogo: null },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logo deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete logo' },
      { status: 500 }
    );
  }
}

// For production environments using external storage (S3, Cloudinary, etc.)
// Replace the file system operations with appropriate SDK calls
// Example for Cloudinary:
/*
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// In POST handler:
const result = await new Promise((resolve, reject) => {
  cloudinary.uploader.upload_stream(
    {
      folder: 'business-logos',
      public_id: `logo-${session.user.id}`,
      overwrite: true,
      transformation: [
        { width: 300, height: 300, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    },
    (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }
  ).end(buffer);
});

const logoUrl = result.secure_url;
*/