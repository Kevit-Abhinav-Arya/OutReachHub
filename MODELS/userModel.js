const mongoose = require("mongoose");

const userSchema = mongoose.Schema({

    
  _id: mongoose.Schema.Types.ObjectId,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  workspaces: [ 
    {
      workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
      role: { type: String, enum: ['Editor', 'Viewer'], required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }

    
    
});

module.exports = mongoose.model('User',userSchema);