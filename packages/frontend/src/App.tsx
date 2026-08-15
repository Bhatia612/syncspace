import type { CardMoveCommand } from "@syncspace/shared"

function App() {
  const testMove: CardMoveCommand = {
    cardId: "test",
    toListId: "list-1",
    position: "a0",
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>SyncSpace frontend</h1>
      <p>Shared types resolve: {testMove.cardId}</p>
    </div>
  )
}

export default App