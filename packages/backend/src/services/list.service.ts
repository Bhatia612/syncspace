import prisma from "../config/prisma"
import AppError from "../utils/AppError"
import { assertBoardMember } from "./board.service"
import { positionAfter } from "./position.service"

interface CreateListInput {
  boardId: string
  userId: string
  title: string
}

export const createList = async ({ boardId, userId, title }: CreateListInput) => {
  await assertBoardMember(boardId, userId)

  if (!title || !title.trim()) {
    throw new AppError("List title is required", 400, "VALIDATION_ERROR")
  }

  const lastList = await prisma.list.findFirst({
    where: { boardId },
    orderBy: { position: "desc" },
    select: { position: true },
  })

  const position = positionAfter(lastList?.position ?? null)

  const list = await prisma.list.create({
    data: { boardId, title: title.trim(), position },
    select: { id: true, boardId: true, title: true, position: true },
  })

  return list
}

interface RenameListInput {
  listId: string
  userId: string
  title: string
}

export const renameList = async ({ listId, userId, title }: RenameListInput) => {
  if (!title || !title.trim()) {
    throw new AppError("List title is required", 400, "VALIDATION_ERROR")
  }

  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { boardId: true },
  })
  if (!list) throw new AppError("List not found", 404, "LIST_NOT_FOUND")

  await assertBoardMember(list.boardId, userId)

  return prisma.list.update({
    where: { id: listId },
    data: { title: title.trim() },
    select: { id: true, boardId: true, title: true, position: true },
  })
}

interface DeleteListInput {
  listId: string
  userId: string
}

export const deleteList = async ({ listId, userId }: DeleteListInput) => {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { boardId: true },
  })
  if (!list) throw new AppError("List not found", 404, "LIST_NOT_FOUND")

  await assertBoardMember(list.boardId, userId)

  // Cards cascade-delete via the schema's onDelete: Cascade.
  await prisma.list.delete({ where: { id: listId } })
  return { id: listId }
}