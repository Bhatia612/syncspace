import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useAuth } from "../auth/AuthContext"
import { getBoards, createBoard, type BoardSummary } from "./boardsApi"

function BoardsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
  })

  const boards = data?.boards ?? []

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-8 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="display text-2xl text-text">SyncSpace</span>
          <span className="text-sm text-text-muted">{user?.name}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-10">
        <h1 className="display text-3xl text-text">Your boards</h1>
        <p className="mt-1 text-text-muted">Open a board or start a new one.</p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-surface-1" />
            ))
          ) : (
            <>
              {boards.map((board) => (
                <BoardCard key={board.id} board={board} onOpen={() => navigate(`/board/${board.id}`)} />
              ))}
              <NewBoardCard />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function BoardCard({ board, onOpen }: { board: BoardSummary; onOpen: () => void }) {
  return (
    <motion.button
      onClick={onOpen}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex h-32 flex-col justify-between rounded-xl border border-border bg-surface-1 p-5 text-left transition-colors hover:border-border-strong"
    >
      <span className="display text-xl text-text">{board.title}</span>
      <span className="text-xs text-text-faint">
        {board.memberCount} {board.memberCount === 1 ? "member" : "members"} · {board.role.toLowerCase()}
      </span>
    </motion.button>
  )
}

function NewBoardCard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState("")

  const mutation = useMutation({
    mutationFn: createBoard,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["boards"] })
      navigate(`/board/${res.board.id}`)
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
        className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-text-muted transition-colors hover:border-accent hover:text-accent-300"
      >
        + New board
      </button>
    )
  }

  return (
    <div className="flex h-32 flex-col justify-center gap-3 rounded-xl border border-accent/50 bg-surface-1 p-5">
      <input
        autoFocus
        type="text"
        placeholder="Board title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit()
          if (e.key === "Escape") {
            setEditing(false)
            setTitle("")
          }
        }}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-text outline-none focus:border-accent"
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={mutation.isPending || !title.trim()}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-on-accent disabled:opacity-50"
        >
          {mutation.isPending ? "Creating..." : "Create"}
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

export default BoardsPage