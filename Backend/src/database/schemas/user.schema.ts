import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Workspace } from './workspace.schema';

export type UserDocument = User & Document;

@Schema()
export class WorkspaceAccess {
  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true })
  workspaceName: string;

  @Prop({ required: true, enum: ['Editor', 'Viewer'] })
  role: string;
}

@Schema({ collection: 'users' })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [WorkspaceAccess], default: [] })
  workspaces: WorkspaceAccess[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Create indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ 'workspaces.workspaceId': 1 });
