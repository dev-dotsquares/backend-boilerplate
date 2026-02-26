import mongoose, { Schema, type Document } from 'mongoose';

export interface IRevokedTokenDocument extends Document {
  jti: string;
  expiresAt: Date;
}

const revokedTokenSchema = new Schema<IRevokedTokenDocument>(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: false,
    collection: 'revoked_tokens',
  },
);

export const RevokedTokenModel = mongoose.model<IRevokedTokenDocument>(
  'RevokedToken',
  revokedTokenSchema,
);
