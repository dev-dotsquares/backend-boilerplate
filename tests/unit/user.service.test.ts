import { UserService } from '@/services/user.service';
import type { IUserRepository } from '@/domain/repositories/user.repository.interface';
import type { UserEntity } from '@/domain/entities/user';
import { ConflictError, NotFoundError } from '@/exceptions';

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

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService(mockRepo);
  });

  describe('create', () => {
    it('should create a user and return without password', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockUser);

      const result = await service.create({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@example.com');
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictError if email exists', async () => {
      mockRepo.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.create({ email: 'test@example.com', name: 'Test', password: 'pass1234' }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('findById', () => {
    it('should return user without password', async () => {
      mockRepo.findById.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');
      expect(result.id).toBe('user-1');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundError if user does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('findAll', () => {
    it('should return paginated result without passwords', async () => {
      mockRepo.findAll.mockResolvedValue({
        data: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).not.toHaveProperty('password');
    });
  });

  describe('delete', () => {
    it('should delete an existing user', async () => {
      mockRepo.delete.mockResolvedValue(true);
      await expect(service.delete('user-1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundError if user does not exist', async () => {
      mockRepo.delete.mockResolvedValue(false);
      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});
