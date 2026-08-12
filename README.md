# SyncSpace

A real-time collaborative board app (like Trello or Miro), where people can move cards on a shared board and see each other's changes live.

Work in progress. I'm building it to learn WebSockets, handling concurrent edits, and full-stack TypeScript with types shared between the client and server.


## Stack

**Backend:** Node, Express, TypeScript, Socket.io, PostgreSQL, Prisma, JWT
**Frontend:** React, TypeScript, Tailwind (not started yet)
**Shared:** a types package used by both the backend and frontend
**Tooling:** npm workspaces, Vitest, GitHub Actions

## Structure

```
syncspace/
├── packages/
│   ├── shared/     types used by both sides
│   ├── backend/    Express + Socket.io API
│   └── frontend/   React app (not started)
├── package.json
└── tsconfig.base.json
```

The shared package holds the socket events and data types, so both sides use the same definitions. If a type changes, TypeScript catches it on both the client and server.

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (I'm using [Neon](https://neon.tech), but any Postgres works)

### Setup

```bash
npm install
```

Create `packages/backend/.env`:

```
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL=<pooled Postgres connection string>
DIRECT_URL=<direct Postgres connection string>
JWT_SECRET=<a long random string>
```

Run the migration:

```bash
cd packages/backend
npx prisma migrate dev
```

### Running

```bash
npm run dev:backend      # backend on http://localhost:4000
npm run dev:frontend     # frontend (not started yet)
```

### Tests

```bash
npm run test --workspace @syncspace/backend
```