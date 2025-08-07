const mongoose = require("mongoose");
const { Unique } = require("typeorm");

const contactSchema = mongoose.Schema({

    
    
    _id: mongoose.Schema.Types.ObjectId,
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true,unique:true }, 
    tags: [String], 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contacts',contactSchema);