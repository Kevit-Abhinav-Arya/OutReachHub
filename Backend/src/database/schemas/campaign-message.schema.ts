import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CampaignMessageDocument = CampaignMessage & Document;

@Schema({ collection: 'campaignmessages' })
export class CampaignMessage {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true })
  campaignId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Contact' })
  contactId: Types.ObjectId;

  @Prop({ type: [String], required: true })
  contactPhoneNumber: string[];

  @Prop({ required: true })
  messageBody: string;

  @Prop()
  messageImageUrl: string;

  @Prop({ required: true, enum: ['Sent', 'Failed', 'Pending', 'Delivered'] })
  status: string;

  @Prop()
  sentAt: Date;
}

export const CampaignMessageSchema =
  SchemaFactory.createForClass(CampaignMessage);

// Create indexes
CampaignMessageSchema.index({ campaignId: 1 });
CampaignMessageSchema.index({ workspaceId: 1, sentAt: -1 });
CampaignMessageSchema.index({ workspaceId: 1, contactId: 1 });
