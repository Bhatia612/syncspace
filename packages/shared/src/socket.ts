
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
  "presence:update": (users: PresenceUser[]) => void
  "card:editing": (evt: CardEditingEvent) => void
}






export interface SocketData {
  userId: string
}