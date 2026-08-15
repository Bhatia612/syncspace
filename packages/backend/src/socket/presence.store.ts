import type { PresenceUser } from "@syncspace/shared"

export interface PresenceStore {
    addConnection(boardId: string, userId: string, name: string, socketId: string): boolean

    removeConnection(boardId: string, userId: string, socketId: string): boolean

    removeSocketEverywhere(userId: string, socketId: string): string[]

    getBoardPresence(boardId: string): PresenceUser[]
}