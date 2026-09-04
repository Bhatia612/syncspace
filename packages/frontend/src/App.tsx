import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./features/auth/AuthContext"
import AuthPage from "./features/auth/AuthPage"
import BoardsPage from "./features/boards/BoardsPage"
import BoardPage from "./features/boards/BoardPage"
import AppLayout from "./shared/components/AppLayout"
import Loader from "./shared/components/Loader"

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <Loader />
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route
        path="/"
        element={
          user ? (
            <AppLayout>
              <BoardsPage />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/board/:boardId"
        element={
          user ? (
            <AppLayout>
              <BoardPage />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

export default App