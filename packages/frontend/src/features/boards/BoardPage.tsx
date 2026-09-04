import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type {
  Card,
  List,
  BoardSnapshot,
  CardMovedEvent,
  CardCreatedEvent,
  CardRenamedEvent,
  CardDeletedEvent,
  ListCreatedEvent,
  ListRenamedEvent,
  ListDeletedEvent,
  CommandAck,
} from "@syncspace/shared"
import {
  getBoardSnapshot,
  createList,
  createCard,
  renameCard,
  deleteCard,
  renameList,
  deleteList,
} from "./boardApi"
import { positionForDrop } from "./position"
import { getSocket } from "../../socket/socket"
import { useBoardSocket } from "./useBoardSocket"
import Loader, { InlineLoader } from "../../shared/components/Loader"
import ItemMenu from "../../shared/components/ItemMenu"
import MembersPanel from "./MembersPanel"
import { Users } from "lucide-react"

function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const [showMembers, setShowMembers] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoardSnapshot(boardId!),
    enabled: !!boardId,
  })

  const [board, setBoard] = useState<BoardSnapshot | null>(null)
  const [activeCard, setActiveCard] = useState<Card | null>(null)

  const handlers = useMemo(
    () => ({
      onCardMoved: (evt: CardMovedEvent) => {
        setBoard((prev) => prev && {
          ...prev,
          cards: prev.cards.map((c) => c.id === evt.cardId ? { ...c, listId: evt.toListId, position: evt.position } : c),
        })
      },
      onCardCreated: (evt: CardCreatedEvent) => {
        setBoard((prev) => {
          if (!prev) return prev
          if (prev.cards.some((c) => c.id === evt.card.id)) return prev
          return { ...prev, cards: [...prev.cards, evt.card] }
        })
      },
      onCardRenamed: (evt: CardRenamedEvent) => {
        setBoard((prev) => prev && {
          ...prev,
          cards: prev.cards.map((c) => c.id === evt.cardId ? { ...c, title: evt.title } : c),
        })
      },
      onCardDeleted: (evt: CardDeletedEvent) => {
        setBoard((prev) => prev && { ...prev, cards: prev.cards.filter((c) => c.id !== evt.cardId) })
      },
      onListCreated: (evt: ListCreatedEvent) => {
        setBoard((prev) => {
          if (!prev) return prev
          if (prev.lists.some((l) => l.id === evt.list.id)) return prev
          return { ...prev, lists: [...prev.lists, evt.list] }
        })
      },
      onListRenamed: (evt: ListRenamedEvent) => {
        setBoard((prev) => prev && {
          ...prev,
          lists: prev.lists.map((l) => l.id === evt.listId ? { ...l, title: evt.title } : l),
        })
      },
      onListDeleted: (evt: ListDeletedEvent) => {
        setBoard((prev) => prev && {
          ...prev,
          lists: prev.lists.filter((l) => l.id !== evt.listId),
          cards: prev.cards.filter((c) => c.listId !== evt.listId),
        })
      },
    }),
    []
  )

  useBoardSocket(boardId, handlers)

  useEffect(() => {
    if (data?.board) setBoard(data.board)
  }, [data])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  if (isLoading) return <Loader label="Loading board" />

  if (isError || !board) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas">
        <p className="text-text-muted">Couldn't load this board.</p>
        <button
          onClick={() => navigate("/")}
          className="rounded-lg border border-border px-4 py-2 text-sm text-text hover:border-border-strong"
        >
          Back to boards
        </button>
      </div>
    )
  }

  const cardsByList = (listId: string): Card[] =>
    board.cards
      .filter((c) => c.listId === listId)
      .sort((a, b) => (a.position < b.position ? -1 : 1))

  const lists = [...board.lists].sort((a, b) => (a.position < b.position ? -1 : 1))

  const findCard = (id: string) => board.cards.find((c) => c.id === id)

  const listIdOfCard = (cardId: string): string | null =>
    findCard(cardId)?.listId ?? null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCard(findCard(event.active.id as string) ?? null)
  }


  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeListId = listIdOfCard(activeId)
    const overListId = listIdOfCard(overId) ?? (overId.startsWith("list:") ? overId.slice(5) : null)

    if (!activeListId || !overListId || activeListId === overListId) return

    setBoard((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === activeId ? { ...c, listId: overListId } : c
        ),
      }
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null)
    const { active, over } = event
    if (!over || !board) return

    const activeId = active.id as string
    const overId = over.id as string

    const targetListId =
      listIdOfCard(overId) ?? (overId.startsWith("list:") ? overId.slice(5) : null)
    if (!targetListId) return

    const cardsInTarget = board.cards
      .filter((c) => c.listId === targetListId && c.id !== activeId)
      .sort((a, b) => (a.position < b.position ? -1 : 1))

    // Index where the card was dropped.
    let dropIndex = cardsInTarget.findIndex((c) => c.id === overId)
    if (dropIndex === -1) dropIndex = cardsInTarget.length

    const orderedPositions = cardsInTarget.map((c) => c.position)
    const newPosition = positionForDrop(orderedPositions, dropIndex)

    // Snapshot the card's previous state for rollback.
    const before = board.cards.find((c) => c.id === activeId)
    const prevListId = before?.listId
    const prevPosition = before?.position

    setBoard((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === activeId ? { ...c, listId: targetListId, position: newPosition } : c
        ),
      }
    })

    const socket = getSocket()
    socket.emit(
      "card:move",
      { cardId: activeId, toListId: targetListId, position: newPosition },
      (ack: CommandAck) => {
        if (!ack.ok) {
          // Server rejected the move: roll back to where it was.
          setBoard((prev) => {
            if (!prev || prevListId === undefined || prevPosition === undefined) return prev
            return {
              ...prev,
              cards: prev.cards.map((c) =>
                c.id === activeId
                  ? { ...c, listId: prevListId, position: prevPosition }
                  : c
              ),
            }
          })
          console.warn("Move rejected:", ack.reason)
        }
      }
    )
  }

  return (
    <div className="min-h-screen w-full">
      <div className="flex items-center justify-between gap-3 px-4 pt-6 md:px-8 md:pt-8">
        <div className="flex min-w-0 items-center gap-3 md:gap-5">
          <button
            onClick={() => navigate("/")}
            className="shrink-0 text-sm text-text-muted transition-colors hover:text-text"
          >
            ←
          </button>
          <span className="display truncate text-2xl text-text md:text-3xl">{board.title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setShowMembers(true)}
            className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 text-sm text-text-muted transition-colors hover:border-border-strong hover:text-text md:px-3"
          >
            <Users size={16} />
            <span className="hidden md:inline">Members</span>
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <main className="px-8 pb-8 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start">
            {lists.map((list) => (
              <BoardList
                key={list.id}
                list={list}
                cards={cardsByList(list.id)}
                boardId={boardId!}
              />
            ))}
            <AddList boardId={boardId!} />
          </div>
        </main>

        <DragOverlay>
          {activeCard ? (
            <div className="rounded-lg border border-accent bg-surface-2 px-3 py-2.5 text-sm text-text shadow-[var(--shadow-lifted)]">
              {activeCard.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showMembers && <MembersPanel boardId={boardId!} onClose={() => setShowMembers(false)} />}
    </div>
  )
}

function EditableTitle({
  value,
  onSave,
  editing,
  setEditing,
  className = "",
}: {
  value: string
  onSave: (title: string) => void
  editing: boolean
  setEditing: (v: boolean) => void
  className?: string
}) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (editing) setDraft(value)
  }, [editing, value])

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const t = draft.trim()
          if (t && t !== value) onSave(t)
          setEditing(false)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const t = draft.trim()
            if (t && t !== value) onSave(t)
            setEditing(false)
          }
          if (e.key === "Escape") setEditing(false)
        }}
        onClick={(e) => e.stopPropagation()}
        className={`rounded border border-accent bg-surface-2 px-1 outline-none ${className}`}
      />
    )
  }

  return (
    <span
      onDoubleClick={() => setEditing(true)}
      className={`cursor-text select-none ${className}`}
      title="Double-click to rename"
    >
      {value}
    </span>
  )
}

