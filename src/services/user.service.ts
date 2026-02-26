import type { IUserRepository } from '@/domain/repositories/user.repository.interface';
import type {
  CreateUserDto,
  UpdateUserDto,
  PaginatedResult,
  PaginationParams,
  SafeUserEntity,
} from '@/domain/entities/user';
import { toSafeUser } from '@/domain/entities/user';
import { ConflictError, NotFoundError } from '@/exceptions';
import { hashPassword } from '@/utils/password';

/**
 * Business logic layer for User operations.
 * Depends only on the IUserRepository interface -- completely unaware of the underlying database.
 */
export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async create(data: CreateUserDto): Promise<SafeUserEntity> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError(`User with email "${data.email}" already exists`);
    }
    const hashedPassword = await hashPassword(data.password);
    const user = await this.userRepository.create({ ...data, password: hashedPassword });
    return toSafeUser(user);
  }

  async findById(id: string): Promise<SafeUserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id "${id}" not found`);
    }
    return toSafeUser(user);
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<SafeUserEntity>> {
    const result = await this.userRepository.findAll(params);
    return {
      ...result,
      data: result.data.map(toSafeUser),
    };
  }

  async update(id: string, data: UpdateUserDto): Promise<SafeUserEntity> {
    const user = await this.userRepository.update(id, data);
    if (!user) {
      throw new NotFoundError(`User with id "${id}" not found`);
    }
    return toSafeUser(user);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`User with id "${id}" not found`);
    }
  }
}
