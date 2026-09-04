import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import type { Card, List } from "@syncspace/shared"
import {
  getBoardSnapshot,
  createList,
  createCard,
  renameCard,
  deleteCard,
  renameList,
  deleteList,
  renameBoard,
  deleteBoard,
} from "./boardApi"
import Loader, { InlineLoader } from "../../shared/components/Loader"

function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoardSnapshot(boardId!),
    enabled: !!boardId,
  })

  const renameBoardMut = useMutation({
    mutationFn: (title: string) => renameBoard(boardId!, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["board", boardId] }),
  })

  const deleteBoardMut = useMutation({
    mutationFn: () => deleteBoard(boardId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] })
      navigate("/")
    },
  })

  if (isLoading) {
    return <Loader label="Loading board" />
  }

  if (isError || !data) {
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

  const board = data.board

  const cardsByList = (listId: string): Card[] =>
    board.cards
      .filter((c) => c.listId === listId)
      .sort((a, b) => (a.position < b.position ? -1 : 1))

  const lists = [...board.lists].sort((a, b) => (a.position < b.position ? -1 : 1))

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-8 py-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-text-muted transition-colors hover:text-text"
          >
            ← Boards
          </button>
          <EditableTitle
            value={board.title}
            onSave={(t) => renameBoardMut.mutate(t)}
            className="display text-2xl text-text"
          />
          <button
            onClick={() => deleteBoardMut.mutate()}
            className="ml-auto text-sm text-text-faint transition-colors hover:text-danger"
          >
            Delete board
          </button>
        </div>
      </header>

      <main className="overflow-x-auto p-8">
        <div className="flex items-start gap-4">
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
    </div>
  )
}

function EditableTitle({
  value,
  onSave,
  className = "",
}: {
  value: string
  onSave: (title: string) => void
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

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
          if (e.key === "Escape") {
            setDraft(value)
            setEditing(false)
          }
        }}
        className={`rounded border border-accent bg-surface-2 px-1 outline-none ${className}`}
      />
    )
  }

  return (
    <span
      onDoubleClick={() => {
        setDraft(value)
        setEditing(true)
      }}
      className={`cursor-text select-none ${className}`}
      title="Double-click to rename"
    >
      {value}
    </span>
  )
}

function BoardList({
  list,
  cards,
  boardId,
}: {
  list: List
  cards: Card[]
  boardId: string
}) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["board", boardId] })

  const renameListMut = useMutation({
    mutationFn: (title: string) => renameList(list.id, title),
    onSuccess: invalidate,
  })
  const deleteListMut = useMutation({
    mutationFn: () => deleteList(list.id),
    onSuccess: invalidate,
  })

  return (
    <div className="group/list w-72 shrink-0 rounded-xl border border-border bg-surface-1 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <EditableTitle
          value={list.title}
          onSave={(t) => renameListMut.mutate(t)}
          className="font-medium text-text"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-faint">{cards.length}</span>
          <button
            onClick={() => deleteListMut.mutate()}
            className="text-text-faint opacity-0 transition group-hover/list:opacity-100 hover:text-danger"
            title="Delete list"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {cards.map((card) => (
          <BoardCard key={card.id} card={card} boardId={boardId} />
        ))}
      </div>
      <AddCard listId={list.id} boardId={boardId} />
    </div>
  )
}

function BoardCard({ card, boardId }: { card: Card; boardId: string }) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["board", boardId] })

  const renameCardMut = useMutation({
    mutationFn: (title: string) => renameCard(card.id, title),
    onSuccess: invalidate,
  })
  const deleteCardMut = useMutation({
    mutationFn: () => deleteCard(card.id),
    onSuccess: invalidate,
  })

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group/card flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text"
    >
      <EditableTitle
        value={card.title}
        onSave={(t) => renameCardMut.mutate(t)}
        className="text-text"
      />
      <button
        onClick={() => deleteCardMut.mutate()}
        className="ml-2 text-text-faint opacity-0 transition group-hover/card:opacity-100 hover:text-danger"
        title="Delete card"
      >
        ✕
      </button>
    </motion.div>
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
        className="w-72 shrink-0 rounded-xl border border-dashed border-border px-4 py-3 text-left text-sm text-text-muted transition-colors hover:border-accent hover:text-accent-300"
      >
        + Add a list
      </button>
    )
  }

  return (
    <div className="w-72 shrink-0 rounded-xl border border-accent/50 bg-surface-1 p-3">
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