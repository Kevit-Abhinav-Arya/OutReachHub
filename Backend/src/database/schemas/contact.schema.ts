import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContactDocument = Contact & Document;

@Schema({ collection: 'contacts' })
export class Contact {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  company: string;

  @Prop([String])
  tags: string[];

  @Prop()
  notes: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);

// Create indexes for multi-tenant isolation and performance
ContactSchema.index({ workspaceId: 1, phoneNumber: 1 }, { unique: true });
ContactSchema.index({ workspaceId: 1, tags: 1 });
ContactSchema.index({ workspaceId: 1, createdAt: -1 });
