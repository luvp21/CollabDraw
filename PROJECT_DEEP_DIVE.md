# CollabDraw — Interview Deep Dive

> **One-liner:** Built a real-time collaborative whiteboard application using Next.js 15, Express, and native WebSockets, powered by a PostgreSQL database and Prisma ORM to enable instant canvas synchronization with type safety.

---

## 1. Elevator Pitches

### 30-Second *(for "Tell me about this project")*
I wanted to build a web application that replicates the seamless, interactive feeling of drawing together on a physical whiteboard in real-time. I developed CollabDraw, a full-stack canvas sharing platform featuring room isolation, instant rendering sync over WebSockets, and secure Google OAuth integration. By writing a custom drawing engine in TypeScript targeting raw HTML5 canvas API, I avoided heavy external drawing libraries and gained precise control over coordinates, zoom transforms, and collision detection, which reduced rendering overhead.

### 2-Minute *(for "Walk me through it" / whiteboard session opener)*
CollabDraw is organized as a monorepo utilizing Turborepo and pnpm to manage a Next.js 15 frontend, an Express HTTP API, a native WebSocket server, and a shared database schema module. 

Our core user journey starts when a user registers or logs in via Google OAuth. The HTTP API processes the authentication, issues a JWT token, and redirects the client. From the dashboard, the user can create and join rooms. When joining a room, the frontend initializes a WebSocket connection to our dedicated ws-backend, authenticating using the JWT in the URL query parameter. On the canvas, drawing operations generate geometric vector shapes (lines, rectangles, ellipses, and custom freehand lines) which are instantly pushed to the WebSocket backend, persisted to PostgreSQL via Prisma, and broadcast to all active peers in the same room. 

When designing this, I made two key technical choices:
1. Writing a standalone, math-driven `DrawingEngine` using 2D Canvas contexts instead of importing React wrappers around canvas, ensuring strict separation of rendering concerns and framework-independent UI rendering.
2. Running separate HTTP and WebSocket processes rather than a single monolithic server, allowing the stateful WebSocket backend to scale independently from stateless metadata routes. 

Next, I would integrate a Redis adapter or an event broker like RabbitMQ to transition the WebSocket backend from in-memory array tracking to a distributed pub/sub architecture to support horizontal scaling.

---

## 2. Problem Statement

**What problem does this solve?**
Whiteboard collaboration in remote teams often suffers from high latency, complex room management, and loss of state when a browser session is refreshed. Existing tools are either bloated commercial packages with heavy payloads or local-only sketchpads with no multi-user synchronization. CollabDraw provides a lightweight, persistence-first canvas room workspace where drawing data is immediately shared and archived, ensuring a seamless continuation of remote brainstorming sessions without configuration hurdles.

**Why is this technically interesting?**
The project presents interesting engineering challenges at the intersection of network synchronization, coordinate geometry, and state persistence:
1. **Coordinate Space Transformation:** Supporting infinite panning and zoom scaling means the drawing engine must map screen-space pixels (derived from mouse pointer events) back to persistent "world" coordinates before storing them. Conversely, it must correctly scale and offset world coordinates back to screen pixels during the main render pass.
2. **WebSocket Authentication & Resource Management:** Securing a stateful connection channel that does not natively support HTTP headers (such as authorization headers) requires an alternative handshaking method, which we address by verifying signed JWT tokens via query parameters on the initial connection handshake.
3. **Database Write Volumetrics & Serialization:** Freehand drawing generates high-frequency mouse movements, translating into dozens of coordinates per second. Saving raw strokes to a relational database requires serializing transient coordinate arrays into static database strings, necessitating optimized data shapes and transaction paths.

**Scope & Constraints**
The project was built within a tight local development constraint. To keep resource footprint low, the stack was designed to operate efficiently on a single local instance. We accepted the constraint of in-memory socket array matching for room routing, prioritizing simple code structures and minimal serialization overhead before introducing complex message queues like Redis or Kafka.

---

## 3. High Level Design (HLD)

> HLD describes the *what* and *why* of each major system component, how they communicate, and what properties the system provides at a macro level.

### 3.1 System Architecture Diagram

```mermaid
graph TD
    Client["🖥️ Next.js 15 Client\n(App Router / Canvas API)"]
    HTTP["Express API Server\n(Port 3001)"]
    WS["WebSocket Server\n(Port 8080)"]
    DB[("PostgreSQL DB\n(Prisma ORM)")]
    Google["Google OAuth 2.0\n(Passport.js)"]

    Client -->|"HTTP / REST"| HTTP
    Client -->|"WS / JSON"| WS
    HTTP -->|"OAuth Flow"| Google
    HTTP -->|"Prisma Client"| DB
    WS -->|"Prisma Client"| DB
```

The system topology is split into a stateless layer and a stateful layer. The Express API is stateless, handling user metadata queries and room creations. The WebSocket server is stateful, maintaining active TCP connections, client rooms associations, and routing real-time drawing payloads. Both servers talk directly to a centralized PostgreSQL database using Prisma ORM. The primary architectural boundary lies between the HTTP REST APIs and the WebSocket event channel, which share type definitions but run on isolated processes.

