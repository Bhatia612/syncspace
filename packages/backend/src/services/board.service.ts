import prisma from "../config/prisma"
import AppError from "../utils/AppError"
import type { BoardSnapshot } from "@syncspace/shared"

interface CreateBoardInput {
    title: string
    userId: string
}

export const createBoard = async ({ title, userId }: CreateBoardInput) => {
    if (!title || !title.trim()) {
        throw new AppError("Board title is required", 400, "VALIDATION_ERROR")
    }

    const board = await prisma.board.create({
        data: {
            title: title.trim(),
            ownerId: userId,
            members: {
                create: {
                    userId,
                    role: "OWNER",
                },
            },
        },
        select: { id: true, title: true, ownerId: true },
    })

    return board
}

export const assertBoardMember = async (boardId: string, userId: string) => {
    const membership = await prisma.boardMember.findUnique({
        where: { boardId_userId: { boardId, userId } },
    })

    if (!membership) {
        throw new AppError("You are not a member of this board", 403, "NOT_BOARD_MEMBER")
    }

    return membership
}

export const getBoardSnapshot = async (
    boardId: string,
    userId: string
): Promise<BoardSnapshot> => {
    await assertBoardMember(boardId, userId)

    const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
            lists: {
                orderBy: { position: "asc" },
            },
        },
    })

    if (!board) {
        throw new AppError("Board not found", 404, "BOARD_NOT_FOUND")
    }

    const cards = await prisma.card.findMany({
        where: { list: { boardId } },
        orderBy: { position: "asc" },
    })

    return {
        id: board.id,
        title: board.title,
        lists: board.lists.map((l) => ({
            id: l.id,
            boardId: l.boardId,
            title: l.title,
            position: l.position,
        })),
        cards: cards.map((c) => ({
            id: c.id,
            listId: c.listId,
            title: c.title,
            position: c.position,
        })),
    }
}