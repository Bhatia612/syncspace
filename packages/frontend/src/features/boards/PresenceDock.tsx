import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { PresenceUser } from "@syncspace/shared"

const AVATAR_COLORS = [
    "oklch(0.62 0.19 274)",
    "oklch(0.65 0.17 200)",
    "oklch(0.68 0.16 145)",
    "oklch(0.70 0.16 60)",
    "oklch(0.64 0.20 20)",
    "oklch(0.63 0.18 330)",
]

function colorFor(userId: string) {
    let hash = 0
    for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function PresenceDock({ users }: { users: PresenceUser[] }) {
    const [expanded, setExpanded] = useState(false)

    if (users.length === 0) return null

    return (
        <div
            className="fixed bottom-6 right-6 z-40"
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
        >
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
                className="flex items-center rounded-2xl border border-border bg-surface-2/90 p-2 shadow-[var(--shadow-lifted)] backdrop-blur-sm"
            >
                <AnimatePresence mode="wait" initial={false}>
                    {expanded ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="whitespace-nowrap"
                        >
                            <div className="flex flex-col gap-2 px-1">
                                {users.map((u) => (
                                    <div key={u.userId} className="flex items-center gap-2.5 text-sm text-text">
                                        <div
                                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-semibold text-on-accent"
                                            style={{ background: colorFor(u.userId) }}
                                        >
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        {u.name}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="stack"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="flex -space-x-2"
                        >
                            {users.slice(0, 4).map((u) => (
                                <div
                                    key={u.userId}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-2 text-xs font-semibold text-on-accent"
                                    style={{ background: colorFor(u.userId) }}
                                    title={u.name}
                                >
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {users.length > 4 && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-2 bg-surface-3 text-xs font-semibold text-text">
                                    +{users.length - 4}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

export default PresenceDock