import type { IUserRepository } from '@/domain/repositories/user.repository.interface';
import type {
  UserEntity,
  CreateUserDto,
  UpdateUserDto,
  PaginatedResult,
  PaginationParams,
  UserRole,
} from '@/domain/entities/user';
import { getPrismaClient } from './prisma.client';
import { NotFoundError, ConflictError } from '@/exceptions';
import { Prisma } from '@prisma/client';

function toEntity(row: {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}): UserEntity {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    password: row.password,
    role: row.role as UserRole,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaUserRepository implements IUserRepository {
  private get prisma() {
    return getPrismaClient();
  }

  async create(data: CreateUserDto): Promise<UserEntity> {
    try {
      const row = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: data.password,
          ...(data.role ? { role: data.role } : {}),
        },
      });
      return toEntity(row);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictError(`User with email "${data.email}" already exists`);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? toEntity(row) : null;
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<UserEntity>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: rows.map(toEntity),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: UpdateUserDto): Promise<UserEntity | null> {
    try {
      const updateData: Prisma.UserUpdateInput = {};
      if (data.name !== undefined) {
        updateData.name = data.name;
      }
      const row = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
      return toEntity(row);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError(`User with id "${id}" not found`);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}
