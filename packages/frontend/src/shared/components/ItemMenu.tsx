import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MoreVertical } from "lucide-react"

interface ItemMenuProps {
  onRename?: () => void
  onDelete: () => void
}

function ItemMenu({ onRename, onDelete }: ItemMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded p-1 text-text-faint transition-colors hover:bg-surface-3 hover:text-text"
        title="Options"
      >
        <MoreVertical size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-lg border border-border bg-surface-2 shadow-[var(--shadow-lifted)]"
          >
            {onRename && (
              <button
                onClick={() => {
                  onRename()
                  setOpen(false)
                }}
                className="block w-full px-3 py-2 text-left text-sm text-text transition-colors hover:bg-surface-3"
              >
                Rename
              </button>
            )}
            <button
              onClick={() => {
                onDelete()
                setOpen(false)
              }}
              className="block w-full px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-surface-3"
            >
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ItemMenu