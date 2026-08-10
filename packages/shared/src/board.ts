export interface Card {
  id: string
  listId: string
  title: string
  position: string
}

export interface List {
  id: string
  boardId: string
  title: string
  position: string
}

export interface BoardSnapshot {
  id: string
  title: string
  lists: List[]
  cards: Card[]
}