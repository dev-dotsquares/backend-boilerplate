import type { IUserRepository } from '@/domain/repositories/user.repository.interface';
import type { SafeUserEntity } from '@/domain/entities/user';
import { toSafeUser } from '@/domain/entities/user';
import { ConflictError, AuthError, NotFoundError } from '@/exceptions';
import { hashPassword, comparePassword } from '@/utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: SafeUserEntity;
  tokens: AuthTokens;
}

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async register(email: string, name: string, password: string): Promise<AuthResponse> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError(`User with email "${email}" already exists`);
    }

    const hashedPassword = await hashPassword(password);
    const user = await this.userRepository.create({
      email,
      name,
      password: hashedPassword,
    });

    const payload = { id: user.id, email: user.email, role: user.role };
    return {
      user: toSafeUser(user),
      tokens: {
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
      },
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthError('Invalid email or password');
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new AuthError('Invalid email or password');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    return {
      user: toSafeUser(user),
      tokens: {
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
      },
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      const user = await this.userRepository.findById(decoded.id);
      if (!user) {
        throw new AuthError('User no longer exists');
      }

      const payload = { id: user.id, email: user.email, role: user.role };
      return {
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('Invalid or expired refresh token');
    }
  }

  async me(userId: string): Promise<SafeUserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return toSafeUser(user);
  }
}
