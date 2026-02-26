import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function main() {
  const hashedPassword = await bcrypt.hash('SeedPassword123', SALT_ROUNDS);

  const users = [
    { email: 'alice@example.com', name: 'Alice Johnson', password: hashedPassword, role: 'user' },
    { email: 'bob@example.com', name: 'Bob Smith', password: hashedPassword, role: 'user' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed completed successfully');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
