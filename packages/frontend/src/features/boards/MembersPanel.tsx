import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trash2 } from "lucide-react"
import { useAuth } from "../auth/AuthContext"
import { getMembers, inviteMember, removeMember } from "./boardApi"
import { ApiRequestError } from "../../api/client"
import { InlineLoader } from "../../shared/components/Loader"

function MembersPanel({ boardId, onClose }: { boardId: string; onClose: () => void }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["members", boardId],
    queryFn: () => getMembers(boardId),
  })

  const members = data?.members ?? []
  const isOwner = members.find((m) => m.id === user?.id)?.role === "OWNER"

  const inviteMut = useMutation({
    mutationFn: (e: string) => inviteMember(boardId, e),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", boardId] })
      setEmail("")
      setError(null)
    },
    onError: (err) => {
      setError(err instanceof ApiRequestError ? err.message : "Could not invite that person.")
    },
  })

  const removeMut = useMutation({
    mutationFn: (userId: string) => removeMember(boardId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members", boardId] }),
  })

  const submit = () => {
    const trimmed = email.trim()
    if (trimmed) inviteMut.mutate(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-canvas/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative w-full max-w-md rounded-xl border border-border bg-surface-1 p-6 shadow-[var(--shadow-lifted)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display text-2xl text-text">Members</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <X size={18} />
          </button>
        </div>

        {isOwner && (
          <div className="mb-5">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Invite by email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit()
                }}
                className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text outline-none focus:border-accent"
              />
              <button
                onClick={submit}
                disabled={inviteMut.isPending || !email.trim()}
                className="flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent disabled:opacity-50"
              >
                {inviteMut.isPending ? <InlineLoader /> : "Invite"}
              </button>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-sm text-danger"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex flex-col gap-1">
          {isLoading ? (
            <div className="py-4">
              <InlineLoader />
            </div>
          ) : (
            members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-surface-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-on-accent">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-text">
                      {m.name}
                      {m.id === user?.id && <span className="text-text-faint"> (you)</span>}
                    </p>
                    <p className="text-xs text-text-faint">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-text-faint">
                    {m.role.toLowerCase()}
                  </span>
                  {isOwner && m.role !== "OWNER" && (
                    <button
                      onClick={() => removeMut.mutate(m.id)}
                      className="rounded p-1 text-text-faint transition-colors hover:bg-surface-3 hover:text-danger"
                      title="Remove member"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default MembersPanel