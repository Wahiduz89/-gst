// src/lib/auth.ts - Enhanced configuration with better error handling
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.password) {
            console.error('User not found or no password');
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.error('Invalid password');
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          console.log('🔍 Google sign-in attempt for:', user.email);
          
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            console.log('👤 Creating new user for Google OAuth');
            
            // Create new user for Google OAuth
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || 'Google User',
                password: '', // Empty password for OAuth users
                businessName: user.name || '',
                businessAddress: '',
                businessState: 'Assam',
              }
            });
            
            console.log('✅ New user created:', newUser.id);
          } else {
            console.log('✅ Existing user found:', existingUser.id);
          }
          
          return true;
        } catch (error) {
          console.error('❌ Error in Google sign-in callback:', error);
          return false;
        }
      }
      return true;
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signIn(message) {
      console.log('Sign in event:', message);
    },
    async signOut(message) {
      console.log('Sign out event:', message);
    },
    async session(message) {
      console.log('Session event:', message);
    },
  },
};

// Type extensions
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    };
  }
}