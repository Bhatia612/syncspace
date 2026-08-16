import type { Request, Response, NextFunction } from "express"
import * as boardService from "../services/board.service"

export const createBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const board = await boardService.createBoard({
      title: req.body.title,
      userId: req.userId!,
    })
    res.status(201).json({ board })
  } catch (err) {
    next(err)
  }
}

export const getBoard = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const snapshot = await boardService.getBoardSnapshot(req.params.id, req.userId!)
    res.json({ board: snapshot })
  } catch (err) {
    next(err)
  }
}

export const getBoards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const boards = await boardService.getUserBoards(req.userId!)
    res.json({ boards })
  } catch (err) {
    next(err)
  }
}