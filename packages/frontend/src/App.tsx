import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./features/auth/AuthContext"
import AuthPage from "./features/auth/AuthPage"

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-text-muted">Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route
        path="/"
        element={
          user ? (
            <div className="p-10">
              <h1 className="display text-4xl text-text">Welcome, {user.name}</h1>
              <p className="mt-2 text-text-muted">Boards coming soon.</p>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

export default App