# Project structure and container wiring

## src/ layout

| Path | Purpose |
|------|---------|
| `app.ts` | Express app: request-id, timeout, security, logger, `/health`, `/health/ready`, optional `/docs`, `/api` routes, notFound, errorMiddleware |
| `server.ts` | Connects DB, starts HTTP server, graceful shutdown |
| `config/` | Env validation (env.ts), config object (index.ts), Swagger (swagger.ts) |
| `constants/http.ts` | HttpStatus (OK, CREATED, NOT_FOUND, etc.) |
| `container/index.ts` | Creates repositories by config.database.use; instantiates UserService, AuthService; exports container |
| `controllers/` | auth.controller, user.controller — thin, use container and sendSuccess |
| `database/index.ts` | connectDatabase(), disconnectDatabase() — Prisma or Mongoose by config |
| `domain/entities/` | user.ts — UserEntity, DTOs, PaginationParams, PaginatedResult, toSafeUser |
| `domain/repositories/` | Interfaces only: user.repository.interface, revoked-token.repository.interface |
| `exceptions/` | BaseError, ValidationError (422), AuthError (401), NotFoundError (404), ConflictError (409) |
| `infrastructure/persistence/prisma/` | prisma.client, user.prisma.repository, revoked-token.prisma.repository |
| `infrastructure/persistence/mongoose/` | mongoose.client, models/, user.mongoose.repository, revoked-token.mongoose.repository |
| `logger/` | Pino logger, request-logger middleware |
| `middlewares/` | request-id, timeout, security, validate, auth, role, notfound, error |
| `routes/index.ts` | Mounts v1 under `/api` |
| `routes/v1/index.ts` | Mounts authRoutes at `/auth`, userRoutes at `/users` → `/api/v1/auth`, `/api/v1/users` |
| `services/` | auth.service, user.service, health.service |
| `utils/` | async-handler, jwt, password, response (sendSuccess), shutdown |
| `validators/` | auth.validator (Zod), user.validator (Zod) |

## Container (src/container/index.ts)

- `createUserRepository()`: switch on config.database.use → PrismaUserRepository (mysql/postgres) or MongooseUserRepository (mongo).
- `createRevokedTokenRepository()`: same switch → Prisma or Mongoose revoked-token repository.
- Exports: `userRepository`, `revokedTokenRepository`, `userService`, `authService`. Controllers import `container` and destructure the service they need.

## Adding a new entity

When adding a new domain entity (e.g. Product), you add: domain entity + repository interface; Prisma and Mongoose implementations; createXRepository() in container; XService; XController; validators; routes; mount routes in routes/v1/index.ts. See the add-entity skill.
