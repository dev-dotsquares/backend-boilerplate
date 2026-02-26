import { config } from '@/config';
import type { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { PrismaUserRepository } from '@/infrastructure/persistence/prisma/user.prisma.repository';
import { MongooseUserRepository } from '@/infrastructure/persistence/mongoose/user.mongoose.repository';
import { UserService } from '@/services/user.service';
import { AuthService } from '@/services/auth.service';

/**
 * Selects the correct repository implementation based on the configured database provider.
 * Adding a new provider only requires a new case here and its repository class.
 */
function createUserRepository(): IUserRepository {
  switch (config.database.use) {
    case 'postgres':
    case 'mysql':
      return new PrismaUserRepository();
    case 'mongo':
      return new MongooseUserRepository();
  }
}

const userRepository = createUserRepository();
const userService = new UserService(userRepository);
const authService = new AuthService(userRepository);

export const container = {
  userRepository,
  userService,
  authService,
};
