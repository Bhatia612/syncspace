import { Router } from "express"
import * as boardController from "../controllers/board.controller"
import { requireAuth } from "../middleware/auth.middleware"
import * as listController from "../controllers/list.controller"

const boardRouter = Router()

boardRouter.post("/", requireAuth, boardController.createBoard)
boardRouter.get("/", requireAuth, boardController.getBoards)
boardRouter.post("/:id/lists", requireAuth, listController.createList)
boardRouter.post("/:id/members", requireAuth, boardController.inviteMember)
boardRouter.get("/:id/members", requireAuth, boardController.getBoardMembers)
boardRouter.delete("/:id/members/:userId", requireAuth, boardController.removeMember)
boardRouter.get("/:id", requireAuth, boardController.getBoard)
boardRouter.patch("/:id", requireAuth, boardController.renameBoard)
boardRouter.delete("/:id", requireAuth, boardController.deleteBoard)

export default boardRouter