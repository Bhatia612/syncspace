import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { getBoards, createBoard, renameBoard, deleteBoard, type BoardSummary } from "./boardsApi"
import ItemMenu from "../../shared/components/ItemMenu"

function BoardsPage() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
  })

  const boards = data?.boards ?? []

  return (
    <div>
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
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["boards"] })
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(board.title)

  useEffect(() => {
    if (editing) setDraft(board.title)
  }, [editing, board.title])

  const renameMut = useMutation({
    mutationFn: (title: string) => renameBoard(board.id, title),
    onSuccess: invalidate,
  })
  const deleteMut = useMutation({
    mutationFn: () => deleteBoard(board.id),
    onSuccess: invalidate,
  })

  const saveRename = () => {
    const t = draft.trim()
    if (t && t !== board.title) renameMut.mutate(t)
    setEditing(false)
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex h-32 flex-col justify-between rounded-xl border border-border bg-surface-1 p-5 transition-colors hover:border-border-strong"
    >
      <div className="flex items-start justify-between gap-2">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveRename()
              if (e.key === "Escape") setEditing(false)
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded border border-accent bg-surface-2 px-1 text-xl text-text outline-none"
          />
        ) : (
          <button
            onClick={onOpen}
            className="display min-w-0 flex-1 truncate text-left text-xl text-text"
          >
            {board.title}
          </button>
        )}
        <div onClick={(e) => e.stopPropagation()}>
          <ItemMenu
            onRename={() => setEditing(true)}
            onDelete={() => deleteMut.mutate()}
          />
        </div>
      </div>

      <button onClick={onOpen} className="text-left text-xs text-text-faint">
        {board.memberCount} {board.memberCount === 1 ? "member" : "members"} · {board.role.toLowerCase()}
      </button>
    </motion.div>
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