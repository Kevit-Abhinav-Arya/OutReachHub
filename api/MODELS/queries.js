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

 listWorkspaces: async (options = {}) => {
    const { page = 1, limit = 10, search = '' } = options;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const [workspaces, total] = await Promise.all([
      Workspace.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Workspace.countDocuments(query)
    ]);

    return { workspaces, total };
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
    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { ...updateData },
      { new: true }
    );

    if (updateData.name && updatedWorkspace) {
      await User.updateMany(
        { 'workspaces.workspaceId': workspaceId.toString() },
        { 
          $set: { 
            'workspaces.$.workspaceName': updateData.name 
          }
        }
      );
      console.log("user updated");
    }

    return updatedWorkspace;
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
    const query = { 'workspaces.workspaceId': workspaceId };
    
    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      User.countDocuments(query),

      

    ]);
    
    return { users, total };
  },

  getWorkspaceUsersCount: async (workspaceId) => {
    return await User.countDocuments({
      'workspaces.workspaceId': workspaceId
    });
  },

createWorkspaceUser: async (userData) => {
    const { workspaceId, role, workspaceName, ...userInfo } = userData;
    
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      ...userInfo,
      workspaces: [{
        workspaceId: workspaceId,
        workspaceName: workspaceName,
        role: role
      }]
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
//contacts module
const contactQueries = {
  listContacts: async (workspaceId, page = 1, limit = 10, tagFilter = null) => {
    const skip = (page - 1) * limit;
    let query = { workspaceId };
    
    if (tagFilter) {
      query.tags = { $in: [tagFilter] };
    }

    return await Contact.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

 

  createContact: async (contactData) => {
    const contact = new Contact({
      _id: new mongoose.Types.ObjectId(),
      updatedAt: new Date(),
      ...contactData
    });
    return await contact.save();
  },

  getContactById: async (contactId, workspaceId) => {
    return await Contact.findOne({
      _id: contactId,
      workspaceId
    }).populate('createdBy', 'name email');
  },

  updateContact: async (contactId, workspaceId, updateData) => {
    return await Contact.findOneAndUpdate(
      { _id: contactId, workspaceId },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
  },

  deleteContact: async (contactId, workspaceId) => {
    return await Contact.findOneAndDelete({
      _id: contactId,
      workspaceId
    });
  },

  // get contacts by phone number for campaigns
  getContactsByPhoneNumbers: async (workspaceId, phoneNumbers) => {
    return await Contact.find({
      workspaceId,
      phoneNumber: { $in: phoneNumbers }
    });
  },

  // get contacts by tags for campaigns
  getContactsByTags: async (workspaceId, tags) => {
    return await Contact.find({
      workspaceId,
      tags: { $in: tags }
    });
  },

  // search querry
  searchContacts: async (workspaceId, searchTerm, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return await Contact.find({
      workspaceId,
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { phoneNumber: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
  }
};

//Message template MOdule
const messageQueries = {
  listMessages: async (workspaceId, page = 1, limit = 10, typeFilter = null) => {
    const skip = (page - 1) * limit;
    let query = { workspaceId };
    
    if (typeFilter) {
      query.type = typeFilter;
    }

    return await Message.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  getMessagesCount: async (workspaceId, typeFilter = null) => {
    let query = { workspaceId };
    if (typeFilter) {
      query.type = typeFilter;
    }
    return await Message.countDocuments(query);
  },

  createMessage: async (messageData) => {
    const message = new Message({
      _id: new mongoose.Types.ObjectId(),
      ...messageData
    });
    return await message.save();
  },

  getMessageById: async (messageId, workspaceId) => {
    return await Message.findOne({
      _id: messageId,
      workspaceId
    }).populate('createdBy', 'name email');
  },

  updateMessage: async (messageId, workspaceId, updateData) => {
    return await Message.findOneAndUpdate(
      { _id: messageId, workspaceId },
      updateData,
      { new: true }
    );
  },

  deleteMessage: async (messageId, workspaceId) => {
    return await Message.findOneAndDelete({
      _id: messageId,
      workspaceId
    });
  }
};

//campaign module

const campaignQueries = {
  listCampaigns: async (workspaceId, page = 1, limit = 10, statusFilter = null) => {
    const skip = (page - 1) * limit;
    let query = { workspaceId };
    
    if (statusFilter) {
      query.status = statusFilter;
    }

    return await Campaign.find(query)
      .populate('templateId', 'name type')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  getCampaignsCount: async (workspaceId, statusFilter = null) => {
    let query = { workspaceId };
    if (statusFilter) {
      query.status = statusFilter;
    }
    return await Campaign.countDocuments(query);
  },

  
  createCampaign: async (campaignData) => {
    const campaign = new Campaign({
      _id: new mongoose.Types.ObjectId(),
      status: 'Draft',
      ...campaignData
    });
    return await campaign.save();
  },

  getCampaignById: async (campaignId, workspaceId) => {
    return await Campaign.findOne({
      _id: campaignId,
      workspaceId
    })
    .populate('templateId')
    .populate('createdBy', 'name email');
  },

  //updating campaign only when it is in draft state

  updateCampaign: async (campaignId, workspaceId, updateData) => {
    return await Campaign.findOneAndUpdate(
      { 
        _id: campaignId, 
        workspaceId,
        status: 'Draft' 
      },
      updateData,
      { new: true }
    );
  },

  deleteCampaign: async (campaignId, workspaceId) => {
    return await Campaign.findOneAndDelete({
      _id: campaignId,
      workspaceId
    });
  },

  // Copy campaign 
  copyCampaign: async (campaignId, workspaceId, newName) => {
    const originalCampaign = await Campaign.findOne({
      _id: campaignId,
      workspaceId
    });

    if (!originalCampaign) return null;

    const copiedCampaign = new Campaign({
      _id: new mongoose.Types.ObjectId(),
      workspaceId: originalCampaign.workspaceId,
      name: newName,
      targetTags: [...originalCampaign.targetTags],
      templateId: originalCampaign.templateId,
      status: 'Draft',
      createdBy: originalCampaign.createdBy,
      createdAt: new Date()
    });

    return await copiedCampaign.save();
  },

  // Launch campaign 
  launchCampaign: async (campaignId, workspaceId) => {
    return await Campaign.findOneAndUpdate(
      { 
        _id: campaignId, 
        workspaceId,
        status: 'Draft'
      },
      { 
        status: 'Running',
        launchedAt: new Date()
      },
      { new: true }
    );
  },

  // Update campaign status
  updateCampaignStatus: async (campaignId, status) => {
    return await Campaign.findByIdAndUpdate(
      campaignId,
      { status },
      { new: true }
    );
  },

};

//Campaign Message Module
const campaignMessageQueries = {

  createCampaignMessage: async (messageData) => {
    const campaignMessage = new CampaignMessage({
      _id: new mongoose.Types.ObjectId(),
      sentAt: new Date(),
      ...messageData
    });
    return await campaignMessage.save();
  },



  getCampaignMessages: async (campaignId, workspaceId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return await CampaignMessage.find({
      campaignId,
      workspaceId
    })
    .sort({ sentAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
  },

  getCampaignMessagesCount: async (campaignId, workspaceId) => {
    return await CampaignMessage.countDocuments({
      campaignId,
      workspaceId
    });
  },

  getCampaignMessagesByContact: async (workspaceId, contactId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return await CampaignMessage.find({
      workspaceId,
      contactId
    })
    .populate('campaignId', 'name')
    .sort({ sentAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
  }
};

// ------------------------------------------------------------------
// UTILITY QUERIES
// ------------------------------------------------------------------


const utilityQueries = {

  // Check if user has access to workspace
  checkUserWorkspaceAccess: async (userId, workspaceId) => {
    const user = await User.findOne({
      _id: userId,
      'workspaces.workspaceId': workspaceId
    });
    
    if (!user) return null;
    
    const workspace = user.workspaces.find(
      ws => ws.workspaceId.toString() === workspaceId.toString()
    );
    
    return workspace ? workspace.role : null;
  },

  // gives all the tags in the workspace
  getWorkspaceTags: async (workspaceId) => {
    return await Contact.aggregate([
      {
        $match: {
          workspaceId: new mongoose.Types.ObjectId(workspaceId)
        }
      },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags"
        }
      },
      { $sort: { "_id": 1 } }
    ]);
  },

  // Check if phone number exists in workspace
  checkPhoneNumberExists: async (workspaceId, phoneNumber) => {
    let query = { workspaceId, phoneNumber };
   
    return await Contact.findOne(query);
  }
};

module.exports = {
  adminQueries,
  workspaceQueries,
  workspaceUserQueries,
  userAuthQueries,
  analyticsQueries,
  contactQueries,
  messageQueries,
  campaignQueries,
  campaignMessageQueries,
  utilityQueries
};