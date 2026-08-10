import { Router } from "express"
import * as authController from "../controllers/auth.controller"
import { requireAuth } from "../middleware/auth.middleware"

const authRouter = Router()

authRouter.post("/signup", authController.signup)
authRouter.post("/login", authController.login)
authRouter.post("/logout", authController.logout)
authRouter.get("/me", requireAuth, authController.me)

export default authRouter