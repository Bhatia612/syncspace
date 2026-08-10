import type { Request, Response, NextFunction } from "express"
import * as authService from "../services/auth.service"
import { signToken, setAuthCookie, clearAuthCookie } from "../utils/auth"
import prisma from "../config/prisma"

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.signup(req.body)
    res.status(201).json({ user })
  } catch (err) {
    next(err)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.login(req.body)
    const token = signToken(user.id)
    setAuthCookie(res, token)
    res.json({ user })
  } catch (err) {
    next(err)
  }
}

export const logout = async (_req: Request, res: Response) => {
  clearAuthCookie(res)
  res.json({ message: "Logged out" })
}

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true },
    })
    res.json({ user })
  } catch (err) {
    next(err)
  }
}