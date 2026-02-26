import type { Request, Response } from 'express';
import { container } from '@/container';
import { sendSuccess } from '@/utils/response';
import { HttpStatus } from '@/constants/http';

const { userService } = container;

export class UserController {
  static async create(req: Request, res: Response): Promise<void> {
    const user = await userService.create(req.body);
    sendSuccess(res, user, 'User created successfully', HttpStatus.CREATED);
  }

  static async findAll(req: Request, res: Response): Promise<void> {
    const validated = req.validated?.query as { page: number; limit: number } | undefined;
    const page = validated?.page ?? Math.max(1, Number(req.query['page']) || 1);
    const limit = validated?.limit ?? Math.min(100, Math.max(1, Number(req.query['limit']) || 10));
    const result = await userService.findAll({ page, limit });
    sendSuccess(res, result, 'Users retrieved successfully');
  }

  static async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const user = await userService.findById(id);
    sendSuccess(res, user, 'User retrieved successfully');
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const user = await userService.update(id, req.body);
    sendSuccess(res, user, 'User updated successfully');
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    await userService.delete(id);
    sendSuccess(res, null, 'User deleted successfully');
  }
}
