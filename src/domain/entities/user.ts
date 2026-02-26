export type UserRole = 'user' | 'admin';

export interface UserEntity {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/** User without sensitive fields -- safe for API responses */
export type SafeUserEntity = Omit<UserEntity, 'password'>;

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: UserRole | undefined;
}

export interface UpdateUserDto {
  name?: string | undefined;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const toSafeUser = (user: UserEntity): SafeUserEntity => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safe } = user;
  return safe;
};
