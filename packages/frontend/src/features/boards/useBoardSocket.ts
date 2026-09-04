import { useEffect } from "react"
import { getSocket } from "../../socket/socket"
import type {
  CardMovedEvent,
  CardCreatedEvent,
  CardRenamedEvent,
  CardDeletedEvent,
  ListCreatedEvent,
  ListRenamedEvent,
  ListDeletedEvent,
} from "@syncspace/shared"

interface BoardSocketHandlers {
  onCardMoved: (evt: CardMovedEvent) => void
  onCardCreated: (evt: CardCreatedEvent) => void
  onCardRenamed: (evt: CardRenamedEvent) => void
  onCardDeleted: (evt: CardDeletedEvent) => void
  onListCreated: (evt: ListCreatedEvent) => void
  onListRenamed: (evt: ListRenamedEvent) => void
  onListDeleted: (evt: ListDeletedEvent) => void
}

export function useBoardSocket(boardId: string | undefined, handlers: BoardSocketHandlers) {
  useEffect(() => {
    if (!boardId) return
    const socket = getSocket()

    socket.emit("board:join", boardId, (ack) => {
      if (!ack.ok) console.warn("Failed to join board room")
    })

    socket.on("card:moved", handlers.onCardMoved)
    socket.on("card:created", handlers.onCardCreated)
    socket.on("card:renamed", handlers.onCardRenamed)
    socket.on("card:deleted", handlers.onCardDeleted)
    socket.on("list:created", handlers.onListCreated)
    socket.on("list:renamed", handlers.onListRenamed)
    socket.on("list:deleted", handlers.onListDeleted)

    return () => {
      socket.emit("board:leave", boardId)
      socket.off("card:moved", handlers.onCardMoved)
      socket.off("card:created", handlers.onCardCreated)
      socket.off("card:renamed", handlers.onCardRenamed)
      socket.off("card:deleted", handlers.onCardDeleted)
      socket.off("list:created", handlers.onListCreated)
      socket.off("list:renamed", handlers.onListRenamed)
      socket.off("list:deleted", handlers.onListDeleted)
    }
  }, [boardId, handlers])
}