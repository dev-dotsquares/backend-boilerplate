---
name: add-entity
description: Adds a new domain entity with full stack (entity, repository, service, controller, routes, validators). Use when the user wants to add a new resource such as Product, Order, or Post.
---

# Add Entity

Follow project conventions per the **backend-conventions** skill. Use the existing User flow as the reference: `src/domain/entities/user.ts`, `src/controllers/user.controller.ts`, `src/routes/v1/user.routes.ts`, `src/validators/user.validator.ts`.

## Checklist

- [ ] 1. Domain entity and DTOs
- [ ] 2. Repository interface and implementations (Prisma + Mongoose)
- [ ] 3. Container wiring
- [ ] 4. Service
- [ ] 5. Controller
- [ ] 6. Validators
- [ ] 7. Routes and mount

---

## 1. Domain entity and DTOs

Create `src/domain/entities/<name>.ts` (e.g. `product.ts`).

- Define the **entity** interface (id, fields, createdAt, updatedAt if needed).
- Define **CreateXDto** and **UpdateXDto** for input.
- If the entity has sensitive fields, define a **SafeXEntity** (e.g. omit password) and a **toSafeX** helper.
- For list endpoints: **PaginationParams** (`page`, `limit`) and **PaginatedResult&lt;T&gt;** (`data`, `total`, `page`, `limit`, `totalPages`). Mirror `src/domain/entities/user.ts`.

---

## 2. Repository interface and implementations

- **Interface**: `src/domain/repositories/<name>.repository.interface.ts`. Methods: create, findById, findAll(pagination), update, delete (and any domain-specific methods). Use entity and DTO types from domain.
- **Prisma**: Add model to `prisma/schema.mysql.prisma` (or postgres variant); run migrate and generate. Create `src/infrastructure/persistence/prisma/<name>.prisma.repository.ts` implementing the interface.
- **Mongoose**: Create model in `src/infrastructure/persistence/mongoose/models/<name>.model.ts` and `src/infrastructure/persistence/mongoose/<name>.mongoose.repository.ts`.

See the **database-repository** skill for detailed repository and container steps.

---

## 3. Container wiring

In `src/container/index.ts`:

- Add `createXRepository(): IXRepository` that switches on `config.database.use` (mysql/postgres → Prisma, mongo → Mongoose).
- Instantiate the repository and the new service (e.g. `xService = new XService(xRepository)`).
- Export `xRepository` and `xService` on the `container` object.

---

## 4. Service

Create `src/services/<name>.service.ts`.

- Constructor accepts only the repository interface (e.g. `IXRepository`).
- Methods: create, findAll, findById, update, delete. Call repository; map to safe entity if needed; throw `NotFoundError` when findById/update/delete get null. No HTTP or request objects—only DTOs and ids.

---

## 5. Controller

Create `src/controllers/<name>.controller.ts`.

- Import `container`, `sendSuccess` from `@/utils/response`, `HttpStatus` from `@/constants/http`.
- Destructure the service from container (e.g. `const { xService } = container`).
- Static methods per route: receive `req`, `res`; read validated body/params/query from `req.body`, `req.params`, or `req.validated`; call service; call `sendSuccess(res, data, message, statusCode)`. Use `HttpStatus.CREATED` for create. Do not catch errors to send manual responses—let the error middleware handle them.

---

## 6. Validators

Create `src/validators/<name>.validator.ts`.

- Use Zod: `z.object({ ... })` for body; `z.object({ id: z.string().min(1) })` for params; for list, `z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(10) })` for query.
- Export schemas with clear names: e.g. `createXBody`, `updateXBody`, `idParam`, `listXQuery`. See `src/validators/user.validator.ts` and **add-validator** skill.

---

## 7. Routes and mount

- Create `src/routes/v1/<name>.routes.ts`. Use `Router()`, `validate({ body, params, query })` with the validators from step 6, and `asyncHandler(Controller.method)`. Add auth/role middlewares only if the endpoint must be protected (see **auth-and-routes** skill).
- In `src/routes/v1/index.ts`, import the new routes and `router.use('/<path>', xRoutes)` (e.g. `router.use('/products', productRoutes)`).

After implementation, run lint and fix any issues; ensure new routes are under `/api/v1/` as in `src/app.ts` and `src/routes/index.ts`.
