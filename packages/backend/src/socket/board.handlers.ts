import type { Server, Socket } from "socket.io"
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  CardMoveCommand,
  CommandAck,
} from "@syncspace/shared"
import { assertBoardMember } from "../services/board.service"
import { moveCard } from "../services/card.service"
import { InMemoryPresenceStore } from "./presence.memory"
import prisma from "../config/prisma"
import AppError from "../utils/AppError"

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>

const roomFor = (boardId: string) => `board:${boardId}`

const presence = new InMemoryPresenceStore()

export const registerBoardHandlers = (io: TypedServer, socket: TypedSocket) => {
  const userId = socket.data.userId

  socket.on("board:join", async (boardId, ack) => {
    try {
      await assertBoardMember(boardId, userId)
      await socket.join(roomFor(boardId))

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      })

      presence.addConnection(boardId, userId, user?.name ?? "Unknown", socket.id)

      io.to(roomFor(boardId)).emit("presence:update", presence.getBoardPresence(boardId))

      ack({ ok: true })
    } catch {
      ack({ ok: false })
    }
  })

  socket.on("board:leave", (boardId) => {
    socket.leave(roomFor(boardId))
    const nowAbsent = presence.removeConnection(boardId, userId, socket.id)
    if (nowAbsent) {
      io.to(roomFor(boardId)).emit("presence:update", presence.getBoardPresence(boardId))
    }
  })

  socket.on("card:move", async (cmd: CardMoveCommand, ack: (res: CommandAck) => void) => {
    try {
      const updated = await moveCard({
        cardId: cmd.cardId,
        toListId: cmd.toListId,
        position: cmd.position,
        userId,
      })

      ack({ ok: true })

      socket.to(roomFor(updated.boardId)).emit("card:moved", {
        cardId: updated.id,
        toListId: updated.listId,
        position: updated.position,
      })
    } catch (err) {
      const reason = err instanceof AppError ? err.code : "MOVE_FAILED"
      ack({ ok: false, reason })
    }
  })

  socket.on("disconnect", () => {
    const nowAbsentFrom = presence.removeSocketEverywhere(userId, socket.id)
    for (const boardId of nowAbsentFrom) {
      io.to(roomFor(boardId)).emit("presence:update", presence.getBoardPresence(boardId))
    }
  })
}