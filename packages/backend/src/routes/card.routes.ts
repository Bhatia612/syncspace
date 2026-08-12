import { Router } from "express"
import * as cardController from "../controllers/card.controller"
import { requireAuth } from "../middleware/auth.middleware"

const cardRouter = Router()

cardRouter.patch("/:id/move", requireAuth, cardController.moveCard)

export default cardRouter