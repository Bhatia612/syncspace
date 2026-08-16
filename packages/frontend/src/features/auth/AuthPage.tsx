import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "./AuthContext"
import { login, signup, getMe } from "./authApi"
import { ApiRequestError } from "../../api/client"

type Mode = "login" | "signup"

function AuthPage() {
  const [mode, setMode] = useState<Mode>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { setUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      if (mode === "signup") {
        await signup({ name, email, password })
      }
      await login({ email, password })
      const { user } = await getMe()
      setUser(user)
      navigate("/")
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again."
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !submitting) handleSubmit()
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-12 md:w-[45%] lg:w-[40%] lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="display text-4xl text-text">SyncSpace</h1>
          <p className="mt-2 text-text-muted">
            {mode === "login"
              ? "Welcome back. Sign in to your boards."
              : "Create an account and start building."}
          </p>

          <div className="mt-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <label className="mb-1.5 block text-sm text-text-muted">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2.5 text-text outline-none transition focus:border-accent"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="mb-1.5 block text-sm text-text-muted">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2.5 text-text outline-none transition focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-text-muted">Password</label>
              <input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2.5 text-text outline-none transition focus:border-accent"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-danger/40 bg-danger-soft px-3 py-2">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <motion.button
              onClick={handleSubmit}
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.01 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-on-accent transition-colors hover:bg-accent-600 disabled:opacity-60"
            >
              {submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </motion.button>
          </div>

          <div className="mt-6 text-sm text-text-muted">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login")
                setError(null)
              }}
              className="text-accent underline-offset-4 transition hover:text-accent-300 hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>

      <div className="relative hidden flex-col justify-center overflow-hidden border-l border-border bg-surface-1 px-16 md:flex md:w-[55%] lg:w-[60%]">
        {/* ambient glow */}
        <div
          className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full opacity-15 blur-[100px]"
          style={{ background: "oklch(0.80 0.13 192)" }}
        />
        <div className="relative max-w-lg">
          <p className="display text-5xl leading-[1.1] text-text lg:text-6xl">
            Know what’s moving. 
            <br />
            <span className="text-accent">And what’s next.</span>
          </p>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-text-muted">
            Keep tasks organized, priorities clear, and your whole team moving forward.
          </p>
          <div className="mt-10 flex items-center gap-3 text-sm text-text-faint">
            <span className="flex h-2 w-2 rounded-full bg-accent" />
            <b>From to-do to done.</b>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage