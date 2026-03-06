---
name: database-repository
description: Adds a new repository (interface plus Prisma and Mongoose implementations) and wires it in the container. Use when adding persistence for a new entity or a new repository type.
---

# Database Repository

Repositories abstract persistence. The **domain** defines the interface; **infrastructure** provides Prisma (MySQL/PostgreSQL) and Mongoose (MongoDB) implementations. The **container** selects the implementation using `config.database.use`.

## 1. Define the interface

Create `src/domain/repositories/<name>.repository.interface.ts`.

- Methods take and return domain types (entities, DTOs, PaginationParams, PaginatedResult) from `src/domain/entities/`.
- Example methods: `create(data: CreateXDto): Promise<XEntity>`, `findById(id: string): Promise<XEntity | null>`, `findAll(params: PaginationParams): Promise<PaginatedResult<XEntity>>`, `update(id: string, data: UpdateXDto): Promise<XEntity | null>`, `delete(id: string): Promise<boolean>`.

Reference: `src/domain/repositories/user.repository.interface.ts`, `src/domain/repositories/revoked-token.repository.interface.ts`.

## 2. Prisma implementation

- **Schema**: Add the model to `prisma/schema.mysql.prisma` (or `schema.postgres.prisma` if using Postgres). Match fields to the domain entity (id, timestamps, etc.).
- **Client**: Use the shared Prisma client from `src/infrastructure/persistence/prisma/prisma.client.ts`.
- **Repository**: Create `src/infrastructure/persistence/prisma/<name>.prisma.repository.ts` that implements the interface. Map Prisma models to domain entities (and DTOs for create/update). Run `npx prisma generate` (and migrations if needed).

Reference: `src/infrastructure/persistence/prisma/user.prisma.repository.ts`, `src/infrastructure/persistence/prisma/revoked-token.prisma.repository.ts`.

## 3. Mongoose implementation

- **Model**: Create `src/infrastructure/persistence/mongoose/models/<name>.model.ts` (schema, timestamps if needed).
- **Repository**: Create `src/infrastructure/persistence/mongoose/<name>.mongoose.repository.ts` that implements the interface. Use the Mongoose connection from `src/infrastructure/persistence/mongoose/mongoose.client.ts`. Map documents to domain entities.

Reference: `src/infrastructure/persistence/mongoose/user.mongoose.repository.ts`, `src/infrastructure/persistence/mongoose/revoked-token.mongoose.repository.ts`.

## 4. Container wiring

In `src/container/index.ts`:

- Add a **createXRepository()** function that switches on `config.database.use`:
  - `'mysql'` or `'postgres'`: return `new PrismaXRepository()`.
  - `'mongo'`: return `new MongooseXRepository()`.
- Instantiate the repository: `const xRepository = createXRepository()`.
- If a service depends on it, instantiate that service with `xRepository` and export both from the `container` object (e.g. `xRepository`, `xService`).

Adding a new provider (e.g. another database) would require a new case in the switch and a new implementation; the rest of the app depends only on the interface.
