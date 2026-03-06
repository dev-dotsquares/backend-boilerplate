---
name: add-validator
description: Adds or updates Zod request validators and wires them with the validate middleware. Use when adding or changing request validation for body, params, or query.
---

# Add Validator

Validators live in `src/validators/`. Each file exports Zod schemas. Routes use the **validate** middleware from `src/middlewares/validate.middleware.ts` with those schemas. On failure, the middleware throws **ValidationError** (422) with a details array of `{ field, message }`.

## Where to define schemas

- **Per feature**: e.g. `src/validators/auth.validator.ts`, `src/validators/user.validator.ts`. Add a new file like `src/validators/<name>.validator.ts` for a new feature.
- **Exports**: Export each schema with a clear name: `createXBody`, `updateXBody`, `idParam`, `listXQuery`, etc.

## Zod patterns

- **Body**: `z.object({ email: z.string().email('Invalid email address'), name: z.string().min(1).max(100), ... })`.
- **Params**: `z.object({ id: z.string().min(1, 'ID is required') })`.
- **Query (pagination)**: `z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(10) })`.
- Optional fields: `z.string().optional()` or `z.object({ ... }).optional()`.
- Coercion: Use `z.coerce.number()` for query params that must be numbers.

Reference: `src/validators/auth.validator.ts` (registerBody, loginBody, refreshBody, logoutBody), `src/validators/user.validator.ts` (createUserBody, updateUserBody, idParam, listUsersQuery).

## Using in routes

Pass schemas to **validate**:

- `validate({ body: createXBody })` — parses body and assigns to `req.body` (and `req.validated.body`).
- `validate({ params: idParam })` — parses params and assigns to `req.validated.params` (Express 5 keeps req.params/query read-only in some cases).
- `validate({ query: listXQuery })` — parses query and assigns to `req.validated.query`.

You can combine: `validate({ params: idParam, body: updateXBody })`. The middleware runs before the controller; on Zod parse failure it calls `next(new ValidationError('Validation failed', details))` and the error middleware returns the standard error JSON.

## No ad-hoc validation in controllers

Do not parse or validate request data manually in controllers. Use Zod in validators and the validate middleware only.
