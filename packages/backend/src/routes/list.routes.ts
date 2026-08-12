import { Router } from "express"
import * as cardController from "../controllers/card.controller"
import { requireAuth } from "../middleware/auth.middleware"

const listRouter = Router()

listRouter.post("/:id/cards", requireAuth, cardController.createCard)

export default listRouter