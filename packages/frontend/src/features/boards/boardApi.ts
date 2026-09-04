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

export const renameCard = (cardId: string, title: string) =>
  apiRequest<{ card: Card }>(`/cards/${cardId}`, { method: "PATCH", body: { title } })

export const deleteCard = (cardId: string) =>
  apiRequest<{ id: string }>(`/cards/${cardId}`, { method: "DELETE" })

export const renameList = (listId: string, title: string) =>
  apiRequest<{ list: List }>(`/lists/${listId}`, { method: "PATCH", body: { title } })

export const deleteList = (listId: string) =>
  apiRequest<{ id: string }>(`/lists/${listId}`, { method: "DELETE" })


export interface BoardMember {
  id: string
  name: string
  email: string
  role: "OWNER" | "MEMBER"
}

export const getMembers = (boardId: string) =>
  apiRequest<{ members: BoardMember[] }>(`/boards/${boardId}/members`)

export const inviteMember = (boardId: string, email: string) =>
  apiRequest<{ member: BoardMember }>(`/boards/${boardId}/members`, {
    method: "POST",
    body: { email },
  })

export const removeMember = (boardId: string, userId: string) =>
  apiRequest<{ id: string }>(`/boards/${boardId}/members/${userId}`, { method: "DELETE" })