import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getMe, type User } from "./authApi"
import { connectSocket, disconnectSocket } from "../../socket/socket"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Connect the socket when logged in, disconnect when logged out.
  useEffect(() => {
    if (user) {
      connectSocket()
    } else {
      disconnectSocket()
    }
  }, [user])

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}