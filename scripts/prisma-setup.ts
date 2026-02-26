import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const databaseUse = process.env['DATABASE_USE'] ?? 'postgres';
const prismaDir = path.resolve(__dirname, '..', 'prisma');
const targetSchema = path.join(prismaDir, 'schema.prisma');

const schemaMap: Record<string, string> = {
  postgres: path.join(prismaDir, 'schema.postgres.prisma'),
  mysql: path.join(prismaDir, 'schema.mysql.prisma'),
};

const sourceSchema = schemaMap[databaseUse];

if (!sourceSchema) {
  if (databaseUse === 'mongo') {
    // eslint-disable-next-line no-console
    console.log('DATABASE_USE=mongo -- Prisma schema not needed. Skipping.');
    process.exit(0);
  }
  // eslint-disable-next-line no-console
  console.error(`Unknown SQL provider: ${databaseUse}. Expected postgres or mysql.`);
  process.exit(1);
}

if (!fs.existsSync(sourceSchema)) {
  // eslint-disable-next-line no-console
  console.error(`Schema file not found: ${sourceSchema}`);
  process.exit(1);
}

fs.copyFileSync(sourceSchema, targetSchema);
// eslint-disable-next-line no-console
console.log(
  `Prisma schema set to ${databaseUse} provider (copied ${path.basename(sourceSchema)} -> schema.prisma)`,
);
