import { AuthService } from '@/services/auth.service';
import type { IUserRepository } from '@/domain/repositories/user.repository.interface';
import type { IRevokedTokenRepository } from '@/domain/repositories/revoked-token.repository.interface';
import type { UserEntity } from '@/domain/entities/user';
import { ConflictError, AuthError } from '@/exceptions';
import * as passwordUtil from '@/utils/password';

jest.mock('@/utils/password');

const mockedHash = passwordUtil.hashPassword as jest.MockedFunction<
  typeof passwordUtil.hashPassword
>;
const mockedCompare = passwordUtil.comparePassword as jest.MockedFunction<
  typeof passwordUtil.comparePassword
>;

const mockUser: UserEntity = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  password: '$2a$12$hashedpassword',
  role: 'user',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockRepo: jest.Mocked<IUserRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockRevokedTokenRepo: jest.Mocked<IRevokedTokenRepository> = {
  add: jest.fn().mockResolvedValue(undefined),
  isRevoked: jest.fn().mockResolvedValue(false),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRevokedTokenRepo.isRevoked.mockResolvedValue(false);
    service = new AuthService(mockRepo, mockRevokedTokenRepo);
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockedHash.mockResolvedValue('$2a$12$hashedpassword');
      mockRepo.create.mockResolvedValue(mockUser);

      const result = await service.register('test@example.com', 'Test User', 'password123');

      expect(result.user).not.toHaveProperty('password');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
      expect(mockedHash).toHaveBeenCalledWith('password123');
    });

    it('should throw ConflictError if email already taken', async () => {
      mockRepo.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register('test@example.com', 'Test User', 'password123'),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    it('should return user and tokens on valid credentials', async () => {
      mockRepo.findByEmail.mockResolvedValue(mockUser);
      mockedCompare.mockResolvedValue(true);

      const result = await service.login('test@example.com', 'password123');

      expect(result.user).not.toHaveProperty('password');
      expect(result.tokens.accessToken).toBeDefined();
    });

    it('should throw AuthError on invalid email', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      await expect(service.login('wrong@example.com', 'password123')).rejects.toThrow(AuthError);
    });

    it('should throw AuthError on wrong password', async () => {
      mockRepo.findByEmail.mockResolvedValue(mockUser);
      mockedCompare.mockResolvedValue(false);

      await expect(service.login('test@example.com', 'wrongpass')).rejects.toThrow(AuthError);
    });
  });

  describe('me', () => {
    it('should return user profile without password', async () => {
      mockRepo.findById.mockResolvedValue(mockUser);

      const result = await service.me('user-1');
      expect(result.id).toBe('user-1');
      expect(result).not.toHaveProperty('password');
    });
  });
});
