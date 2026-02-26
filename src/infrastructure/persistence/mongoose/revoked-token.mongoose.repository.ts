import type { IRevokedTokenRepository } from '@/domain/repositories/revoked-token.repository.interface';
import { RevokedTokenModel } from './models/revoked-token.model';

export class MongooseRevokedTokenRepository implements IRevokedTokenRepository {
  async add(jti: string, expiresAt: Date): Promise<void> {
    await RevokedTokenModel.findOneAndUpdate({ jti }, { jti, expiresAt }, { upsert: true });
  }

  async isRevoked(jti: string): Promise<boolean> {
    const doc = await RevokedTokenModel.findOne({ jti }).lean();
    if (!doc) return false;
    return doc.expiresAt > new Date();
  }
}
