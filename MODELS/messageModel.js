const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({

    
    
    _id: mongoose.Schema.Types.ObjectId,
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['Text', 'Text & Image'], required: true },
    body: { type: String, required: true },
    imageUrl: { type: String }, 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
    
});
messageSchema.index({ workspaceId: 1 });

module.exports = mongoose.model('Message',messageSchema);