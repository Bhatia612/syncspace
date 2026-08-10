import type { CardMoveCommand } from "@syncspace/shared"

const testMove: CardMoveCommand = {
  cardId: "test",
  toListId: "list-1",
  position: "a0",
}

console.log("Backend starting. Shared types resolve:", testMove.cardId)