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
import AppError from "../utils/AppError"

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>

const roomFor = (boardId: string) => `board:${boardId}`

export const registerBoardHandlers = (io: TypedServer, socket: TypedSocket) => {
  const userId = socket.data.userId

  socket.on("board:join", async (boardId, ack) => {
    try {
      await assertBoardMember(boardId, userId)
      await socket.join(roomFor(boardId))
      ack({ ok: true })
    } catch {
      ack({ ok: false })
    }
  })

  socket.on("board:leave", (boardId) => {
    socket.leave(roomFor(boardId))
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
}