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