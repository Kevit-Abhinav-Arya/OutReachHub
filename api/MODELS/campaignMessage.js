const mongoose = require("mongoose");

const campaignMessageSchema = mongoose.Schema({
    
  
  _id: mongoose.Schema.Types.ObjectId,
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaigns', required: true, index: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts' },

  contactPhoneNumber: { type: String, required: true },
  messageBody: { type: String, required: true },
  messageImageUrl: { type: String },

  status: { type: String, enum: ['Sent', 'Failed'], required: true },
  sentAt: { type: Date, default: Date.now }


});

campaignMessageSchema.index({ campaignId: 1 });
campaignMessageSchema.index({ workspaceId: 1, sentAt: -1 });
campaignMessageSchema.index({ workspaceId: 1, contactId: 1 });

module.exports = mongoose.model('CampaignMessage',campaignMessageSchema);