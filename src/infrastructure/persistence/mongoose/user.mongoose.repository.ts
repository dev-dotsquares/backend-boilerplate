import type { IUserRepository } from '@/domain/repositories/user.repository.interface';
import type {
  UserEntity,
  CreateUserDto,
  UpdateUserDto,
  PaginatedResult,
  PaginationParams,
  UserRole,
} from '@/domain/entities/user';
import { UserModel, type IUserDocument } from './models/user.model';
import { ConflictError } from '@/exceptions';
import mongoose from 'mongoose';

function toEntity(doc: IUserDocument): UserEntity {
  return {
    id: (doc._id as mongoose.Types.ObjectId).toString(),
    email: doc.email,
    name: doc.name,
    password: doc.password,
    role: doc.role as UserRole,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongooseUserRepository implements IUserRepository {
  async create(data: CreateUserDto): Promise<UserEntity> {
    try {
      const doc = await UserModel.create({
        email: data.email,
        name: data.name,
        password: data.password,
        ...(data.role ? { role: data.role } : {}),
      });
      return toEntity(doc);
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictError(`User with email "${data.email}" already exists`);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await UserModel.findById(id);
    return doc ? toEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() });
    return doc ? toEntity(doc) : null;
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<UserEntity>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      UserModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(),
    ]);

    return {
      data: docs.map(toEntity),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: UpdateUserDto): Promise<UserEntity | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    );
    return doc ? toEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  }
}
