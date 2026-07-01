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
- Room cleanup when switching temporary identities
- Gomoku and Reversi
- Local AI opponent support

## Development

Install dependencies:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
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

## Notes

This MVP intentionally does not store user accounts. Room and game state live in
backend memory, so they reset when the backend restarts. A lightweight database
can be added later for persistent rooms and game history without adding
registration or login.
