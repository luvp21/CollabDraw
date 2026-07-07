# CollabDraw
> A real-time collaborative whiteboard that lets multiple users sketch, draw, and synchronize shapes on a shared canvas in real-time.

![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-ISC-green.svg?style=flat-square)

## Overview
CollabDraw resolves the challenge of high-latency and state loss in remote brainstorming sessions by providing a persistence-first, collaborative canvas workspace. Built as a monorepo, the application leverages Next.js 15 for a dynamic user interface and a native Node.js WebSocket backend to broadcast drawings instantly across peers. Drawings are serialized and stored in a PostgreSQL database using Prisma ORM to guarantee that canvas states persist across page refreshes and server updates.

## Key Features
- **Implemented** a math-driven coordinate mapping system inside a custom HTML5 Canvas `DrawingEngine` to translate screen pointer offsets into zoom- and pan-independent world-space vectors.
- **Engineered** a real-time message router using native Node.js WebSockets (`ws`) to broadcast drawing and erasing shape events among connected clients in isolated rooms.
- **Designed** a type-safe relational schema in PostgreSQL via Prisma ORM to save serialized vector shapes persistently and link rooms to authenticated users.
- **Integrated** Google OAuth 2.0 with Passport.js and JWT session tokens, passing the token via connection query parameters to secure the stateful WebSocket handshake.
- **Structured** a monorepo setup using Turborepo and pnpm workspaces to share Zod validation schemas and TypeScript configurations across front-end and back-end packages.

## Tech Stack
| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15, React 19, Tailwind CSS, Radix UI, Framer Motion, React Hook Form |
| **Backend** | Express.js, Node.js WebSockets (`ws`), Passport.js (Google OAuth 2.0), JSON Web Tokens (JWT) |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **Development & Tooling** | Turborepo, pnpm workspaces, Zod (validation), TypeScript, Prettier |

`Tech: TypeScript, Next.js, React, Node.js, Express.js, WebSockets, ws, PostgreSQL, Prisma, Tailwind CSS, Turborepo, Zod, Radix UI, Framer Motion, Passport.js, JWT`

## Architecture
The application splits HTTP metadata operations and stateful WebSockets into isolated, concurrent processes coordinated via a shared database:

```mermaid
graph TD
    Client["🖥️ Next.js 15 Client\n(App Router / HTML5 Canvas API)"]
    HTTP["Express API Server\n(Port 3001)"]
    WS["WebSocket Server\n(Port 8080)"]
    DB[("PostgreSQL DB\n(Prisma ORM)")]
    Google["Google OAuth 2.0\n(Passport.js)"]

    Client -->|"1. HTTP / REST API"| HTTP
    Client -->|"2. WS / JSON Events"| WS
    HTTP -->|"OAuth Login"| Google
    HTTP -->|"Read/Write Metadata"| DB
    WS -->|"Save/Delete Shapes"| DB
```

## Setup & Usage

### Prerequisites
- **Node.js** >= 18
- **pnpm** >= 9.0.0 (configured as `pnpm@9.0.0`)
- **PostgreSQL** database

### 1. Install Dependencies
Run the installation command from the repository root:
```bash
pnpm install
```
This automatically triggers the database client generation defined in the project's postinstall phase.

### 2. Set Up Environment Variables
Create `.env` configuration files in the respective workspaces:

**`apps/excelidraw-frontend/.env`**
```env
NEXT_PUBLIC_HTTP_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

**`apps/http-backend/.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/collabdraw?schema=public"
JWT_SECRET="your-jwt-secret-key"
SESSION_SECRET="your-session-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

**`apps/ws-backend/.env`**
```env
JWT_SECRET="your-jwt-secret-key" # Must match HTTP backend secret
PORT=8080
```

**`packages/db/.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/collabdraw?schema=public"
```

### 3. Run Database Migrations
Create and apply tables to your database instance:
```bash
cd packages/db
pnpm migrate
```

### 4. Run Development Servers
From the root directory, start all services using Turborepo:
```bash
pnpm dev
```
Services will spawn at:
- **Frontend App**: `http://localhost:3000`
- **HTTP REST API**: `http://localhost:3001`
- **WebSocket Server**: `ws://localhost:8080`

Other scripts:
- Build all workspaces: `pnpm build`
- Lint all workspaces: `pnpm lint`
- Format code structure: `pnpm format`

## Challenges & Learnings
- **Infinite Canvas Transformations**: Managing zoom transformations and canvas panning offsets required implementing a custom coordinate mapping algorithm. Directly transforming client-space pointer event coordinates into zoom/pan-independent world-space vectors before saving, and invoking `ctx.setTransform(scale, 0, 0, scale, panX, panY)` before the render pass, was necessary to keep drawings aligned across different client dimensions and view ports.
- **Stateful Socket Connection Tracking**: Because the WebSocket backend routes canvas shape updates using room registrations, active sockets are tracked in a global array in memory. Handling reconnections and preventing client message drops highlighted the complexities of managing stateful real-time interactions in-memory.

## Future Improvements
- **Graceful WebSocket connection cleanup**: Implement close listeners on socket channels to purge closed socket records from the server memory.
- **Robust Exception Handling**: Wrap database writes and deletions inside the WebSocket message handlers in try-catch structures to prevent server runtime failure under database contention.
- **Distributed Room Pub/Sub**: Integrate Redis Pub/Sub channels to enable the WebSocket layer to scale horizontally across multiple instances.
