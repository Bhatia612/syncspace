import type { Request, Response, NextFunction } from "express"
import * as cardService from "../services/card.service"

export const createCard = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const card = await cardService.createCard({
      listId: req.params.id,
      userId: req.userId!,
      title: req.body.title,
    })
    res.status(201).json({ card })
  } catch (err) {
    next(err)
  }
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