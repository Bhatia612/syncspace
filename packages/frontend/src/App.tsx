import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./features/auth/AuthContext"
import AuthPage from "./features/auth/AuthPage"
import BoardsPage from "./features/boards/BoardsPage"
import BoardPage from "./features/boards/BoardPage"

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
      <Route path="/" element={user ? <BoardsPage /> : <Navigate to="/login" replace />} />

      <Route
        path="/board/:boardId"
        element={user ? <BoardPage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default App