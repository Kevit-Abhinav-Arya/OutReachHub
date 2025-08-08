const mongoose = require('mongoose');

const Admin = require('./admin');
const User = require('./userModel');
const Workspace = require('./workspaceModel');
const Contact = require('./contactModel');
const Message = require('./messageModel');
const Campaign = require('./campaignsModel');
const CampaignMessage = require('./campaignMessage');

// ------------------------------------------------------------------
// ADMIN PORTAL QUERIES
// ------------------------------------------------------------------

//Admin Authentication
const adminQueries = {
  findAdminByEmail: async (email) => {
    return await Admin.findOne({ email });
  },

  // Create new admin just to add an admin at first place
  createAdmin: async (adminData) => {
    const admin = new Admin({
      _id: new mongoose.Types.ObjectId(),
      ...adminData
    });
    return await admin.save();
  }
};

//Workspace Module
const workspaceQueries = {

  listWorkspaces: async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return await Workspace.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  getWorkspacesCount: async () => {
    return await Workspace.countDocuments();
  },

  createWorkspace: async (workspaceData) => {
    const workspace = new Workspace({
      _id: new mongoose.Types.ObjectId(),
      ...workspaceData
    });
    return await workspace.save();
  },

  getWorkspaceById: async (workspaceId) => {
    return await Workspace.findById(workspaceId);
  },

  updateWorkspace: async (workspaceId, updateData) => {
    return await Workspace.findByIdAndUpdate(
      workspaceId,
      { ...updateData },
      { new: true }
    );
  },

  // Delete workspace
  deleteWorkspace: async (workspaceId) => {
    return await Workspace.findByIdAndDelete(workspaceId);
  }
};

//Workspace users module
const workspaceUserQueries = {
  listWorkspaceUsers: async (workspaceId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return await User.find({
      'workspaces.workspaceId': workspaceId
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
  },

  getWorkspaceUsersCount: async (workspaceId) => {
    return await User.countDocuments({
      'workspaces.workspaceId': workspaceId
    });
  },

  createWorkspaceUser: async (userData) => {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      ...userData
    });
    return await user.save();
  },

  getWorkspaceUserById: async (userId) => {
    return await User.findById(userId).populate('workspaces.workspaceId');
  },

  updateWorkspaceUser: async (userId, updateData) => {
    return await User.findByIdAndUpdate(
      userId,
      { ...updateData },
      { new: true }
    );
  },

  deleteWorkspaceUser: async (userId) => {
    return await User.findByIdAndDelete(userId);
  },

  addUserToWorkspace: async (userId, workspaceId, role) => {
    return await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          workspaces: { workspaceId, role }
        }
      },
      { new: true }
    );
  },

  // Remove user from workspace
  removeUserFromWorkspace: async (userId, workspaceId) => {
    return await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          workspaces: { workspaceId }
        }
      },
      { new: true }
    );
  }
};