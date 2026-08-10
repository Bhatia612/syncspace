import type { Request, Response, NextFunction } from "express"
import { verifyToken } from "../utils/auth"
import AppError from "../utils/AppError"

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.token

  if (!token) {
    return next(new AppError("Authentication required", 401, "UNAUTHENTICATED"))
  }

  try {
    const { userId } = verifyToken(token)
    req.userId = userId
    next()
  } catch {
    next(new AppError("Invalid or expired session", 401, "UNAUTHENTICATED"))
  }
}