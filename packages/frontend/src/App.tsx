function App() {
  return (
    <div className="min-h-screen bg-canvas p-10">
      <h1 className="display text-5xl text-text">SyncSpace</h1>
      <p className="mt-2 text-text-muted">Real-time collaborative boards.</p>

      <div className="mt-8 flex gap-4">
        <div className="rounded-lg border border-border bg-surface-1 p-5">
          <p className="text-text">Surface 1 card</p>
        </div>
        <div className="presence-glow rounded-lg border border-border bg-surface-2 p-5">
          <p className="text-text">Someone's editing</p>
          <p className="mt-1 text-sm text-accent">◍ Aria is here</p>
        </div>
      </div>

      <button className="mt-6 rounded-lg bg-accent px-4 py-2 font-medium text-on-accent">
        New board
      </button>
    </div>
  )
}

export default App