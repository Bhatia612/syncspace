import type { Card, List } from "./board"


export interface CardMoveCommand {
  cardId: string
  toListId: string
  position: string
}

export interface CardEditingCommand {
  cardId: string
  editing: boolean
}


export interface CardMovedEvent {
  cardId: string
  toListId: string
  position: string
}

export interface PresenceUser {
  userId: string
  name: string
}

export interface CardEditingEvent {
  cardId: string
  userId: string
  name: string
  editing: boolean
}


export type CommandAck =
  | { ok: true }
  | { ok: false; reason: string }

export interface JoinAck {
  ok: boolean
}


export interface ClientToServerEvents {
  "board:join": (boardId: string, ack: (res: JoinAck) => void) => void
  "board:leave": (boardId: string) => void
  "card:move": (cmd: CardMoveCommand, ack: (res: CommandAck) => void) => void
  "card:editing": (cmd: CardEditingCommand) => void
}

export interface ServerToClientEvents {
  "card:moved": (evt: CardMovedEvent) => void
  "card:created": (evt: CardCreatedEvent) => void
  "card:renamed": (evt: CardRenamedEvent) => void
  "card:deleted": (evt: CardDeletedEvent) => void
  "list:created": (evt: ListCreatedEvent) => void
  "list:renamed": (evt: ListRenamedEvent) => void
  "list:deleted": (evt: ListDeletedEvent) => void
  "presence:update": (users: PresenceUser[]) => void
  "card:editing": (evt: CardEditingEvent) => void
}


export interface SocketData {
  userId: string
}


export interface CardCreatedEvent {
  card: Card
}

export interface CardRenamedEvent {
  cardId: string
  title: string
}

export interface CardDeletedEvent {
  cardId: string
}

export interface ListCreatedEvent {
  list: List
}

export interface ListRenamedEvent {
  listId: string
  title: string
}

export interface ListDeletedEvent {
  listId: string
}