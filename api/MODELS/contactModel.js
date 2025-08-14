const mongoose = require("mongoose");

const contactSchema = mongoose.Schema({

    
    
    _id: mongoose.Schema.Types.ObjectId,
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true,unique:true }, 
    tags: [String], 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

contactSchema.index({ workspaceId: 1, phoneNumber: 1 }, { unique: true });
contactSchema.index({ workspaceId: 1, tags: 1 });
contactSchema.index({ workspaceId: 1, createdAt: -1 });

module.exports = mongoose.model('Contacts',contactSchema);