import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CampaignDocument = Campaign & Document;

@Schema({ collection: 'campaigns' })
export class Campaign {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop([String])
  targetTags: string[];

  @Prop({ type: Types.ObjectId, ref: 'Message', required: true })
  templateId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['Draft', 'Running', 'Completed', 'Failed'],
    default: 'Draft',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  launchedAt: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

// Create indexes
CampaignSchema.index({ workspaceId: 1, status: 1 });
CampaignSchema.index({ workspaceId: 1, createdAt: -1 });
