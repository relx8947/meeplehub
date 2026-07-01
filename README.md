# MeepleHub

MeepleHub is a lightweight online board-game platform for friends and family.

The current version uses temporary session identities instead of registered
accounts. Players can choose a nickname for the current browser session, create
rooms, and play supported board games online.

## Stack

- Frontend: Next.js, React, Tailwind CSS, React Query, Socket.IO client
- Backend: NestJS, Socket.IO
- Storage: in-memory room and game state for the current MVP

## Features

- Temporary player identities with editable nicknames
- Game lobby and room lobby
- Real-time lobby updates over WebSocket
- Room cleanup for identity switching, explicit leaving, surrendering, and inactive players
- Session room recovery inside the current browser session
- Gomoku and Reversi
- Local AI opponent support

## Development

Install dependencies:

```bash
npm install
npm run install:all
```

Run both services:

```bash
npm run dev
```

Or run them separately:

```bash
cd backend
npm run start:dev
```

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- WebSocket namespace: http://localhost:3001/play

## Environment

Copy example files when you need local overrides:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Common settings:

- `FRONTEND_URL`: browser origin allowed by the backend CORS/WebSocket config
- `NEXT_PUBLIC_API_URL`: browser-facing backend API URL
- `NEXT_PUBLIC_WS_URL`: browser-facing Socket.IO namespace URL
- `ROOM_INACTIVE_TIMEOUT_MS`: how long a disconnected player can stay in a live room
- `ROOM_CLEANUP_INTERVAL_MS`: how often the backend scans inactive room players

## Docker

Build and start production-style containers:

```bash
npm run docker:up
```

Follow logs:

```bash
npm run docker:logs
```

Stop containers:

```bash
npm run docker:down
```

The default Docker setup exposes the same local URLs:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- WebSocket namespace: http://localhost:3001/play

For a hosted deployment, set `FRONTEND_URL`, `NEXT_PUBLIC_API_URL`, and
`NEXT_PUBLIC_WS_URL` before building the frontend image so browser-facing URLs
point at the public host.

## Notes

This MVP intentionally does not store user accounts. Room and game state live in
backend memory, so they reset when the backend restarts. A lightweight database
can be added later for persistent rooms and game history without adding
registration or login.
