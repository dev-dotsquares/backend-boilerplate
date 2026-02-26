import jwt, { type SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { config } from '@/config';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  jti: string;
}

export const signAccessToken = (payload: JwtPayload): string => {
  const options = { expiresIn: config.jwt.expiresIn } as SignOptions;
  return jwt.sign(payload, config.jwt.secret, options);
};

export const signRefreshToken = (payload: JwtPayload): string => {
  const payloadWithJti: RefreshTokenPayload = { ...payload, jti: randomUUID() };
  const options = { expiresIn: config.jwt.refreshExpiresIn } as SignOptions;
  return jwt.sign(payloadWithJti, config.jwt.refreshSecret, options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
};
