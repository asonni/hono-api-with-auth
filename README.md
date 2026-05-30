# Hono API with Auth

A **Library Management REST API** built with [Hono](https://hono.dev), featuring dual authentication (JWT + API Keys), role-based access control, and interactive OpenAPI documentation.

## Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **Framework:** [Hono](https://hono.dev) v4.12 — lightweight, fast web framework
- **Language:** TypeScript
- **Database:** PostgreSQL (via Docker Compose)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team) v1.0.0-rc.3 + Drizzle Kit for migrations
- **Validation:** [Zod](https://zod.dev) v4.4.3 with `@hono/standard-validator`
- **Authentication:**
  - JWT (JSON Web Tokens) for user login / registration
  - API Key authentication for resource CRUD operations
- **Documentation:** Swagger / OpenAPI with `@hono/swagger-ui`
- **Security:** Custom crypto utilities for password hashing and API key generation

## Features

- **User Authentication:** Register and login with email/password to receive a JWT token.
- **API Key Management:** Authenticated users can create, list, and revoke API keys (with optional expiration).
- **Library Management:** Full CRUD for **Authors** and **Books**.
- **Role-Based Access Control:**
  - **Admins** can modify any book.
  - **Regular users** can only modify books they created.
- **Request Validation:** All incoming JSON payloads are validated using Zod schemas.
- **Auto-generated Docs:** Interactive Swagger UI at `/docs`.
- **Database Migrations:** Managed with Drizzle Kit.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- Docker & Docker Compose (for PostgreSQL)

### 1. Install dependencies

```sh
bun install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=library-yt-video
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your_jwt_secret_key
```

### 3. Start the database

```sh
docker compose up -d
```

### 4. Run database migrations

```sh
bunx drizzle-kit migrate
```

### 5. Start the development server

```sh
bun run dev
```

The API will be available at `http://localhost:3000`.

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

| Script | Description |
|--------|-------------|
| `bun run dev` | Start the development server with hot reload |

## Project Structure

```
.
├── src/
│   ├── index.ts              # App entry point & route mounting
│   ├── routes/
│   │   ├── auth.ts           # JWT login/register
│   │   ├── apiKey.ts         # API key management
│   │   ├── author.ts         # Author CRUD
│   │   ├── book.ts           # Book CRUD
│   │   └── swagger.ts        # Swagger UI route
│   ├── middleware/
│   │   └── auth.ts           # API key verification middleware
│   ├── db/
│   │   ├── db.ts             # Drizzle ORM instance
│   │   ├── schema.ts         # Schema exports
│   │   ├── relations.ts      # Table relations
│   │   ├── schemas/          # Individual table schemas
│   │   └── migrations/       # Drizzle migrations
│   ├── lib/
│   │   └── crypto.ts         # Password & API key hashing utilities
│   └── data/
│       └── env.ts            # Environment variable validation (Zod)
├── drizzle.config.ts         # Drizzle Kit configuration
├── docker-compose.yml        # PostgreSQL container setup
├── swagger.json              # OpenAPI specification
└── package.json
```

## License

MIT
