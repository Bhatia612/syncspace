import type { Server } from "socket.io"
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@syncspace/shared"

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>

let io: TypedServer | null = null

export function setIo(server: TypedServer) {
  io = server
}

export function broadcastToBoard<E extends keyof ServerToClientEvents>(
  boardId: string,
  event: E,
  payload: Parameters<ServerToClientEvents[E]>[0]
) {
  if (!io) return
  ;(io.to(`board:${boardId}`).emit as any)(event, payload)
}