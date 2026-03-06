---
name: auth-and-routes
description: Protects routes with JWT auth and optional role checks. Use when securing endpoints or changing authentication behavior.
---

# Auth and Routes

JWT-based auth: access token (short-lived) and refresh token (long-lived, stored for refresh/revoke). Token logic lives in **AuthService** and `src/utils/jwt.ts`; do not put secrets or token creation/verification in controllers.

## Token flow

1. **Register/Login**: Return `{ user: SafeUserEntity, tokens: { accessToken, refreshToken } }`. Client stores both.
2. **Authenticated requests**: Client sends `Authorization: Bearer <accessToken>`.
3. **Refresh**: When access token expires, client sends POST `/api/v1/auth/refresh` with body `{ refreshToken }`; server returns a new token pair.
4. **Logout**: POST `/api/v1/auth/logout` with `{ refreshToken }`; server revokes that refresh token (revoked tokens stored via IRevokedTokenRepository).

## Protecting a route

- **Require authentication**: Add **authMiddleware** (from `@/middlewares/auth.middleware`) before the handler. It verifies the Bearer token and sets `req.user` (decoded payload). If token is missing or invalid, it throws AuthError (401).
- **Require a role**: Add **requireRole('admin')** (or other role) from `@/middlewares/role.middleware` *after* authMiddleware. It checks `req.user.role` and throws if not allowed.

Example (see `src/routes/v1/auth.routes.ts`):

- Public: `router.post('/login', validate({ body: loginBody }), asyncHandler(AuthController.login))`.
- Protected: `router.get('/me', authMiddleware, asyncHandler(AuthController.me))`.

For admin-only: `router.delete('/admin-only', authMiddleware, requireRole('admin'), asyncHandler(Controller.method))`.

## Where auth lives

- **Controllers**: AuthController (register, login, refresh, logout, me) in `src/controllers/auth.controller.ts`; UserController has no auth in the boilerplate—add authMiddleware/requireRole on routes when you want to protect user CRUD.
- **Service**: `src/services/auth.service.ts` — register, login, refresh, logout, me; uses user repository and revoked-token repository; uses `src/utils/jwt.ts` and `src/utils/password.ts`.
- **Middlewares**: `src/middlewares/auth.middleware.ts` (Bearer → req.user), `src/middlewares/role.middleware.ts` (requireRole).

Do not duplicate token signing/verification in controllers; keep it in AuthService and jwt utils.
