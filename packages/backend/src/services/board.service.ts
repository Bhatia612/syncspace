import prisma from "../config/prisma"
import AppError from "../utils/AppError"
import type { BoardSnapshot } from "@syncspace/shared"
import { capitalizeFirst } from "../utils/format"

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
            title: capitalizeFirst(title),
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
        select: {
            id: true,
            listId: true,
            title: true,
            position: true,
            createdBy: { select: { id: true, name: true } },
        },
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
            createdBy: c.createdBy,
        })),
    }
}

export const getUserBoards = async (userId: string) => {
    const memberships = await prisma.boardMember.findMany({
        where: { userId },
        include: {
            board: {
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    _count: { select: { members: true } },
                },
            },
        },
        orderBy: { board: { createdAt: "desc" } },
    })

    return memberships.map((m) => ({
        id: m.board.id,
        title: m.board.title,
        role: m.role,
        memberCount: m.board._count.members,
        createdAt: m.board.createdAt,
    }))
}

interface RenameBoardInput {
    boardId: string
    userId: string
    title: string
}

export const renameBoard = async ({ boardId, userId, title }: RenameBoardInput) => {
    if (!title || !title.trim()) {
        throw new AppError("Board title is required", 400, "VALIDATION_ERROR")
    }

    await assertBoardMember(boardId, userId)

    return prisma.board.update({
        where: { id: boardId },
        data: { title: capitalizeFirst(title) },
        select: { id: true, title: true },
    })
}

interface DeleteBoardInput {
    boardId: string
    userId: string
}

export const deleteBoard = async ({ boardId, userId }: DeleteBoardInput) => {
    const membership = await assertBoardMember(boardId, userId)

    if (membership.role !== "OWNER") {
        throw new AppError("Only the board owner can delete it", 403, "NOT_BOARD_OWNER")
    }

    await prisma.board.delete({ where: { id: boardId } })
    return { id: boardId }
}


interface InviteMemberInput {
    boardId: string
    ownerId: string
    email: string
}

export const inviteMember = async ({ boardId, ownerId, email }: InviteMemberInput) => {
    const ownerMembership = await assertBoardMember(boardId, ownerId)
    if (ownerMembership.role !== "OWNER") {
        throw new AppError("Only the board owner can invite members", 403, "NOT_BOARD_OWNER")
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
        throw new AppError("Email is required", 400, "VALIDATION_ERROR")
    }

    const user = await prisma.user.findUnique({
        where: { email: trimmedEmail },
        select: { id: true, name: true, email: true },
    })
    if (!user) {
        throw new AppError("No user found with that email", 404, "USER_NOT_FOUND")
    }

    const existing = await prisma.boardMember.findUnique({
        where: { boardId_userId: { boardId, userId: user.id } },
    })
    if (existing) {
        throw new AppError("That person is already a member", 409, "ALREADY_MEMBER")
    }

    await prisma.boardMember.create({
        data: { boardId, userId: user.id, role: "MEMBER" },
    })

    return { id: user.id, name: user.name, email: user.email, role: "MEMBER" as const }
}

export const getBoardMembers = async (boardId: string, userId: string) => {
    await assertBoardMember(boardId, userId)

    const members = await prisma.boardMember.findMany({
        where: { boardId },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { role: "asc" },
    })

    return members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
    }))
}

interface RemoveMemberInput {
    boardId: string
    ownerId: string
    memberUserId: string
}

export const removeMember = async ({ boardId, ownerId, memberUserId }: RemoveMemberInput) => {
    const ownerMembership = await assertBoardMember(boardId, ownerId)
    if (ownerMembership.role !== "OWNER") {
        throw new AppError("Only the board owner can remove members", 403, "NOT_BOARD_OWNER")
    }

    if (memberUserId === ownerId) {
        throw new AppError("The owner cannot be removed", 400, "CANNOT_REMOVE_OWNER")
    }

    await prisma.boardMember.delete({
        where: { boardId_userId: { boardId, userId: memberUserId } },
    })

    return { id: memberUserId }
}