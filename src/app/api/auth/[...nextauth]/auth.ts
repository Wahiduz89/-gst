// app/api/auth/[...nextauth]/auth.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"

const prisma = new PrismaClient()

// Validation schemas
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate input
          const { email, password } = signInSchema.parse(credentials)
          
          // Find user
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              businessName: true,
            }
          })
          
          if (!user || !user.password) {
            throw new Error("Invalid email or password")
          }
          
          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.password)
          
          if (!isValidPassword) {
            throw new Error("Invalid email or password")
          }
          
          // Return user object (excluding password)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            businessName: user.businessName,
          }
        } catch (error) {
          console.error("Authorization error:", error)
          return null
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
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.businessName = user.businessName
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.businessName = token.businessName as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)