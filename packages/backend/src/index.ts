import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes"
import { errorHandler } from "./middleware/errorHandler"
import boardRouter from "./routes/board.routes"
import listRouter from "./routes/list.routes"
import cardRouter from "./routes/card.routes"
import { registerBoardHandlers } from "./socket/board.handlers"

import type {
    ClientToServerEvents,
    ServerToClientEvents,
    SocketData,
} from "@syncspace/shared"

import { socketAuth } from "./socket/socket.auth"


const PORT = process.env.PORT || 4000
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"

const app = express()
const httpServer = createServer(app)


const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(httpServer, {
    cors: {
        origin: FRONTEND_URL,
        credentials: true,
    },
})

app.use(express.json())
app.use(cookieParser())
app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true,
    })
)

app.use("/api/v1/auth", authRoutes)

app.use("/api/v1/boards", boardRouter)

app.use("/api/v1/lists", listRouter)

app.use("/api/v1/cards", cardRouter)

app.get("/health", (_req, res) => {
    res.json({ status: "ok" })
})

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, "user:", socket.data.userId)

    registerBoardHandlers(io, socket)

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id)
    })
})

io.use(socketAuth)

app.use(errorHandler)

httpServer.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`)
})