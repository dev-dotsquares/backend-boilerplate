import type {
  UserEntity,
  CreateUserDto,
  UpdateUserDto,
  PaginatedResult,
  PaginationParams,
} from '@/domain/entities/user';

export interface IUserRepository {
  create(data: CreateUserDto): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(params: PaginationParams): Promise<PaginatedResult<UserEntity>>;
  update(id: string, data: UpdateUserDto): Promise<UserEntity | null>;
  delete(id: string): Promise<boolean>;
}
