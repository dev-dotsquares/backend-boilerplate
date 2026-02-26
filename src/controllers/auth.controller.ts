import type { Request, Response } from 'express';
import { container } from '@/container';
import { sendSuccess } from '@/utils/response';
import { HttpStatus } from '@/constants/http';

const { authService } = container;

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const { email, name, password } = req.body;
    const result = await authService.register(email, name, password);
    sendSuccess(res, result, 'User registered successfully', HttpStatus.CREATED);
  }

  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result, 'Login successful');
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);
    sendSuccess(res, tokens, 'Token refreshed successfully');
  }

  static async me(req: Request, res: Response): Promise<void> {
    const user = await authService.me(req.user!.id);
    sendSuccess(res, user, 'User profile retrieved');
  }
}
