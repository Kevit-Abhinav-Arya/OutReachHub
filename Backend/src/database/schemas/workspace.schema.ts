import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkspaceDocument = Workspace & Document;

@Schema({ collection: 'workspaces' })
export class Workspace {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
