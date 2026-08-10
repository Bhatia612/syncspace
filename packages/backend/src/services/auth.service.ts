import bcrypt from "bcrypt"
import prisma from "../config/prisma"
import AppError from "../utils/AppError"

interface SignupInput {
  name: string
  email: string
  password: string
}

interface LoginInput {
  email: string
  password: string
}

export const signup = async ({ name, email, password }: SignupInput) => {
  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required", 400, "VALIDATION_ERROR")
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400, "VALIDATION_ERROR")
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  
  if (existing) {
    throw new AppError("Email already in use", 409, "EMAIL_TAKEN")
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true },
  })

  return user
}

export const login = async ({ email, password }: LoginInput) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400, "VALIDATION_ERROR")
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS")
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS")
  }

  return { id: user.id, name: user.name, email: user.email }
}