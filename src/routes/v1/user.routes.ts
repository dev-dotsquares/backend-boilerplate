import { Router } from 'express';
import { UserController } from '@/controllers/user.controller';
import { asyncHandler } from '@/utils/async-handler';
import { validate } from '@/middlewares/validate.middleware';
import {
  createUserBody,
  updateUserBody,
  idParam,
  listUsersQuery,
} from '@/validators/user.validator';

const router = Router();

router.post('/', validate({ body: createUserBody }), asyncHandler(UserController.create));

router.get('/', validate({ query: listUsersQuery }), asyncHandler(UserController.findAll));

router.get('/:id', validate({ params: idParam }), asyncHandler(UserController.findById));

router.patch(
  '/:id',
  validate({ params: idParam, body: updateUserBody }),
  asyncHandler(UserController.update),
);

router.delete('/:id', validate({ params: idParam }), asyncHandler(UserController.delete));

export { router as userRoutes };
