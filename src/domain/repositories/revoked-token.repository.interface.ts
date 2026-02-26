/**
 * Repository for revoked refresh tokens (logout blacklist).
 * Used to invalidate refresh tokens until they expire.
 */
export interface IRevokedTokenRepository {
  add(jti: string, expiresAt: Date): Promise<void>;
  isRevoked(jti: string): Promise<boolean>;
}
