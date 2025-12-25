# CollabDraw

A real-time collaborative drawing application that enables multiple users to draw together on a shared canvas with instant synchronization.

## Short Description

CollabDraw is a full-stack web application that provides a collaborative whiteboard experience. Users can create drawing rooms, invite others, and draw together in real-time with changes synchronized instantly across all connected clients. The application uses Google OAuth for authentication and stores all drawings persistently in a PostgreSQL database. Built as a monorepo with separate services for the frontend, HTTP API, and WebSocket server.

## Features

- **Google OAuth Authentication** - Secure sign-in with Google accounts
- **Real-time Drawing** - WebSocket-based synchronization for instant updates across all users
- **Room Management** - Create and join drawing rooms with unique names
- **Persistent Storage** - All drawings and shapes are saved to the database
- **User Dashboard** - View and manage all your created rooms
- **Responsive UI** - Modern interface built with Tailwind CSS and Radix UI components
- **Type-safe Development** - Full TypeScript implementation across frontend and backend

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **React Hook Form + Zod** - Form validation

### Backend

- **Express.js** - HTTP REST API server
- **WebSocket (ws)** - Real-time bidirectional communication
- **Passport.js** - Google OAuth authentication strategy
- **JWT** - Token-based authentication
- **Express Session** - Session management for OAuth flow

### Database & ORM

- **PostgreSQL** - Relational database
- **Prisma** - Type-safe ORM with migrations

### Infrastructure & Tooling

- **Turborepo** - Monorepo build system
- **pnpm** - Fast, disk space efficient package manager
- **TypeScript** - Shared type definitions across packages

## Project Structure

```
CollabDraw/
├── apps/
│   ├── excelidraw-frontend/    # Next.js frontend application
│   │   ├── app/                 # Next.js App Router pages
│   │   ├── components/          # React components
│   │   ├── actions/             # Server actions
│   │   ├── hooks/               # Custom React hooks
│   │   └── providers/           # Context providers
│   ├── http-backend/            # Express REST API server
│   │   └── src/
│   │       ├── index.ts         # Main server file
│   │       └── middleware.ts   # Authentication middleware
│   └── ws-backend/              # WebSocket server
│       └── src/
│           ├── index.ts         # WebSocket server
│           └── checkUser.ts     # Token verification
├── packages/
│   ├── common/                  # Shared Zod schemas and types
│   ├── db/                      # Prisma schema and client
│   │   └── prisma/
│   │       ├── schema.prisma    # Database schema
│   │       └── migrations/      # Database migrations
│   ├── ui/                      # Shared UI components
│   ├── eslint-config/           # Shared ESLint configuration
│   └── typescript-config/       # Shared TypeScript configuration
└── turbo.json                   # Turborepo configuration
```

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9.0.0 (install with `npm install -g pnpm@9.0.0`)
- **PostgreSQL** database (local or remote)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd CollabDraw
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

   This will automatically generate the Prisma client after installation.

3. **Set up environment variables**

   Create `.env` files in each directory based on the provided `.env.example` files:

   **`apps/excelidraw-frontend/.env`**

   ```env
   NEXT_PUBLIC_HTTP_URL=http://localhost:3001
   NEXT_PUBLIC_WS_URL=ws://localhost:8080
   ```

   **`apps/http-backend/.env`**

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/collabdraw?schema=public"
   JWT_SECRET="your-secret-key-change-this-in-production"
   SESSION_SECRET="your-session-secret-change-this-in-production"
   GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"
   FRONTEND_URL="http://localhost:3000"
   PORT=3001
   ```

   **`apps/ws-backend/.env`**

   ```env
   JWT_SECRET="your-secret-key-change-this-in-production"
   PORT=8080
   ```

   **`packages/db/.env`** (Required for Prisma migrations)

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/collabdraw?schema=public"
   ```

   **Important Notes:**

   - The `JWT_SECRET` must be identical in both `http-backend` and `ws-backend`
   - The `DATABASE_URL` must be identical in both `http-backend` and `packages/db`
   - You can also place `DATABASE_URL` in a root-level `.env` file

4. **Set up Google OAuth**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Navigate to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
   - Copy the Client ID and Client Secret to your `apps/http-backend/.env` file

5. **Set up the database**

   ```bash
   cd packages/db
   pnpm generate
   pnpm migrate
   ```

6. **Start the development servers**

   From the root directory:

   ```bash
   pnpm dev
   ```

   This starts all three servers:

   - Frontend: http://localhost:3000
   - HTTP Backend: http://localhost:3001
   - WebSocket Backend: ws://localhost:8080

   Or start them individually in separate terminals:

   ```bash
   # Terminal 1: Frontend
   cd apps/excelidraw-frontend && pnpm dev

   # Terminal 2: HTTP Backend
   cd apps/http-backend && pnpm dev

   # Terminal 3: WebSocket Backend
   cd apps/ws-backend && pnpm dev
   ```

## Scripts

### Root Level

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm lint` - Lint all apps
- `pnpm format` - Format code with Prettier

### Frontend (`apps/excelidraw-frontend`)

- `pnpm dev` - Start Next.js dev server with Turbopack on port 3000
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm check-types` - Type check without emitting files

### HTTP Backend (`apps/http-backend`)

- `pnpm dev` - Start with hot reload using tsx watch
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm start` - Run compiled JavaScript

### WebSocket Backend (`apps/ws-backend`)

- `pnpm dev` - Start with hot reload using tsx watch
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm start` - Run compiled JavaScript

### Database (`packages/db`)

- `pnpm generate` - Generate Prisma Client
- `pnpm migrate` - Run database migrations in development
- `pnpm migrate:deploy` - Deploy migrations in production

## Environment Variables

### Frontend (`apps/excelidraw-frontend/.env`)

- `NEXT_PUBLIC_HTTP_URL` - Base URL for the HTTP API backend
- `NEXT_PUBLIC_WS_URL` - WebSocket server URL

### HTTP Backend (`apps/http-backend/.env`)

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for signing JWT tokens
- `SESSION_SECRET` - Secret key for Express sessions
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - OAuth callback URL
- `FRONTEND_URL` - Frontend URL for CORS and redirects
- `PORT` - Server port (default: 3001)

### WebSocket Backend (`apps/ws-backend/.env`)

- `JWT_SECRET` - Secret key for verifying JWT tokens (must match HTTP backend)
- `PORT` - WebSocket server port (default: 8080)

### Database (`packages/db/.env`)

- `DATABASE_URL` - PostgreSQL connection string (required for migrations)

## Screenshots / Demo

_Screenshots and demo video will be added here._

## Future Improvements

- **User Presence Indicators** - Show who is currently active in a room
- **Drawing Tools Enhancement** - Add more drawing tools (shapes, text, colors)
- **Room Permissions** - Add public/private room settings and access control
- **Drawing History** - Undo/redo functionality and version history
- **Export Functionality** - Export drawings as images or PDFs
- **WebSocket Reconnection** - Automatic reconnection logic for dropped connections
- **Error Handling** - Improved error messages and HTTP status codes
- **Performance Optimization** - Optimize WebSocket message handling for large drawings
- **Mobile Support** - Responsive touch controls for mobile devices
- **Real-time Cursors** - Show other users' cursor positions on the canvas

---

**Note**: This is an MVP (Minimum Viable Product). Some features may be incomplete or have known limitations. The application is functional and ready for local development and testing.
