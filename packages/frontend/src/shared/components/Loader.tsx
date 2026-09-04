import { motion } from "framer-motion"

function Loader({ label }: { label?: string }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas">
            <div className="flex flex-col gap-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="h-3 w-24 rounded-md bg-surface-3"
                        animate={{
                            opacity: [0.3, 1, 0.3],
                            backgroundColor: [
                                "var(--color-surface-3)",
                                "var(--color-accent)",
                                "var(--color-surface-3)",
                            ],
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.18,
                        }}
                    />
                ))}
            </div>
            {label && <p className="text-sm text-text-muted">{label}</p>}
        </div>
    )
}

export function InlineLoader() {
    return (
        <div className="flex items-center gap-1.5 py-2">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full bg-accent"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
                />
            ))}
        </div>
    )
}

export default Loader