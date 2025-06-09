import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function getAuthSession() {
  const session = await getServerSession(authOptions);
  return session;
}

export async function requireAuth() {
  const session = await getAuthSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return session;
}

export async function requireNoAuth() {
  const session = await getAuthSession();
  
  if (session?.user) {
    redirect('/dashboard');
  }
  
  return session;
}