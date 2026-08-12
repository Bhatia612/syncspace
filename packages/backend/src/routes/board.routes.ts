import { Router } from "express"
import * as boardController from "../controllers/board.controller"
import { requireAuth } from "../middleware/auth.middleware"

const boardRouter = Router()

boardRouter.post("/", requireAuth, boardController.createBoard)
boardRouter.get("/:id", requireAuth, boardController.getBoard)

export default boardRouter