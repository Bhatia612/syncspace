import { Router } from "express"
import * as boardController from "../controllers/board.controller"
import { requireAuth } from "../middleware/auth.middleware"
import * as listController from "../controllers/list.controller"

const boardRouter = Router()

boardRouter.post("/", requireAuth, boardController.createBoard)
boardRouter.get("/:id", requireAuth, boardController.getBoard)
boardRouter.post("/:id/lists", requireAuth, listController.createList)

export default boardRouter