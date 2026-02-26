# Enterprise Backend Boilerplate

Production-ready Node.js + Express + TypeScript backend with clean architecture, JWT authentication, and database provider switching (MySQL / PostgreSQL / MongoDB).

## Architecture

```
Routes -> Controller -> Service -> Repository (interface)
                                        |
                    DI Container selects implementation
                        /                       \
              PrismaRepository          MongooseRepository
              (MySQL/Postgres)              (MongoDB)
```

- **Domain layer** -- entities, repository interfaces (zero framework deps)
- **Application layer** -- services with business logic, depend on interfaces only
- **Infrastructure layer** -- Prisma and Mongoose implementations
- **Container** -- dependency injection wiring based on `DATABASE_USE` env var

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url> && cd backend-bolierplate-code
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database credentials and JWT secrets

# 3. Database setup (SQL providers)
npm run prisma:setup       # selects schema based on DATABASE_USE
npx prisma migrate dev     # run migrations
npx prisma generate        # generate client

# 4. Run
npm run dev                # development with hot reload
npm run build && npm start # production
```

## Database Provider Switching

Set `DATABASE_USE` in `.env`:

| Value      | ORM      | Connection Var  |
|------------|----------|-----------------|
| `mysql`    | Prisma   | `DATABASE_URL`  |
| `postgres` | Prisma   | `DATABASE_URL`  |
| `mongo`    | Mongoose | `MONGO_URI`     |

### Switching to PostgreSQL

```bash
# .env
DATABASE_USE=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/mydb?schema=public
```

Copy the postgres schema and regenerate:
```bash
cp prisma/schema.postgres.prisma prisma/schema.prisma
npx prisma migrate dev
npx prisma generate
```

### Switching to MongoDB

```bash
# .env
DATABASE_USE=mongo
MONGO_URI=mongodb://localhost:27017/mydb
```

No Prisma setup needed -- Mongoose connects directly.

### Switching to MySQL (default)

```bash
# .env
DATABASE_USE=mysql
DATABASE_URL=mysql://root@localhost:3306/mydb
```

```bash
cp prisma/schema.mysql.prisma prisma/schema.prisma
npx prisma db push
npx prisma generate
```

## Authentication

JWT-based auth with access + refresh tokens.

### Endpoints

| Method | Path                    | Auth | Description         |
|--------|-------------------------|------|---------------------|
| POST   | `/api/v1/auth/register` | No   | Register new user   |
| POST   | `/api/v1/auth/login`    | No   | Login, get tokens   |
| POST   | `/api/v1/auth/refresh`  | No   | Refresh access token|
| GET    | `/api/v1/auth/me`       | Yes  | Get current user    |

### Protecting Routes

```typescript
import { authMiddleware } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/role.middleware';

// Require authentication
router.get('/profile', authMiddleware, asyncHandler(controller.profile));

// Require specific role
router.delete('/admin', authMiddleware, requireRole('admin'), asyncHandler(controller.delete));
```

### Token Flow

1. Register/Login returns `{ accessToken, refreshToken }`
2. Send access token: `Authorization: Bearer <accessToken>`
3. When access token expires, POST `/auth/refresh` with `{ refreshToken }`
4. Receive new token pair

## User CRUD (Admin)

| Method | Path                 | Description          |
|--------|----------------------|----------------------|
| POST   | `/api/v1/users`      | Create user          |
| GET    | `/api/v1/users`      | List users (paginated)|
| GET    | `/api/v1/users/:id`  | Get user by ID       |
| PATCH  | `/api/v1/users/:id`  | Update user name     |
| DELETE | `/api/v1/users/:id`  | Delete user          |

## API Response Format

All endpoints return consistent JSON:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": { ... }
}
```

Errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": [ { "field": "email", "message": "Invalid email" } ],
  "meta": { "requestId": "uuid" }
}
```

## Scripts

| Script             | Description                          |
|--------------------|--------------------------------------|
| `npm run dev`      | Development server with hot reload   |
| `npm run build`    | Compile TypeScript to dist/          |
| `npm start`        | Run production build                 |
| `npm run lint`     | Check code with ESLint               |
| `npm run lint:fix` | Auto-fix lint issues                 |
| `npm run format`   | Check formatting with Prettier       |
| `npm run format:fix`| Auto-format code                    |
| `npm test`         | Run Jest tests                       |
| `npm run test:watch`| Run tests in watch mode             |
| `npm run prisma:setup`| Select Prisma schema by DATABASE_USE |
| `npm run prisma:generate`| Generate Prisma client          |
| `npm run prisma:migrate`| Run database migrations (dev)    |
| `npm run prisma:deploy`| Deploy migrations (production)    |
| `npm run prisma:studio`| Open Prisma Studio GUI            |
| `npm run seed`     | Seed the database                    |

## Docker

```bash
# Start all services (API + Postgres + MongoDB)
docker compose up -d

# Start only databases for local dev
docker compose up -d postgres mongo

# Build production image
docker build -t backend-api .
```

The Dockerfile uses multi-stage builds for minimal production images.

## Swagger Docs

When `SWAGGER_ENABLED=true`, API docs available at:

```
http://localhost:3000/docs
```

## Testing

```bash
npm test             # run all tests
npm run test:watch   # watch mode
```

Test structure:
- `tests/user.e2e.test.ts` -- E2E tests (health, validation, auth)
- `tests/unit/user.service.test.ts` -- UserService unit tests
- `tests/unit/auth.service.test.ts` -- AuthService unit tests
- `tests/unit/response.test.ts` -- Response utility tests

## CI/CD

Pre-configured pipelines:

- **GitHub Actions**: `.github/workflows/ci.yml` -- lint, typecheck, test, build
- **GitLab CI**: `.gitlab-ci.yml` -- lint, test, build stages

## Environment Variables

See `.env.example` for all available configuration options. No direct `process.env` access outside the config module.

## Project Structure

```
src/
  app.ts                    # Express app setup
  server.ts                 # HTTP server + graceful shutdown
  config/                   # Environment validation + config object
  constants/                # HTTP status codes
  container/                # Dependency injection wiring
  controllers/              # HTTP request handlers
  database/                 # DB connect/disconnect abstraction
  domain/                   # Entities + repository interfaces
  exceptions/               # Custom error classes
  infrastructure/           # Prisma + Mongoose implementations
  logger/                   # Pino logger + request logging
  middlewares/               # Auth, security, validation, error, timeout
  routes/                   # API route definitions
  services/                 # Business logic
  types/                    # TypeScript type augmentations
  utils/                    # Async handler, JWT, password, response, shutdown
  validators/               # Zod request schemas
```
