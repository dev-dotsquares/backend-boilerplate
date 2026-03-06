---
name: backend-conventions
description: Project structure, naming, and conventions for this Node.js Express backend. Use when adding or modifying code in this repo, refactoring, or adapting patterns from other projects.
---

# Backend Conventions

Concise reference for this backend. Other skills assume these conventions.

## Architecture

- **Flow**: Route → Controller → Service → Repository (interface). Controllers are thin; business logic lives in services. Repositories are interfaces in the domain layer; implementations live in infrastructure.
- **Layers**:
  - **Domain**: Entities and DTOs in `src/domain/entities/`; repository interfaces in `src/domain/repositories/`. No framework imports.
  - **Application**: Services in `src/services/`; depend only on repository interfaces.
  - **Infrastructure**: Prisma and Mongoose implementations under `src/infrastructure/persistence/`.
- **Container**: `src/container/index.ts` wires implementations by `config.database.use` (mysql | postgres | mongo). Add new repositories and services there.

## Paths and config

- **Path alias**: Use `@/` for `src/` (e.g. `import { config } from '@/config'`). Do not use relative paths like `../../../config` from deep folders.
- **Environment**: Never read `process.env` outside `src/config/`. All config comes from the validated `config` object. Env validation is in `src/config/env.ts` (Zod).

## HTTP and responses

- **Status codes**: Use constants from `@/constants/http` (e.g. `HttpStatus.CREATED`, `HttpStatus.NOT_FOUND`). Do not hardcode numbers.
- **Success responses**: Use `sendSuccess(res, data, message?, statusCode?)` from `@/utils/response`. Default status is 200; use 201 for create.
- **Errors**: Throw custom exceptions (`ValidationError`, `AuthError`, `NotFoundError`, `ConflictError`). Do not call `res.status().json()` for errors in controllers; the error middleware in `src/middlewares/error.middleware.ts` handles them and returns `{ success: false, message, error?, meta: { requestId } }`.

## Route handlers

- Wrap every async route handler with `asyncHandler(Controller.method)` from `@/utils/async-handler` so thrown errors reach the error middleware.

## Naming

- **Variables and functions**: camelCase.
- **Classes, types, interfaces**: PascalCase.
- **Files**: kebab-case for multi-word names (e.g. `user.controller.ts`, `auth.middleware.ts`).

## Reference

- For a one-page map of `src/` and container wiring, see [references/structure.md](references/structure.md).
