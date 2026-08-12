import prisma from "../config/prisma"
import AppError from "../utils/AppError"
import { assertBoardMember } from "./board.service"
import { positionAfter } from "./position.service"

interface CreateCardInput {
  listId: string
  userId: string
  title: string
}

export const createCard = async ({ listId, userId, title }: CreateCardInput) => {
  if (!title || !title.trim()) {
    throw new AppError("Card title is required", 400, "VALIDATION_ERROR")
  }

  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { boardId: true },
  })

  if (!list) {
    throw new AppError("List not found", 404, "LIST_NOT_FOUND")
  }

  await assertBoardMember(list.boardId, userId)

  const lastCard = await prisma.card.findFirst({
    where: { listId },
    orderBy: { position: "desc" },
    select: { position: true },
  })

  const position = positionAfter(lastCard?.position ?? null)

  const card = await prisma.card.create({
    data: { listId, title: title.trim(), position },
    select: { id: true, listId: true, title: true, position: true },
  })

  return card
}