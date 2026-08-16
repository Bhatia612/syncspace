import { apiRequest } from "../../api/client"

export interface BoardSummary {
  id: string
  title: string
  role: "OWNER" | "MEMBER"
  memberCount: number
  createdAt: string
}

export const getBoards = () => apiRequest<{ boards: BoardSummary[] }>("/boards")

export const createBoard = (title: string) =>
  apiRequest<{ board: { id: string; title: string } }>("/boards", {
    method: "POST",
    body: { title },
  })