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


interface MoveCardInput {
  cardId: string
  toListId: string
  position: string
  userId: string
}

export const moveCard = async ({ cardId, toListId, position, userId }: MoveCardInput) => {
  if (!position) {
    throw new AppError("Position is required", 400, "VALIDATION_ERROR")
  }

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { list: { select: { boardId: true } } },
  })

  if (!card) {
    throw new AppError("Card not found", 404, "CARD_NOT_FOUND")
  }

  const toList = await prisma.list.findUnique({
    where: { id: toListId },
    select: { boardId: true },
  })

  if (!toList) {
    throw new AppError("Destination list not found", 404, "LIST_NOT_FOUND")
  }

  if (card.list.boardId !== toList.boardId) {
    throw new AppError("Cannot move a card to a different board", 400, "CROSS_BOARD_MOVE")
  }

  await assertBoardMember(card.list.boardId, userId)

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: { listId: toListId, position },
    select: { id: true, listId: true, title: true, position: true },
  })

  return updated
}