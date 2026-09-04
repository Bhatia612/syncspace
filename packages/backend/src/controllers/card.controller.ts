import type { Request, Response, NextFunction } from "express"
import * as cardService from "../services/card.service"
import { broadcastToBoard } from "../socket/io"

export const createCard = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const card = await cardService.createCard({ listId: req.params.id, userId: req.userId!, title: req.body.title })
    if (card.boardId) broadcastToBoard(card.boardId, "card:created", { card })
    res.status(201).json({ card })
  } catch (err) { next(err) }
}

export const moveCard = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const card = await cardService.moveCard({
      cardId: req.params.id,
      toListId: req.body.toListId,
      position: req.body.position,
      userId: req.userId!,
    })
    res.json({ card })
  } catch (err) {
    next(err)
  }
}

export const renameCard = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const card = await cardService.renameCard({ cardId: req.params.id, userId: req.userId!, title: req.body.title })
    if (card.boardId) broadcastToBoard(card.boardId, "card:renamed", { cardId: card.id, title: card.title })
    res.json({ card })
  } catch (err) { next(err) }
}


export const deleteCard = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const result = await cardService.deleteCard({ cardId: req.params.id, userId: req.userId! })
    if (result.boardId) broadcastToBoard(result.boardId, "card:deleted", { cardId: result.id })
    res.json(result)
  } catch (err) { next(err) }
}