---
name: add-route
description: Adds a new API endpoint with validation, optional auth, and async handler. Use when adding a new route to an existing or new feature.
---

# Add Route

Follow **backend-conventions** for structure, status codes, and responses. Use `src/routes/v1/auth.routes.ts` and `src/routes/v1/user.routes.ts` as examples.

## Pattern

1. **Route file**: Add the route in the appropriate `src/routes/v1/<feature>.routes.ts`.
2. **Middleware order**: `validate(...)` (if needed) → optional `authMiddleware` → optional `requireRole('admin')` → `asyncHandler(Controller.method)`.
3. **Controller**: Add a static method that calls the service and uses `sendSuccess(res, data, message, statusCode)`. Use `HttpStatus` from `@/constants/http` (e.g. `HttpStatus.CREATED` for create).
4. **Service**: Add a method for any new business logic; keep the controller thin (no branching beyond calling the service and sendSuccess).

## Route shape

```text
router.<method>('<path>', validate({ body?, params?, query? })?, authMiddleware?, requireRole('admin')?, asyncHandler(Controller.method));
```

- **validate**: Omit if the route has no body/params/query to validate. Use Zod schemas from `src/validators/` (see **add-validator** skill).
- **authMiddleware**: From `@/middlewares/auth.middleware` — sets `req.user` from the Bearer token. Add for any endpoint that requires a logged-in user.
- **requireRole**: From `@/middlewares/role.middleware` — use after authMiddleware when the endpoint is restricted by role (e.g. admin-only).

## Controller method

- Read input from `req.body` (after validate), `req.params`, or `req.validated.params` / `req.validated.query` when using validate for params/query.
- Call the service; then `sendSuccess(res, data, message, statusCode)`.
- Do not use try/catch to send error responses manually; throw exceptions and let the error middleware handle them.

## Examples (reference only)

- Public POST with body: `router.post('/register', validate({ body: registerBody }), asyncHandler(AuthController.register))`.
- Protected GET: `router.get('/me', authMiddleware, asyncHandler(AuthController.me))`.
- CRUD with params and body: `router.patch('/:id', validate({ params: idParam, body: updateUserBody }), asyncHandler(UserController.update))`.
