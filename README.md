# Library Management System

A full-stack **Library Management System** built as a monorepo with [Bun workspaces](https://bun.sh/docs/install/workspaces), featuring a Hono REST API, Next.js admin dashboard, and Convex backend. Includes dual authentication (JWT + API Keys), role-based access control, and interactive OpenAPI documentation.

## Tech Stack

### Core
- **Runtime:** [Bun](https://bun.sh)
- **Monorepo:** Bun workspaces
- **Language:** TypeScript

### Applications
- **API Server:** [Hono](https://hono.dev) v4.12 — lightweight, fast web framework
- **Web Dashboard:** [Next.js](https://nextjs.org) 15 with App Router
- **Database:** [Convex](https://www.convex.dev) — real-time backend-as-a-service

### Shared Packages
- **UI Library:** [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS](https://tailwindcss.com) + [Radix UI](https://www.radix-ui.com)
- **ESLint Config:** Shared ESLint configurations with Prettier integration
- **TypeScript Config:** Shared TypeScript configurations

### Libraries
- **Validation:** [Zod](https://zod.dev) v4.4.3 with `@hono/standard-validator`
- **Authentication:**
  - JWT (JSON Web Tokens) for user login / registration
  - API Key authentication for resource CRUD operations
- **Documentation:** Swagger / OpenAPI with `@hono/swagger-ui`
- **Security:** Convex actions for password hashing and API key generation

## Features

- **User Authentication:** Register and login with email/password to receive a JWT token.
- **API Key Management:** Authenticated users can create, list, and revoke API keys (with optional expiration).
- **Library Management:** Full CRUD for **Authors** and **Books**.
- **Role-Based Access Control:**
  - **Admins** can modify any book.
  - **Regular users** can only modify books they created.
- **Request Validation:** All incoming JSON payloads are validated using Zod schemas.
- **Auto-generated Docs:** Interactive Swagger UI at `/docs`.
- **Real-time Backend:** Convex provides real-time data synchronization and serverless functions.
- **Admin Dashboard:** Next.js web application for managing the library (work in progress).

## Project Structure

```
.
├── apps/
│   ├── api/                    # Hono REST API server (port 3000)
│   │   ├── src/
│   │   │   ├── routes/         # API route handlers
│   │   │   ├── middleware/     # Authentication middleware
│   │   │   ├── lib/            # Utilities (Convex client, date formatting)
│   │   │   └── data/           # Environment validation
│   │   └── swagger.json        # OpenAPI specification
│   └── web/                    # Next.js admin dashboard (port 3001)
│       ├── app/                # App Router pages
│       └── tailwind.config.ts  # Tailwind configuration
├── packages/
│   ├── backend/                # Convex backend
│   │   └── convex/
│   │       ├── schema.ts       # Database schema
│   │       ├── users.ts        # User queries/mutations
│   │       ├── authors.ts      # Author queries/mutations
│   │       ├── books.ts        # Book queries/mutations
│   │       ├── apiKeys.ts      # API key queries/mutations
│   │       └── crypto.ts       # Crypto actions (password hashing, API key generation)
│   ├── ui/                     # Shared UI components
│   │   ├── src/components/     # Button, Card, Input, Label, Badge
│   │   ├── src/lib/utils.ts    # Utility functions (cn helper)
│   │   └── tailwind.config.ts  # Shared Tailwind preset
│   ├── eslint-config/          # Shared ESLint configurations
│   │   ├── base.js             # Base config
│   │   ├── next.js             # Next.js config
│   │   └── hono.js             # Hono/Node config
│   └── typescript-config/      # Shared TypeScript configurations
│       ├── base.json           # Base config
│       └── nextjs.json         # Next.js config
└── package.json                # Root workspace configuration
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- [Convex](https://www.convex.dev) account (free tier available)

### 1. Install dependencies

```sh
bun install
```

### 2. Set up Convex backend

Navigate to the backend package and start the Convex dev server:

```sh
cd packages/backend
bunx convex dev
```

This will:
- Prompt you to log in to Convex (if not already logged in)
- Create a new Convex project or link to an existing one
- Generate the `_generated` directory with type-safe API clients
- Provide you with deployment URLs

Copy the `CONVEX_URL` and `CONVEX_DEPLOYMENT` values to the appropriate `.env.local` files.

### 3. Configure environment variables

**apps/api/.env.local:**
```env
PORT=3000
CONVEX_URL=https://your-deployment.convex.cloud
JWT_SECRET=your_jwt_secret_key
```

**apps/web/.env.local:**
```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

**packages/backend/.env.local:**
```env
CONVEX_DEPLOYMENT=dev:your-deployment-name
```

### 4. Start development servers

Start all services:

```sh
bun run dev
```

Or start individual services:

```sh
bun run dev:api      # API server on port 3000
bun run dev:web      # Web dashboard on port 3001
bun run dev:backend  # Convex dev server
```

The API will be available at `http://localhost:3000` and the web dashboard at `http://localhost:3001`.

## API Routes

### Authentication (JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive a JWT token (valid for 24h) |

### API Keys (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api-keys` | List all API keys for the authenticated user |
| `POST` | `/api-keys` | Create a new API key (optionally set `expiresAt`) |
| `DELETE` | `/api-keys/:id` | Revoke an API key |

### Authors (Public Read, API Key Required for Write)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/authors` | — | List all authors |
| `GET` | `/authors/:id` | — | Get a specific author |
| `POST` | `/authors` | `X-API-Key` | Create a new author |
| `PUT` | `/authors/:id` | `X-API-Key` | Update an author |
| `DELETE` | `/authors/:id` | `X-API-Key` | Delete an author |

### Books (Public Read, API Key Required for Write)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/books` | — | List all books (includes author info) |
| `GET` | `/books/:id` | — | Get a specific book (includes author info) |
| `POST` | `/books` | `X-API-Key` | Create a new book |
| `PUT` | `/books/:id` | `X-API-Key` | Update a book (owner or admin only) |
| `DELETE` | `/books/:id` | `X-API-Key` | Delete a book (owner or admin only) |

### Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/docs` | Interactive Swagger UI |
| `GET` | `/swagger.json` | Raw OpenAPI specification |

## Authentication Flow

1. **Register / Login** via `/auth/register` or `/auth/login` to obtain a JWT token.
2. **Create an API Key** by sending the JWT token in the `Authorization: Bearer <token>` header to `POST /api-keys`.
3. **Use the API Key** for protected routes by including it in the `X-API-Key` header.

## Scripts

### Root Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start all development servers (API, Web, Backend) |
| `bun run dev:api` | Start only the API server |
| `bun run dev:web` | Start only the web dashboard |
| `bun run dev:backend` | Start only the Convex dev server |
| `bun run build` | Build all packages |
| `bun run lint` | Run ESLint across all packages |
| `bun run typecheck` | Run TypeScript type checking across all packages |

### Package-Specific Scripts

Each package also has its own scripts. Navigate to a package directory to run them:

```sh
cd apps/api
bun run dev        # Start API server with hot reload
bun run lint       # Lint API code
bun run typecheck  # Type check API code

cd apps/web
bun run dev        # Start Next.js dev server
bun run build      # Build Next.js for production
bun run lint       # Lint web code
bun run typecheck  # Type check web code

cd packages/backend
bun run dev        # Start Convex dev server
bun run lint       # Lint backend code
bun run typecheck  # Type check backend code
```

## Architecture

### Data Flow

1. **Web Dashboard** (`apps/web`) communicates directly with **Convex Backend** (`packages/backend`) using Convex React hooks for real-time data
2. **API Server** (`apps/api`) handles authentication and calls **Convex Backend** via HTTP client for server-side operations
3. **Crypto operations** (password hashing, API key generation) run as Convex actions in the backend package

### Shared Packages

- **`@packages/ui`**: Reusable React components with Tailwind CSS styling. Import components like:
  ```tsx
  import { Button, Card, Input } from "@packages/ui";
  ```

- **`@packages/backend`**: Convex schema and functions. Import types like:
  ```tsx
  import type { Id } from "@packages/backend/api";
  ```

- **`@packages/eslint-config`**: Shared ESLint configurations for consistent code quality

- **`@packages/typescript-config`**: Shared TypeScript configurations for consistent type checking

## License

MIT
