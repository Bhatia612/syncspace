import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import type { Card, List } from "@syncspace/shared"
import { getBoardSnapshot } from "./boardApi"

function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoardSnapshot(boardId!),
    enabled: !!boardId,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-text-muted">Loading board...</p>
      </div>
    )
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              ← Boards
            </button>
            <span className="display text-2xl text-text">{board.title}</span>
          </div>
        </div>
      </header>

      <main className="overflow-x-auto p-8">
        <div className="flex items-start gap-4">
          {lists.map((list) => (
            <BoardList key={list.id} list={list} cards={cardsByList(list.id)} />
          ))}
          {lists.length === 0 && (
            <p className="text-text-muted">This board has no lists yet.</p>
          )}
        </div>
      </main>
    </div>
  )
}

function BoardList({ list, cards }: { list: List; cards: Card[] }) {
  return (
    <div className="w-72 shrink-0 rounded-xl border border-border bg-surface-1 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="select-none font-medium text-text">{list.title}</span>
        <span className="text-xs text-text-faint">{cards.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {cards.map((card) => (
          <BoardCard key={card.id} card={card} />
        ))}
        {cards.length === 0 && (
          <p className="select-none px-1 py-2 text-sm text-text-faint">No cards</p>
        )}
      </div>
    </div>
  )
}

function BoardCard({ card }: { card: Card }) {
  return (
    <motion.div
      role="button"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="select-none rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text"
    >
      {card.title}
    </motion.div>
  )
}

export default BoardPage