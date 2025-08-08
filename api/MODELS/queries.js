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

// ------------------------------------------------------------------
// OUTREACHHUB PORTAL QUERIES
// ------------------------------------------------------------------

//User Authentication
const userAuthQueries = {

  findUserByEmail: async (email) => {
    return await User.findOne({ email }).populate('workspaces.workspaceId');
  },

  getUserWorkspaces: async (userId) => {
    return await User.findById(userId).populate('workspaces.workspaceId');
  }
};

//Home module, analytical datas
//chart data
const analyticsQueries = {

  getCampaignsPerDay: async (workspaceId, startDate, endDate) => {
    return await Campaign.aggregate([
      {
        $match: {
          workspaceId: new mongoose.Types.ObjectId(workspaceId),
          launchedAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$launchedAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
  },

  // Getting message sent pertype per day
  getMessagesSentPerTypePerDay: async (workspaceId, startDate, endDate) => {
    return await CampaignMessage.aggregate([
      {
        $match: {
          workspaceId: new mongoose.Types.ObjectId(workspaceId),
          sentAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $addFields: {
          messageType: {
            $cond: {
              if: { $ne: ["$messageImageUrl", null] },
              then: "Text & Image",
              else: "Text"
            }
          }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$sentAt"
              }
            },
            type: "$messageType"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1, "_id.type": 1 } }
    ]);
  },

  //Number of contacts reached per day
  getContactsReachedPerDay: async (workspaceId, startDate, endDate) => {
    return await CampaignMessage.aggregate([
      {
        $match: {
          workspaceId: new mongoose.Types.ObjectId(workspaceId),
          sentAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$sentAt"
              }
            }
          },
          uniqueContacts: { $addToSet: "$contactPhoneNumber" }
        }
      },
      {
        $project: {
          _id: 1,
          count: { $size: "$uniqueContacts" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
  },

  // Table Data

  //list of 5 recent campaigns
  getRecentCampaigns: async (workspaceId) => {
    return await Campaign.find({ workspaceId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
  },

  //list of top 5 tags with most contacts
  getTopContactTags: async (workspaceId) => {
    return await Contact.aggregate([
      {
        $match: {
          workspaceId: new mongoose.Types.ObjectId(workspaceId)
        }
      },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          contactCount: { $sum: 1 }
        }
      },
      { $sort: { contactCount: -1 } },
      { $limit: 5 }
    ]);
  }
};