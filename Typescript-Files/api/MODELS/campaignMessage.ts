import mongoose, { Schema, Model } from "mongoose";
import { ICampaignMessage } from "../../types/types";

const campaignMessageSchema: Schema<ICampaignMessage> = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaigns",
    required: true,
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contacts",
    required: true,
  },
  contactPhoneNumber: {
    type: String,
    required: true,
  },
  messageBody: {
    type: String,
    required: true,
  },
  messageImageUrl: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["Sent", "Failed"],
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

campaignMessageSchema.index({ campaignId: 1 });
campaignMessageSchema.index({ workspaceId: 1, sentAt: -1 });
campaignMessageSchema.index({ workspaceId: 1, contactId: 1 });

const CampaignMessage: Model<ICampaignMessage> =
  mongoose.model<ICampaignMessage>("CampaignMessage", campaignMessageSchema);

export default CampaignMessage;