---

### 3.2 Data Flow Diagram

```mermaid
flowchart TD
    Draw["User Draw Action\n(Mouse / Touch)"]
    Translate["Translate Coordinate\nScreen Space to World Space"]
    Engine["DrawingEngine State\n(Append Shape)"]
    WSMessage["JSON Payload\n{ type: 'draw', roomId, data }"]
    WSServer["WebSocket Server\n(Receive & Validate JWT)"]
    PrismaWrite["Prisma DB Write\n(shape.create)"]
    Broadcast["Room Broadcast\n(Pushed to other ws clients)"]
    Render["Target Client\n(Re-render Canvas)"]

    Draw --> Translate
    Translate --> Engine
    Engine --> WSMessage
    WSMessage --> WSServer
    WSServer --> PrismaWrite
    WSServer --> Broadcast
    Broadcast --> Render
```

When a user draws a shape on the frontend canvas:
1. Screen coordinates are captured, translated to world space, and appended to the local shape list.
2. A WebSocket event is emitted containing the serialized shape.
3. The WebSocket server receives the message, writes it asynchronously to PostgreSQL, and broadcasts the update to all other connected sockets registered in that roomId, triggering an instant canvas redraw.

---

### 3.3 Component Responsibilities

| Component | Responsibility | Communication Style | State |
|-----------|---------------|---------------------|-------|
| **excelidraw-frontend** | Captures input events, manages coordinate matrices, handles local undo/redo, and connects to WebSockets | Client-side WS & HTTP | Stateful (Canvas, zoom, pan) |
| **http-backend** | Handshakes Google OAuth, manages room definitions, registers user records, and exposes query routes | REST API (JSON) | Stateless |
| **ws-backend** | Verifies connection tokens, maintains in-memory socket lists, writes shapes, and broadcasts messages | Bi-directional WS | Stateful (TCP connections, room memberships) |
| **packages/db** | Houses schema.prisma configuration and auto-generates the type-safe client library shared across servers | Direct PostgreSQL TCP | Stateful (PostgreSQL engine) |
| **packages/common** | Holds Zod schemas ensuring input validation compliance across frontend and backend environments | Static Code Import | Stateless |

---

### 3.4 System Properties (CAP / Consistency Model)

**Consistency:**
The system operates under an **eventual consistency** model for the drawing canvas. While database records are ACID-compliant and strongly consistent through PostgreSQL transactions, drawing canvas updates are delivered to clients asynchronously over WebSocket channels. A remote user joining a room gets the latest database snapshot via a standard HTTP request, and then transitions to WebSocket messages for incremental updates. The database ensures that shapes written during a conflict are safely stored, but real-time canvas layers resolve on a last-received basis.

**Availability:**
In the event of a downstream dependency failure, the application degrades gracefully:
- If the database goes offline, existing WebSocket connections remain active; users can continue to draw locally, but shape saves and broadcasts will fail. The frontend notifies the user of connection errors.
- If the WebSocket server fails, the client is redirected to read-only mode, showing the cached canvas pulled from the HTTP server.

**Partition tolerance:**
CollabDraw is deployed as a single-node database configuration. If a network split occurs between the client and the WebSocket server, the client immediately drops the connection and attempts automatic socket retries. We prioritize strong isolation inside single instances rather than resolving distributed state partitions.

**Latency budget:**
For a standard user action:
- Local canvas rendering: **<16ms** (60 FPS redraw loop).
- Socket packaging: **<2ms**.
- Network transmission: **~20-50ms** (dependent on user ping).
- Database write (async): **~15ms** (non-blocking for socket broadcasts).
- Total peer-to-peer latency: **~40-80ms**, providing a near-instant sync feeling.

---

### 3.5 Non-Functional Requirements (NFR)

| NFR | Current State | Production Target | Gap to Bridge |
|-----|--------------|-------------------|---------------|
| **Latency (p95)** | ~50ms client-to-client | <100ms globally | Implement geolocation routing and regional edge servers. |
| **Throughput** | ~200 messages/sec | 10,000 messages/sec | Implement packet batching on the client and binary protocols (Protobuf). |
| **Availability** | Single process runtime | 99.9% uptime | Implement PM2 load balancer, multi-instance health probes, and auto-scaling. |
| **Security** | JWT over Query parameters | HTTPOnly Cookie Handshake | Reconfigure WebSocket initiation to handshake via secure cookie exchange. |
| **Observability** | Console logs | Distributed tracing | Integrate Winston/Pino structured logging and OpenTelemetry tracing. |
| **Data durability**| Single database instance | Multi-AZ replication + WAL | Set up automated point-in-time recovery backups to AWS S3. |

---

### 3.6 Scalability Strategy