function BoardList({ list, cards, boardId }: { list: List; cards: Card[]; boardId: string }) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["board", boardId] })
  const [editing, setEditing] = useState(false)

  const { setNodeRef } = useSortable({ id: `list:${list.id}` })

  const renameListMut = useMutation({
    mutationFn: (title: string) => renameList(list.id, title),
    onSuccess: invalidate,
  })
  const deleteListMut = useMutation({
    mutationFn: () => deleteList(list.id),
    onSuccess: invalidate,
  })

  return (
    <div className="w-full shrink-0 rounded-xl border border-border bg-surface-1 p-3 md:w-72">
      <div className="mb-3 flex items-center justify-between px-1">
        <EditableTitle
          value={list.title}
          onSave={(t) => renameListMut.mutate(t)}
          editing={editing}
          setEditing={setEditing}
          className="font-medium text-text"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-faint">{cards.length}</span>
          <ItemMenu onRename={() => setEditing(true)} onDelete={() => deleteListMut.mutate()} />
        </div>
      </div>

      <SortableContext
        id={`list:${list.id}`}
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="flex min-h-[8px] flex-col gap-2">
          {cards.map((card) => (
            <BoardCard key={card.id} card={card} boardId={boardId} />
          ))}
        </div>
      </SortableContext>

      <AddCard listId={list.id} boardId={boardId} />
    </div>
  )
}

