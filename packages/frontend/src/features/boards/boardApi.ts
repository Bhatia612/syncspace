import { apiRequest } from "../../api/client"
import type { BoardSnapshot } from "@syncspace/shared"

export const getBoardSnapshot = (boardId: string) =>
  apiRequest<{ board: BoardSnapshot }>(`/boards/${boardId}`)