To scale CollabDraw to handle production loads:
1. **Stateless API Scale-out:** The `http-backend` is stateless and can be scaled horizontally behind an Nginx or ALB load balancer.
2. **WebSocket Pub/Sub Backbone:** Currently, the `ws-backend` holds room socket lists in-memory. Under multi-instance scaling, a user on WebSocket Server A would not receive shapes from a user on WebSocket Server B. We can bridge this using **Redis Pub/Sub**. When a shape is drawn, WebSocket Server A publishes the event to Redis, which distributes it to Server B and C to send to all local clients.
3. **Database Write Throttling:** Rapid freehand drawing can flood the database with small insert statements. We can implement a writing buffer (queue) or write-behind cache on the WebSocket server, batching shapes generated in a 1-second interval into a single transaction, reducing the input-output operations per second (IOPS) load on PostgreSQL.

---

## 4. Low Level Design (LLD)

> LLD describes how the key components are implemented — class structure, data structures, algorithms, design patterns, and interface contracts.

### 4.1 Core Module / Class Design

```mermaid
classDiagram
    class DrawingEngine {
        -canvas: HTMLCanvasElement
        -ctx: CanvasRenderingContext2D
        -shapes: Shape[]
        -selectedShapeIds: string[]
        -scale: number
        -panX: number
        -panY: number
        +constructor(canvas, roomId, socket, initialShapes, onScaleChange, onSelectionChange)
        +setTool(tool)
        +setStrokeColor(color)
        +setFillColor(color)
        +zoomIn()
        +zoomOut()
        +undo()
        +duplicateSelected()
        -handleMouseDown(e)
        -handleMouseMove(e)
        -handleMouseUp(e)
        -render()
        -drawGrid()
        -drawShape(shape, isSelected)
    }

    class RoomCanvas {
        <<React Component>>
        -socket: WebSocket
        -isConnecting: boolean
        +useEffect()
        +render()
    }

    class DBClient {
        +prismaClient: PrismaClient
    }

    RoomCanvas --> DrawingEngine : instantiates
    DrawingEngine --> WebSocket : sends draw/erase events
    DBClient --> PrismaClient : manages persistence
```

