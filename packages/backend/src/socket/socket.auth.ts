import type { Socket } from "socket.io"
import cookie from "cookie"
import { verifyToken } from "../utils/auth"

export const socketAuth = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const rawCookie = socket.handshake.headers.cookie
    if (!rawCookie) {
      return next(new Error("UNAUTHENTICATED"))
    }

    const parsed = cookie.parse(rawCookie)
    const token = parsed.token
    if (!token) {
      return next(new Error("UNAUTHENTICATED"))
    }

    const { userId } = verifyToken(token)
    socket.data.userId = userId
    next()
  } catch {
    next(new Error("UNAUTHENTICATED"))
  }
}