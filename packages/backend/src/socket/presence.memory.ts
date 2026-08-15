import type { PresenceUser } from "@syncspace/shared"
import type { PresenceStore } from "./presence.store"

interface UserPresence {
  name: string
  sockets: Set<string>
}

export class InMemoryPresenceStore implements PresenceStore {
  private boards = new Map<string, Map<string, UserPresence>>()

  addConnection(boardId: string, userId: string, name: string, socketId: string): boolean {
    let users = this.boards.get(boardId)
    if (!users) {
      users = new Map()
      this.boards.set(boardId, users)
    }

    let entry = users.get(userId)
    if (!entry) {
      entry = { name, sockets: new Set() }
      users.set(userId, entry)
      entry.sockets.add(socketId)
      return true
    }

    entry.sockets.add(socketId)
    return false
  }

  removeConnection(boardId: string, userId: string, socketId: string): boolean {
    const users = this.boards.get(boardId)
    if (!users) return false

    const entry = users.get(userId)
    if (!entry) return false

    entry.sockets.delete(socketId)

    if (entry.sockets.size === 0) {
      users.delete(userId)
      if (users.size === 0) this.boards.delete(boardId)
      return true
    }

    return false
  }

  removeSocketEverywhere(userId: string, socketId: string): string[] {
    const nowAbsentFrom: string[] = []

    for (const [boardId, users] of this.boards) {
      const entry = users.get(userId)
      if (!entry) continue
      if (!entry.sockets.has(socketId)) continue

      entry.sockets.delete(socketId)
      if (entry.sockets.size === 0) {
        users.delete(userId)
        if (users.size === 0) this.boards.delete(boardId)
        nowAbsentFrom.push(boardId)
      }
    }

    return nowAbsentFrom
  }

  getBoardPresence(boardId: string): PresenceUser[] {
    const users = this.boards.get(boardId)
    if (!users) return []

    return Array.from(users.entries()).map(([userId, entry]) => ({
      userId,
      name: entry.name,
    }))
  }
}