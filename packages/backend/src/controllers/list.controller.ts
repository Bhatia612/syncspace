import type { Request, Response, NextFunction } from "express"
import * as listService from "../services/list.service"
import { broadcastToBoard } from "../socket/io"

export const createList = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const list = await listService.createList({ boardId: req.params.id, userId: req.userId!, title: req.body.title })
    broadcastToBoard(list.boardId, "list:created", { list })
    res.status(201).json({ list })
  } catch (err) { next(err) }
}

export const renameList = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const list = await listService.renameList({ listId: req.params.id, userId: req.userId!, title: req.body.title })
    broadcastToBoard(list.boardId, "list:renamed", { listId: list.id, title: list.title })
    res.json({ list })
  } catch (err) { next(err) }
}

export const deleteList = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const result = await listService.deleteList({ listId: req.params.id, userId: req.userId! })
    broadcastToBoard(result.boardId, "list:deleted", { listId: result.id })
    res.json(result)
  } catch (err) { next(err) }
}