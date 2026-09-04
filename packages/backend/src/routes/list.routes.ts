import { Router } from "express"
import * as cardController from "../controllers/card.controller"
import * as listController from "../controllers/list.controller"
import { requireAuth } from "../middleware/auth.middleware"

const listRouter = Router()

listRouter.post("/:id/cards", requireAuth, cardController.createCard)
listRouter.patch("/:id", requireAuth, listController.renameList)
listRouter.delete("/:id", requireAuth, listController.deleteList)

export default listRouter