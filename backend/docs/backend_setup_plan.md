# Backend Folder Structure & Setup Plan

We will structure the backend inside a dedicated `backend/` directory to separate it from the mobile and web client projects. This structure uses Node.js, Express, TypeScript, and Knex.js.

## Database Standards & Conventions
> [!IMPORTANT]
> * **Naming Rule**: All database tables and columns MUST use **`camelCase`** formatting (e.g., `doctorSpecialties`, `consultationFee`). **No `snake_case` is allowed** for any database names.
> * **Database Compatibility**: The schema is designed database-agnostically to work with both PostgreSQL and MySQL. No custom DB-level enum types or raw default functions (like `gen_random_uuid()`) are utilized.
> * **UUID Generation**: All primary keys (`id`) are UUIDs. They do not have database-level defaults. **The application layer MUST generate and assign UUIDs** (using Node.js `crypto.randomUUID()`) when inserting new records.

## Proposed Folder Structure

```
smart_doctor/
├── backend/
│   ├── src/
│   │   ├── config/               # Database and third-party API configurations
│   │   │   └── db.ts             # Exports initialized Knex client
│   │   ├── controllers/          # Request handlers (processes inputs, calls services)
│   │   │   └── auth.controller.ts
│   │   ├── database/             # Knex database migrations and seed files
│   │   │   ├── migrations/       # Database migrations
│   │   │   │   └── 20260613000000_create_initial_tables.ts
│   │   │   └── seeds/            # Initial database seeds
│   │   ├── middleware/           # Express middlewares (auth, validation, error handler)
│   │   │   ├── auth.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── models/               # Domain-specific models/types/schemas (e.g., Zod)
│   │   │   └── types.ts
│   │   ├── routes/               # Express routes mapping endpoints to controllers
│   │   │   ├── auth.routes.ts
│   │   │   └── index.ts          # Main router registry
│   │   ├── services/             # Core business logic (interacts with database)
│   │   │   └── auth.service.ts
│   │   ├── helpers/              # Utility functions and helper scripts
│   │   │   └── jwt.helper.ts
│   │   ├── app.ts                # Express application configuration
│   │   └── server.ts             # Server entry point (starts listener)
│   ├── .env                      # Environment variables
│   ├── .gitignore                # Git ignore configuration
│   ├── knexfile.ts               # Knex.js configuration file
│   ├── package.json              # Dependencies and scripts
│   └── tsconfig.json             # TypeScript compiler settings
└── docs/                         # Documentation (system design, system structure)
```

## Description of Directories

| Directory | Purpose |
| :--- | :--- |
| **`database/`** | Contains Knex database migrations and initial seed configurations. |
| **`config/`** | Houses configurations for PostgreSQL client setup (via Knex), Agora, Cloudflare R2, etc. |
| **`controllers/`** | Responsible for handling HTTP requests, extracting payloads, validating parameters, and returning HTTP responses. |
| **`middleware/`** | Functions that execute during the request-response lifecycle (e.g., token verification, CORS, error handling). |
| **`models/`** | Contains custom schemas (like Zod validation schemas) or TypeScript interfaces/types matching requests/responses. |
| **`routes/`** | Maps REST endpoints (e.g., `/api/v1/auth/register`) to their respective controller methods. |
| **`services/`** | Contains all the core business logic. Keeps controllers thin and testable. Interacts directly with database models via Knex. |
| **`helpers/`** | Simple utility/helper functions that do not contain core business logic (e.g., hashing passwords, formatting dates). |
| **`app.ts`** | Instantiates Express, configures standard middleware (CORS, body parser, helmet), registers routers, and sets up global error handling. |
| **`server.ts`** | Imports the app and starts the HTTP server listening on the designated port. |
