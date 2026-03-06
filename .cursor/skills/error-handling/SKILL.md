---
name: error-handling
description: Uses the project's custom exceptions and error middleware for failures. Use when throwing errors, handling failures, or adding new error types.
---

# Error Handling

Use only the existing exception classes. Do not call `res.status().json()` in controllers for errors; throw and let the error middleware handle the response.

## Exception classes

All live under `src/exceptions/` and extend **BaseError(message, statusCode, isOperational?, details)**.

| Class | Status | Use when |
|-------|--------|----------|
| **ValidationError** | 422 | Request validation failed (Zod); pass `details` as array of `{ field, message }`. The validate middleware uses this. |
| **AuthError** | 401 | Invalid or missing auth (e.g. invalid token, wrong credentials). |
| **NotFoundError** | 404 | Resource not found (e.g. findById returns null, or update/delete target missing). |
| **ConflictError** | 409 | Business conflict (e.g. duplicate email on register). |

Import from `@/exceptions` (e.g. `import { NotFoundError } from '@/exceptions'`).

## Status codes

Use constants from `@/constants/http`: `HttpStatus.NOT_FOUND`, `HttpStatus.UNAUTHORIZED`, `HttpStatus.CONFLICT`, `HttpStatus.UNPROCESSABLE_ENTITY`, etc. Do not hardcode numbers. BaseError and the specific error classes already use these in their constructors.

## Error middleware behavior

`src/middlewares/error.middleware.ts`:

- If the error is an instance of **BaseError**: respond with `err.statusCode` and body `{ success: false, message: err.message, error?: err.details, meta: { requestId } }`. In non-production, stack may be included.
- Otherwise: respond with 500 and a generic message in production; in development the actual message and stack may be included.

So: throw the appropriate exception from services or controllers; the middleware will send the correct status and JSON. Do not catch and re-send manually unless you have a specific reason (e.g. health check ready endpoint that returns 503 with a custom body).

## Adding a new error type

If you need a new HTTP error type (e.g. ForbiddenError 403): create a class in `src/exceptions/` that extends BaseError and passes the desired status code; export it from `src/exceptions/index.ts`. Use the same pattern as `AuthError` or `NotFoundError`.
