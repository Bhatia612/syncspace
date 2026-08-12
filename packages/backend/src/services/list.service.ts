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