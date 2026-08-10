import type { Request, Response, NextFunction } from "express"
import AppError from "../utils/AppError"

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, code: err.code },
    })
  }

  console.error("Unexpected error:", err)
  res.status(500).json({
    error: { message: "Something went wrong", code: "INTERNAL_ERROR" },
  })
}