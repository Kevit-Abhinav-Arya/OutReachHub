const mongoose = require('mongoose');

const CampaignsSchema = mongoose.Schema({
    
  _id: mongoose.Schema.Types.ObjectId,
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  name: { type: String, required: true },
  targetTags: [String], 
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
  status: { type: String, enum: ['Draft', 'Running', 'Completed', 'Failed'], default: 'Draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  launchedAt: { type: Date } 

})

module.exports =  mongoose.model('Campaigns',CampaignsSchema);