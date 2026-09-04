import { Router } from "express"
import * as boardController from "../controllers/board.controller"
import { requireAuth } from "../middleware/auth.middleware"
import * as listController from "../controllers/list.controller"

const boardRouter = Router()

boardRouter.post("/", requireAuth, boardController.createBoard)
boardRouter.get("/", requireAuth, boardController.getBoards)
boardRouter.post("/:id/lists", requireAuth, listController.createList)
boardRouter.get("/:id", requireAuth, boardController.getBoard)
boardRouter.patch("/:id", requireAuth, boardController.renameBoard)
boardRouter.delete("/:id", requireAuth, boardController.deleteBoard)

export default boardRouter