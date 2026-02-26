import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { asyncHandler } from '@/utils/async-handler';
import { validate } from '@/middlewares/validate.middleware';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { registerBody, loginBody, refreshBody, logoutBody } from '@/validators/auth.validator';

const router = Router();

router.post('/register', validate({ body: registerBody }), asyncHandler(AuthController.register));

router.post('/login', validate({ body: loginBody }), asyncHandler(AuthController.login));

router.post('/refresh', validate({ body: refreshBody }), asyncHandler(AuthController.refresh));

router.post('/logout', validate({ body: logoutBody }), asyncHandler(AuthController.logout));

router.get('/me', authMiddleware, asyncHandler(AuthController.me));

export { router as authRoutes };