function BoardCard({ card, boardId }: { card: Card; boardId: string }) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["board", boardId] })
  const [editing, setEditing] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const renameCardMut = useMutation({
    mutationFn: (title: string) => renameCard(card.id, title),
    onSuccess: invalidate,
  })
  const deleteCardMut = useMutation({
    mutationFn: () => deleteCard(card.id),
    onSuccess: invalidate,
  })

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text"
    >
      <div className="flex items-start justify-between gap-2">
        <EditableTitle
          value={card.title}
          onSave={(t) => renameCardMut.mutate(t)}
          editing={editing}
          setEditing={setEditing}
          className="min-w-0 flex-1 text-text"
        />
        {card.createdBy && (
          <p className="mt-1.5 text-xs text-text-faint">{card.createdBy.name}</p>
        )}
        <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          <ItemMenu onRename={() => setEditing(true)} onDelete={() => deleteCardMut.mutate()} />
        </div>
      </div>

    </div>
  )
}

function AddCard({ listId, boardId }: { listId: string; boardId: string }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState("")

  const mutation = useMutation({
    mutationFn: (t: string) => createCard(listId, t),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] })
      setTitle("")
      setEditing(false)
    },
  })

  const submit = () => {
    const trimmed = title.trim()
    if (trimmed) mutation.mutate(trimmed)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
      >
        + Add a card
      </button>
    )
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <input
        autoFocus
        type="text"
        placeholder="Card title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit()
          if (e.key === "Escape") {
            setEditing(false)
            setTitle("")
          }
        }}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text outline-none focus:border-accent"
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={mutation.isPending || !title.trim()}
          className="flex items-center justify-center rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-on-accent disabled:opacity-50"
        >
          {mutation.isPending ? <InlineLoader /> : "Add"}
        </button>
        <button
          onClick={() => {
            setEditing(false)
            setTitle("")
          }}
          className="rounded-lg px-3 py-1.5 text-sm text-text-muted hover:text-text"
        >
          Done
        </button>
      </div>
    </div>
  )
}

function AddList({ boardId }: { boardId: string }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState("")

  const mutation = useMutation({
    mutationFn: (t: string) => createList(boardId, t),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] })
      setTitle("")
    },
  })

  const submit = () => {
    const trimmed = title.trim()
    if (trimmed) mutation.mutate(trimmed)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="w-full shrink-0 rounded-xl border border-dashed border-border px-4 py-3 text-left text-sm text-text-muted transition-colors hover:border-accent hover:text-accent-300 md:w-72"
      >
        + Add a list
      </button>
    )
  }

  return (
    <div className="w-full shrink-0 rounded-xl border border-accent/50 bg-surface-1 p-3 md:w-72">
      <input
        autoFocus
        type="text"
        placeholder="List title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit()
          if (e.key === "Escape") {
            setEditing(false)
            setTitle("")
          }
        }}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text outline-none focus:border-accent"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={submit}
          disabled={mutation.isPending || !title.trim()}
          className="flex items-center justify-center rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-on-accent disabled:opacity-50"
        >
          {mutation.isPending ? <InlineLoader /> : "Add list"}
        </button>
        <button
          onClick={() => {
            setEditing(false)
            setTitle("")
          }}
          className="rounded-lg px-3 py-1.5 text-sm text-text-muted hover:text-text"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default BoardPage