// src/lib/cloudinary.ts

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export async function uploadImage(
  file: Buffer | string,
  options?: {
    folder?: string;
    transformation?: any[];
    public_id?: string;
  }
): Promise<UploadResult> {
  try {
    const uploadOptions = {
      folder: options?.folder || 'gst-invoice',
      resource_type: 'image' as const,
      transformation: options?.transformation || [
        { width: 300, height: 300, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      public_id: options?.public_id,
    };

    const result = await cloudinary.uploader.upload(
      file instanceof Buffer ? `data:image/jpeg;base64,${file.toString('base64')}` : file,
      uploadOptions
    );

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  }
): string {
  const transformation = [];
  
  if (options?.width || options?.height) {
    transformation.push({
      width: options.width,
      height: options.height,
      crop: options.crop || 'fill',
    });
  }
  
  transformation.push({
    quality: options?.quality || 'auto',
    fetch_format: 'auto',
  });

  return cloudinary.url(publicId, {
    transformation,
    secure: true,
  });
}

// Client-side upload widget configuration
export function getUploadWidgetConfig() {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset: 'gst-invoice-preset', // Create this preset in Cloudinary dashboard
    cropping: true,
    croppingAspectRatio: 1,
    multiple: false,
    maxFileSize: 5000000, // 5MB
    maxImageWidth: 1000,
    maxImageHeight: 1000,
    sources: ['local', 'camera'],
    folder: 'gst-invoice/logos',
    clientAllowedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
    styles: {
      palette: {
        window: '#FFFFFF',
        windowBorder: '#90A0B3',
        tabIcon: '#0094C7',
        menuIcons: '#5A616A',
        textDark: '#000000',
        textLight: '#FFFFFF',
        link: '#0078FF',
        action: '#FF620C',
        inactiveTabIcon: '#0E2F5A',
        error: '#F44235',
        inProgress: '#0078FF',
        complete: '#20B832',
        sourceBg: '#E4EBF1'
      }
    }
  };
}