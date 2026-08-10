import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import cookieParser from "cookie-parser"
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@syncspace/shared"

const PORT = process.env.PORT || 4000
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"

const app = express()
const httpServer = createServer(app)


const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
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

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id)

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})