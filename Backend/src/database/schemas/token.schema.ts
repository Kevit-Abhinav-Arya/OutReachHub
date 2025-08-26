import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema({ collection: 'tokens' })
export class Token {
  _id: Types.ObjectId;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['admin', 'user'] })
  userType: string;

  @Prop({ type: Types.ObjectId })
  workspaceId?: Types.ObjectId;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isRevoked: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

// Create indexes for performance
TokenSchema.index({ token: 1 }, { unique: true });
TokenSchema.index({ userId: 1 });
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
TokenSchema.index({ isRevoked: 1 });
