import type { IRevokedTokenRepository } from '@/domain/repositories/revoked-token.repository.interface';
import { getPrismaClient } from './prisma.client';

export class PrismaRevokedTokenRepository implements IRevokedTokenRepository {
  private get prisma() {
    return getPrismaClient();
  }

  async add(jti: string, expiresAt: Date): Promise<void> {
    await this.prisma.revokedToken.upsert({
      where: { jti },
      update: { expiresAt },
      create: { jti, expiresAt },
    });
  }

  async isRevoked(jti: string): Promise<boolean> {
    const row = await this.prisma.revokedToken.findUnique({
      where: { jti },
    });
    if (!row) return false;
    return row.expiresAt > new Date();
  }
}
