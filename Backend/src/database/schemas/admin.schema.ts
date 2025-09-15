import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({ collection: 'admins' })
export class Admin {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
