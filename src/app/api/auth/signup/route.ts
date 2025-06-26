import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"

const prisma = new PrismaClient()

const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = signUpSchema.parse(body)
    
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }
    
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        businessName: "",
        businessAddress: "",
        businessState: "Assam",
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    })
    
    return NextResponse.json({
      message: "Account created successfully",
      user
    }, { status: 201 })
    
  } catch (error) {
    console.error("Signup error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}