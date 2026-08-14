import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../config/prisma", () => ({
    default: {
        card: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        list: {
            findUnique: vi.fn(),
        },
        boardMember: {
            findUnique: vi.fn(),
        },
    },
}))

import prisma from "../../config/prisma"
import { moveCard } from "../card.service"
import AppError from "../../utils/AppError"

const mockCard = prisma.card as unknown as {
    findUnique: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
}
const mockList = prisma.list as unknown as {
    findUnique: ReturnType<typeof vi.fn>
}
const mockBoardMember = prisma.boardMember as unknown as {
    findUnique: ReturnType<typeof vi.fn>
}

describe("moveCard", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("throws if position is missing", async () => {
        await expect(
            moveCard({ cardId: "c1", toListId: "l2", position: "", userId: "u1" })
        ).rejects.toThrow(AppError)
    })

    it("throws CARD_NOT_FOUND if the card does not exist", async () => {
        mockCard.findUnique.mockResolvedValue(null)

        await expect(
            moveCard({ cardId: "c1", toListId: "l2", position: "a0", userId: "u1" })
        ).rejects.toMatchObject({ code: "CARD_NOT_FOUND" })
    })

    it("throws LIST_NOT_FOUND if the destination list does not exist", async () => {
        mockCard.findUnique.mockResolvedValue({
            id: "c1",
            list: { boardId: "b1" },
        })
        mockList.findUnique.mockResolvedValue(null)

        await expect(
            moveCard({ cardId: "c1", toListId: "l2", position: "a0", userId: "u1" })
        ).rejects.toMatchObject({ code: "LIST_NOT_FOUND" })
    })

    it("throws CROSS_BOARD_MOVE if the destination list is on another board", async () => {
        mockCard.findUnique.mockResolvedValue({
            id: "c1",
            list: { boardId: "b1" },
        })
        mockList.findUnique.mockResolvedValue({ boardId: "b2" })

        await expect(
            moveCard({ cardId: "c1", toListId: "l2", position: "a0", userId: "u1" })
        ).rejects.toMatchObject({ code: "CROSS_BOARD_MOVE" })
    })

    it("throws NOT_BOARD_MEMBER if the user is not a member", async () => {
        mockCard.findUnique.mockResolvedValue({
            id: "c1",
            list: { boardId: "b1" },
        })
        mockList.findUnique.mockResolvedValue({ boardId: "b1" })
        mockBoardMember.findUnique.mockResolvedValue(null)

        await expect(
            moveCard({ cardId: "c1", toListId: "l2", position: "a0", userId: "u1" })
        ).rejects.toMatchObject({ code: "NOT_BOARD_MEMBER" })
    })

    it("moves the card when everything is valid", async () => {
        mockCard.findUnique.mockResolvedValue({
            id: "c1",
            list: { boardId: "b1" },
        })
        mockList.findUnique.mockResolvedValue({ boardId: "b1" })
        mockBoardMember.findUnique.mockResolvedValue({ boardId: "b1", userId: "u1", role: "MEMBER" })
        mockCard.update.mockResolvedValue({
            id: "c1",
            listId: "l2",
            title: "Test",
            position: "a0",
        })

        const result = await moveCard({
            cardId: "c1",
            toListId: "l2",
            position: "a0",
            userId: "u1",
        })

        expect(result).toMatchObject({ id: "c1", listId: "l2", position: "a0", boardId: "b1" })
        expect(mockCard.update).toHaveBeenCalledOnce()
    })
})