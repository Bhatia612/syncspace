import { apiRequest } from "../../api/client"
import type { BoardSnapshot, List, Card } from "@syncspace/shared"

export const getBoardSnapshot = (boardId: string) =>
  apiRequest<{ board: BoardSnapshot }>(`/boards/${boardId}`)

export const createList = (boardId: string, title: string) =>
  apiRequest<{ list: List }>(`/boards/${boardId}/lists`, {
    method: "POST",
    body: { title },
  })

export const createCard = (listId: string, title: string) =>
  apiRequest<{ card: Card }>(`/lists/${listId}/cards`, {
    method: "POST",
    body: { title },
  })