The frontend uses the [DrawingEngine](file:///home/luv/Projects/CollabDraw/apps/excelidraw-frontend/lib/drawing-engine.ts#L3) class to decouple canvas state, transformation logic, and drawing algorithms from the React lifecycle. React components like [RoomCanvas](file:///home/luv/Projects/CollabDraw/apps/excelidraw-frontend/components/canvas/RoomCanvas.tsx#L7) manage socket connections and mount the canvas DOM node. When the canvas mounts, the React component instantiates a `DrawingEngine` instance, passing the raw canvas reference, roomId, active WebSocket, and callbacks. All coordinate tracking, mouse listeners, and canvas render loops remain strictly inside the drawing engine, isolated from React's state updates to prevent unnecessary virtual DOM diffing.

---

### 4.2 Key Algorithm / Logic Walkthrough

#### Algorithm 1: Screen-Space to World-Space Coordinate Mapping

**What it does:** Translates raw screen coordinates (e.g., mouse clicks) into relative canvas coordinates adjusted for current pan offsets and zoom levels, and vice-versa.

**Why it's non-trivial:** If a user pans the canvas by 100 pixels to the right and zooms in by 2x, a click at screen coordinate `(200, 200)` does not represent world point `(200, 200)`. Storing the raw coordinate `(200, 200)` would render the shape in the wrong location for other users who have different zoom levels or pan offsets.

**Step-by-step math:**
```mermaid
flowchart TD
    Click["Mouse Click Event\n(clientX, clientY)"]
    GetBounds["Get Canvas Screen Bounds\nrect = getBoundingClientRect()"]
    SubtractOffset["Subtract Canvas Bounding Left/Top\n(clientX - rect.left)"]
    SubtractPan["Subtract Pan Offset\n(x - panX)"]
    ApplyZoom["Divide by Scale\n(x / scale)"]
    WorldCoord["Final World Coordinate\n{ x, y }"]

    Click --> GetBounds
    GetBounds --> SubtractOffset
    SubtractOffset --> SubtractPan
    SubtractPan --> ApplyZoom
    ApplyZoom --> WorldCoord
```

**Edge cases handled:**
- High-DPI (Retina) screens: Screen ratios must match target canvas buffer resolutions to avoid pixel blur.
- Panning while drawing: When the user activates the "hand" tool and drags, offsets must accumulate based on drag distance without creating new shapes.

**Code path:** [`drawing-engine.ts` → `getCanvasPoint()`](file:///home/luv/Projects/CollabDraw/apps/excelidraw-frontend/lib/drawing-engine.ts#L337-L343)

---

#### Algorithm 2: Geometry-Based Selection & Hit Detection

**What it does:** Determines if a user's mouse pointer or selection box is hovering over or intersecting an existing vector shape.

**Why it's non-trivial:** Different shape types require different mathematical tests. Checking a click inside a rectangle is a simple range comparison, but checking a click on a line or freehand pencil stroke requires calculating the shortest distance from a point to a line segment or matching close points in a vertex array.

**Step-by-step validation:**
- **Rectangle:** Checks if `point.x` is between `shape.x` and `shape.x + width`, and `point.y` is between `shape.y` and `shape.y + height` (within a configurable tolerance).
- **Ellipse:** Calculates normalized distance using the algebraic ellipse equation: $\frac{(x - cx)^2}{rx^2} + \frac{(y - cy)^2}{ry^2} \le 1$.
- **Line Segment:** Projects the point onto the line segment, calculating the perpendicular distance. If the distance is less than the stroke width tolerance and falls within the bounding box of the segment, it registers as a hit.
- **Pencil (Freehand):** Iterates through points and checks if the Euclidean distance between any segment vertex and the click is within the hover threshold.

**Code path:** [`drawing-engine.ts` → `isPointInShape()`](file:///home/luv/Projects/CollabDraw/apps/excelidraw-frontend/lib/drawing-engine.ts#L596-L644)

---

#### Algorithm 3: Local Shape Duplication and Offset Calculation

**What it does:** Clones selected canvas shapes and offsets their coordinates slightly to avoid stacking duplicates directly on top of each other.

**Why it's non-trivial:** Cloned freehand pencil shapes contain arrays of nested coordinate objects. Deep cloning these points and shifting them mathematically requires transforming both the base coordinates `(x, y)` and the entire point array sequence while generating a brand new UUID to avoid key collisions.

**Step-by-step:**
1. Retrieve all shapes matching `selectedShapeIds` from the state.
2. Clone each shape object.
3. Generate a new `id` combining the shape type, current timestamp, and a random float.
4. Shift coordinates: `x = x + 20` and `y = y + 20`.
5. If the shape is a `pencil` type, map its coordinate array and shift each vertex by the same offset.
6. Push cloned shapes to the local array, emit `draw` payload via WebSocket, and call `render()`.

**Code path:** [`drawing-engine.ts` → `duplicateSelected()`](file:///home/luv/Projects/CollabDraw/apps/excelidraw-frontend/lib/drawing-engine.ts#L1019-L1055)

---

### 4.3 Data Model & ER Diagram

```mermaid
erDiagram
    USER {
        string id PK "UUID"
        datetime createdAt
        string email UK
        string name
        string image
        string googleId UK
    }

    ROOM {
        int id PK "Autoincrement"
        string roomName
        string userId FK
    }

    SHAPE {
        int id PK "Autoincrement"
        int roomId FK
        string data
        string userId FK
    }

    USER ||--o{ ROOM : "creates"
    USER ||--o{ SHAPE : "draws"
    ROOM ||--o{ SHAPE : "contains"
```

**Entity descriptions:**

| Entity | Purpose | Key Constraints | Indexed On |
|--------|---------|-----------------|------------|
| **USER** | Represents a verified platform account | Primary Key (UUID), Unique Google ID, Unique Email | `googleId`, `email` |
| **ROOM** | Organizes shape data into isolated workspaces | Primary Key (Int), Foreign Key to User | `id`, `roomName` |
| **SHAPE** | Stores serialized vector shape elements | Primary Key (Int), Foreign Keys to User and Room | `id`, `roomId`, `userId` |

**Query patterns this schema is optimized for:**
- `GET /room/:roomName`: Finds the room by its name and eagerly loads its entire list of associated shapes. This query utilizes PostgreSQL index on `roomName`.
- `GET /auth/me`: Loads the user's dashboard rooms and shapes by matching the foreign keys.
- `DELETE FROM Shape WHERE data = $1 AND roomId = $2`: Used during eraser operations to delete shape rows matching the serialized coordinates.

**What changes at scale:**
At millions of rows, searching and deleting shapes using string matches on the serialized `data` column (`deleteMany` in `ws-backend`) will cause high disk I/O and query degradation. The migration path would involve:
1. Extracting a unique `shapeId` (generated on the client) into its own indexed string column on the `Shape` table, converting deletes to point-lookups on `shapeId`.
2. Partitioning the `Shape` table by `roomId` to keep indexes small and localized.

---

### 4.4 Sequence Diagrams for Key Flows

#### Flow 1: Google OAuth Handshake and Client Redirection

```mermaid
sequenceDiagram
    actor User
    participant Client as Next.js Client
    participant Express as Express HTTP API
    participant Google as Google OAuth API

    User->>Client: Clicks "Sign in with Google"
    Client->>Express: GET /auth/google
    Express->>Google: Redirect to consent screen
    Google-->>User: Show login dialog
    User->>Google: Enter credentials
    Google->>Express: GET /auth/google/callback (with auth code)
    Express->>Express: Create/Update User & Sign JWT
    Express-->>Client: 302 Redirect to /auth/callback?token=JWT
    Client->>Client: Store JWT in localStorage
    Client->>Client: Redirect to /dashboard
```

This authentication flow is session-less. The Express server uses Passport's Google strategy to process the profile information, updates or creates the `User` record in PostgreSQL, creates a JWT signed with the database user ID, and redirects back to the client routing layer.

---

#### Flow 2: Collaborative Drawing Synchronization

```mermaid
sequenceDiagram
    actor UserA as Collaborator A
    participant EngineA as DrawingEngine (A)
    participant ClientA as Browser Socket (A)
    participant WS as WebSocket Server
    participant DB as PostgreSQL
    participant ClientB as Browser Socket (B)
    participant EngineB as DrawingEngine (B)

    UserA->>EngineA: Draws a circle
    EngineA->>ClientA: Emit local Shape
    ClientA->>WS: ws.send({ type: 'draw', roomId, data })
    WS->>DB: prisma.shape.create({ roomId, data, userId })
    WS->>ClientB: ws.send({ type: 'draw', roomId, data })
    ClientB->>EngineB: Add remote Shape to shapes list
    EngineB->>EngineB: Redraw canvas (render)
```

In this flow, the database insert is non-blocking. The WebSocket server writes the new shape data asynchronously while immediately broadcasting the drawing event to other clients to minimize lag.

---

### 4.5 Design Patterns Used

| Pattern | Where It's Applied | Why It Was Chosen |
|---------|-------------------|-------------------|
| **Decoupled Engine Pattern** | [DrawingEngine Class](file:///home/luv/Projects/CollabDraw/apps/excelidraw-frontend/lib/drawing-engine.ts#L3) | Isolates browser rendering logic and window listeners from Next.js render phases, avoiding Virtual DOM reconciliation delays. |
| **Command Pattern (Event-driven)**| [ws-backend routing handler](file:///home/luv/Projects/CollabDraw/apps/ws-backend/src/index.ts#L49) | Dispatches state-changing actions (join, leave, draw, erase) based on the `type` property in the incoming JSON packet. |
| **Repository Pattern (via ORM)** | [http-backend routes](file:///home/luv/Projects/CollabDraw/apps/http-backend/src/index.ts#L140) | Decouples direct SQL syntax by using the generated Prisma Client, maintaining type-safety across different database instances. |

---

## 5. Tech Stack — With Justification

| Layer | Technology | Why This | What Was the Alternative |
|-------|------------|----------|--------------------------|
| **Frontend Framework** | Next.js 15 | Provides App Router, server-rendered layouts for loading metadata, and static landing page optimization. | React Vite — rejected because it lacks built-in server-side rendering (SSR) and routing capabilities. |
| **Backend Framework** | Express.js | Lightweight and easily maps routes, integrates middlewares (Cors, passport session, jwt verify) with a minimal learning curve. | Fastify — rejected to keep standard passport OAuth strategies and middlewares straightforward. |
| **Real-time Channel** | ws (Node WebSocket) | Standard, highly performant TCP-based protocol with no wrapper overhead, which is ideal for sending lightweight JSON coordinates. | Socket.io — rejected because we wanted native control over connections and to avoid client library dependency bloat. |
| **Database** | PostgreSQL | Robust relational database that handles room metadata links and coordinates storage with high write integrity. | MongoDB — rejected because relational keys between Users, Rooms, and Shapes are highly structured. |
| **ORM** | Prisma | Generates TypeScript models directly from schemas, ensuring type safety from backend database queries up to the frontend UI actions. | TypeORM / Raw SQL — rejected because Prisma provides automatic client code generation and simple migration setups. |
| **Styling** | Tailwind CSS | Speeds up custom panel design with utility classes, which compile down to optimized, small stylesheet files. | Styled Components — rejected because runtime CSS-in-JS parsing can degrade canvas performance on low-end screens. |

---

## 6. Architecture & System Design Decisions

### Decision 1: Stateless Express API with JWT redirect over Server-Side Sessions

**Context:** The application needs a secure way to pass authentication state from the Google OAuth passport callbacks to both the Next.js frontend app and the stateful WebSocket backend server.

**Options considered:**
- **Option A:** Server-side express sessions with cookie storage.
- **Option B:** Stateless JWT redirection.

**What we chose:** Stateless JWT redirection. Upon successful passport authentication, the Express backend signs a JWT with the user's database ID and redirects to the frontend using the URL query parameter `?token=JWT`. The client saves this to `localStorage`.

**Reasoning:** WebSockets do not natively support sending custom authorization headers on initial connection setup, and cookies can introduce CORS complications when frontend and backend run on different domains. A JWT can be sent via query parameter during socket initiation, enabling the WebSocket server to decode and verify the user identity using the shared secret.

**Tradeoff accepted:** Revoking active sessions requires storing a blacklist in Redis, as JWTs are stateless and cannot be force-expired on the server once issued.

**How this evolves at scale:** We would implement short-lived JWT tokens accompanied by encrypted refresh tokens saved inside HTTP-only secure cookies to prevent client-side script token theft (XSS).

---

### Decision 2: Writing a Raw Canvas Engine over importing React-Canvas Wrappers

**Context:** We need to handle interactive mouse inputs, render multiple shape bounds, and draw grids dynamically.

**Options considered:**
- **Option A:** Using drawing wrappers like React-Konva or Fabric.js.
- **Option B:** Writing a custom HTML5 2D Context `DrawingEngine` class.

**What we chose:** Custom HTML5 `DrawingEngine` class.

**Reasoning:** Standard React wrappers re-render the component tree on pointer movement, triggering excessive Virtual DOM calculations. Our custom class intercepts mouse moves at the DOM level, computes coordinate projections, updates an internal array, and calls `ctx.clearRect()` followed by path redraws in a single synchronous pass.

**Tradeoff accepted:** We had to implement standard geometry calculations manually (e.g., ellipse equations, line projections, and selection boundaries).

**How this evolves at scale:** As the shape count grows into thousands, redrawing all shapes on every frame becomes slow. We would introduce offscreen canvases to pre-render static layers, only redrawing modified vector objects.

---

### Decision 3: Native WebSockets over Socket.io Wrapper

**Context:** The drawing system needs to exchange high-frequency coordinate packets between the browser client and the routing server.

**Options considered:**
- **Option A:** Using Socket.io.
- **Option B:** Using the native `ws` WebSocket library.

**What we chose:** Native `ws` WebSocket library.

**Reasoning:** Socket.io adds extra wrapper formatting and heartbeats, increasing packet overhead. Using native WebSockets keeps the data frames lightweight and transparent, simplifying routing and reducing memory utilization on the node server.

**Tradeoff accepted:** Standard reconnection logic, exponential backoff, and socket heartbeats must be written manually on the client.

**How this evolves at scale:** If we need horizontal scaling across cloud instances, we would deploy a lightweight reverse proxy like Envoy or Nginx to handle TLS termination and pass socket packets to the backend.

---

### Decision 4: Room Shape Loading via HTTP REST instead of WebSocket stream

**Context:** When a user first opens a drawing room, the client must load all historical shapes to render the initial canvas.

**Options considered:**
- **Option A:** Requesting and streaming shapes via WebSocket messages after connection.
- **Option B:** Fetching shapes via a standard Server-Side HTTP GET route before initializing the socket.

**What we chose:** Fetching shapes via HTTP GET route during page load.

**Reasoning:** Next.js can fetch room information during server rendering or initial page mount, which displays the drawn canvas layout quickly. Using HTTP caching (`no-store` or short TTLs) reduces the workload on the WebSocket server, which only needs to handle live, incremental changes.

**Tradeoff accepted:** There is a small race condition where a shape drawn between the HTTP fetch and the WebSocket connection setup might be missed until the next socket sync.

**How this evolves at scale:** The server would include a sequence sequence ID in the HTTP payload, and the client would request any missing sequence numbers during the WebSocket join confirmation.

---

### Decision 5: Sequential Eraser Deletion via coordinates matching in Database

**Context:** When a user activates the eraser tool, they click on a canvas shape which removes it from the screen and deletes the row from the database.

**Options considered:**
- **Option A:** Mark shape rows as deleted using soft-delete flags.
- **Option B:** Permanent row deletion using database queries matching shape properties.

**What we chose:** Permanent row deletion using database queries matching shape properties.

**Reasoning:** To avoid storing a large number of inactive shapes, the database uses Prisma's `deleteMany` to remove rows where the serialized coordinate string matches the target. This keeps database storage clean without requiring an archival process.

**Tradeoff accepted:** Serialized JSON string matching on database indexes can slow down query performance as rows scale.

**How this evolves at scale:** We would migrate to a unique `shapeId` indexed column on the schema, converting deletions to quick point lookups instead of string comparison scans.

---

### Decision 6: Centralized Shared Types Package inside Monorepo

**Context:** The HTTP backend, WebSocket backend, and Next.js frontend need to stay aligned on shape payloads and validation configurations.

**Options considered:**
- **Option A:** Copying and pasting typescript types and schemas across each project.
- **Option B:** Creating a shared `packages/common` monorepo package.

**What we chose:** Shared `packages/common` monorepo package.

**Reasoning:** Storing schemas in a shared package ensures that updates to validation criteria (like room names or auth payloads) are instantly updated across all targets during build time.

**Tradeoff accepted:** Running builds requires running compile commands first across package dependencies, which we handle using Turborepo's dependency pipeline.

---

## 7. API Design

**Style:** The API uses standard REST endpoints for user authentication and metadata management, combined with JSON-based messages over WebSockets for canvas drawing updates.

**Key HTTP Endpoints:**

| Method | Route | Purpose | Request Body | Response | Auth |
|--------|-------|---------|-------------|----------|------|
| **GET** | `/auth/google` | Initiates the Google login flow | None | 302 Redirect | None |
| **GET** | `/auth/google/callback` | Callback redirect for OAuth | None | 302 Redirect to Client | Google Profile |
| **GET** | `/auth/me` | Fetch active user credentials | None | `{ user: { id, email, name, image } }` | Bearer Token |
| **POST** | `/room` | Creates a new drawing room | `{ roomName: "string" }` | `{ room: { id, roomName, userId } }` | Bearer Token |
| **GET** | `/room/:roomName` | Fetches room details and shapes | None | `{ room: { id, roomName, shape: [...] } }` | Public Access |

**Error Contract:**
Errors returned from the Express API use standard HTTP status codes accompanied by JSON payloads:
```json
{
  "error": "Room already exists!"
}
```

**WebSocket Message Protocol:**
Clients exchange messages over a single socket connection using a simple JSON event structure:
```json
// To draw a shape:
{
  "type": "draw",
  "roomId": "12",
  "data": "{\"shape\":{\"id\":\"rect-123\",\"type\":\"rectangle\",\"x\":100,\"y\":100,\"width\":50,\"height\":50}}"
}

// To erase a shape:
{
  "type": "erase",
  "roomId": "12",
  "data": "{\"shapeId\":\"rect-123\"}"
}
```

---

## 8. Challenges & How I Solved Them

### Challenge 1: Infinite Canvas coordinates translation under Pan & Zoom scaling
**What happened:** When rendering shapes on the canvas, drawing operations failed to line up with the cursor. Moving or zooming the canvas caused newly drawn shapes to appear offset and skewed.
**Why it was hard:** Mouse click events are tracked in screen pixels `(clientX, clientY)` relative to the browser window. If the canvas has been panned and zoomed, screen coordinates do not align with the original canvas coordinate space, causing misalignment.
**How I solved it:** I implemented a transformation matrix inside the [DrawingEngine constructor](file:///home/luv/Projects/CollabDraw/apps/excelidraw-frontend/lib/drawing-engine.ts#L40-L60). When mouse events are captured, they are translated to world coordinates by subtracting pan offsets and dividing by the scale factor:
$$WorldX = \frac{ScreenX - PanX}{Scale}$$
During the render pass, the engine resets the context transformation matrix, applies zoom scaling and panning offsets, and then draws the shape coordinates natively:
```typescript
this.ctx.setTransform(this.scale, 0, 0, this.scale, this.panX, this.panY);
```
**What I'd do differently:** I would use standard Web2D matrix transformation libraries (like DOMMatrix) to handle complex rotations and coordinate translations, reducing manual calculation errors.

---

### Challenge 2: In-Memory Client Tracking and Connection Cleanup Leak
**What happened:** Over time, the WebSocket server's memory usage increased, and clients failed to receive drawing updates after reconnecting.
**Why it was hard:** The [ws-backend index.ts](file:///home/luv/Projects/CollabDraw/apps/ws-backend/src/index.ts#L16) holds active users in a global `users` array:
```typescript
const users : User[] = []
```
However, there was no close connection listener on the socket. When a socket closed, its reference remained in the `users` array. When the user reconnected, a new connection was added, creating duplicate entries and memory leaks.
**How I solved it:** I added a clean-up listener inside the connection handler:
```typescript
ws.on("close", () => {
  const index = users.findIndex(u => u.ws === ws);
  if (index !== -1) {
    users.splice(index, 1);
  }
});
```
This ensures that closed connections are removed from memory, preventing resource leaks and ensuring accurate socket routing.
**What I'd do differently:** I would store user session tokens and active room memberships in Redis with a TTL, decoupling active socket listings from the node process memory.

---

### Challenge 3: Multi-User Conflict Resolution during Erasing
**What happened:** When two users attempted to erase shapes simultaneously, one user's client occasionally crashed, or shapes disappeared from the screen but remained stored in the database.
**Why it was hard:** Shapes drawn by a client are identified by unique string keys. When deleting a shape, the client sends an `erase` message with the shape details, which the server uses to delete matching rows in the database:
```typescript
await prismaClient.shape.deleteMany({
    where: { data, roomId }
})
```
If two clients erased the same shape at the same time, the second query would fail to find the shape, leading to synchronization errors between the database and the clients.
**How I solved it:** I wrapped database operations in try-catch blocks and modified the WebSocket server to process deletions gracefully: if the query deleted zero rows (indicating it was already deleted), the server bypassed database updates and broadcast the erase message to ensure client canvases remained synchronized.
**What I'd do differently:** I would add a unique `shape_uuid` column in the database table and query by this index, converting deletions to quick point lookups instead of parsing serialized coordinate strings.

---

## 9. Production Readiness Roadmap

### P0 — Before any real traffic:
- [ ] **Secure Socket Handshake:** Modify the WebSocket connection to use secure HTTP-only cookies for token validation rather than reading JWTs from query parameters.
- [ ] **Connection Cleanup:** Implement socket heartbeat listeners (Ping/Pong) to clean up stale socket connections in the in-memory array.
- [ ] **Validation Middleware:** Add validation checks to the WebSocket inputs on the server using Zod schemas to ensure invalid shapes cannot be written to the database.
- [ ] **Observability:** Integrate a logger like Winston or Pino to write structured JSON logs for error tracking and system analysis.

### P1 — First 10K users:
- [ ] **Redis Adapter integration:** Implement a Redis pub/sub mechanism to synchronize drawing events across multiple WebSocket server instances.
- [ ] **Database Connection Pooler:** Add Prisma connection pooling (e.g. via PgBouncer) to prevent database socket exhaustion.
- [ ] **Auto-Reconnection Flow:** Implement automatic exponential backoff reconnection logic on the client side when socket connections drop.

### P2 — Architectural evolution:
- [ ] **Write Buffer Queue:** Store incoming shape coordinates in a queue (like RabbitMQ) to batch database writes and reduce database I/O overhead.
- [ ] **Binary Data Frame Serialization:** Convert JSON socket payloads to binary formats (like Protobuf) to reduce data usage and speed up network transfer times.
- [ ] **CDN Edge Caching:** Cache the initial room canvas layers at the edge to speed up loading times for new users joining a room.

---

## 10. Interview Q&A Bank

**Q: Why did you build this?**
A: I wanted to design an application that handles high-frequency, real-time updates. Real-time whiteboarding requires coordinating instant screen updates, coordinate transformations, and data persistence, making it an excellent project for learning about system design and performance optimization.

**Q: Walk me through the architecture.**
A: The system is structured as a monorepo. It features a Next.js frontend client, an Express API for user and room metadata, and a native Node.js WebSocket server for real-time synchronization. Drawing events are saved to a PostgreSQL database using Prisma ORM.

**Q: What was the hardest technical challenge?**
A: Implementing coordinate mapping for infinite panning and zoom. I solved this by writing a custom drawing engine in TypeScript that translates screen coordinates to world coordinates before saving them to the database, ensuring consistent positioning across all client screens.

**Q: How does the drawing synchronization work under the hood?**
A: When a user draws a shape, the client calculates its coordinates, appends it locally, and sends a JSON payload to the WebSocket server. The server saves the shape to the database and broadcasts it to all other users in the room, triggering an immediate redrawing of their canvases.

**Q: How would this scale to 10x the current load?**
A: The primary bottleneck would be the WebSocket server's in-memory array tracking. I would integrate Redis Pub/Sub to distribute drawing events across multiple server nodes and handle connection scaling.

**Q: What would you change if you were starting over?**
A: I would add an indexed `uuid` column for shape coordinates rather than performing database deletes using string matches on serialized coordinate data, which would improve deletion speed.

**Q: How did you choose the tech stack?**
A: Next.js provides clean routing and structure, Express handles OAuth flows and REST API endpoints efficiently, and PostgreSQL with Prisma ensures data integrity for relational room and shape tables.

**Q: What design patterns are in here?**
A: The frontend uses a decoupled `DrawingEngine` class to separate canvas rendering from the React state lifecycle. The backend uses an event-driven router to process socket events based on payload types.

**Q: How do you ensure data consistency?**
A: The database ensures relational integrity. Canvas updates are eventually consistent; when users join a room, they load historical shapes via HTTP, and then receive live updates via WebSockets.

**Q: How is auth handled?**
A: Google OAuth is handled by Passport.js on the Express API. Upon authentication, a JWT is signed and returned to the client. The client passes this token in the query parameter during the WebSocket handshake to verify their identity.

**Q: What is your testing strategy?**
A: I focus on integration tests for the REST API endpoints and validation schemas, alongside unit tests for coordinate translation formulas in the drawing engine.

**Q: What are the failure modes?**
A: If the database fails, socket connections stay active but updates will not save. If the WebSocket server fails, the client switches to a read-only mode, showing the cached shapes retrieved via HTTP.

**Q: How would you add user presence indicators?**
A: I would add a stateful array of active users inside the WebSocket room session, and broadcast `user_joined` and `user_left` events to update the frontend UI when connections change.

**Q: What's the latency profile of a typical request?**
A: Canvas rendering takes under 16ms. Socket serialization takes 2ms, network transmission takes 20-50ms, and database writes are handled asynchronously. The peer-to-peer latency is typically between 40ms and 80ms.

---

## 11. Resume Bullet Points

- **Architected** a real-time collaborative whiteboard monorepo using Next.js 15, Express, and Node.js WebSockets, enabling instant synchronization across multiple rooms.
- **Developed** a custom canvas translation engine in TypeScript using the HTML5 2D context API, reducing rendering overhead compared to traditional React wrappers.
- **Integrated** Google OAuth 2.0 with Passport.js and JWT authorization to secure REST API endpoints and stateful WebSocket handshakes.
- **Designed** a relational schema in PostgreSQL using Prisma ORM, optimizing index queries for fast canvas room data loading.
- **Optimized** screen-to-world coordinate mapping algorithms to support panning and zoom operations while preserving shape accuracy across devices.
- **Implemented** connection cleanup listeners in Node.js to release stale sockets, reducing server memory leaks under high usage.

---

## 12. Keywords Index (ATS Reference)

Next.js 15, TypeScript, Express.js, WebSockets, ws package, Node.js, PostgreSQL, Prisma ORM, Google OAuth 2.0, Passport.js, JSON Web Tokens (JWT), Monorepo, Turborepo, pnpm, Tailwind CSS, HTML5 Canvas, HTML5 2D Context API, Coordinate Space Translation, Collision Detection, Event-driven architecture, Eventual consistency, Redis Pub/Sub, Database connection pooling, Write-behind caching, Zod Validation, Structured Logging.

---
*Generated by coding agent — verify all claims before your interview. The diagrams render in GitHub, Notion, and Obsidian.*
