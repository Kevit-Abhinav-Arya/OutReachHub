const mongoose = require("mongoose");

const campaignMessageSchema = mongoose.Schema({
    
  
  _id: mongoose.Schema.Types.ObjectId,
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaigns', required: true, index: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },

  contactPhoneNumber: { type: String, required: true },
  messageBody: { type: String, required: true },
  messageImageUrl: { type: String },

  status: { type: String, enum: ['Sent', 'Failed'], required: true },
  sentAt: { type: Date, default: Date.now }


});

module.exports = mongoose.model('CampaignMessage',campaignMessageSchema);