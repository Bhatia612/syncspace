import jwt from "jsonwebtoken"
import type { Response } from "express"

const JWT_SECRET = process.env.JWT_SECRET as string
const isProduction = process.env.NODE_ENV === "production"

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set")
}

export const signToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15d" })
}

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string }
}

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  })
}

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  })
}