const mongoose = require("mongoose");

const Admin = require("./admin");
const User = require("./userModel");
const Workspace = require("./workspaceModel");
const Contact = require("./contactModel");
const Message = require("./messageModel");
const Campaign = require("./campaignsModel");
const CampaignMessage = require("./campaignMessage");

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
      ...adminData,
    });
    return await admin.save();
  },
};

//Workspace Module
const workspaceQueries = {
  listWorkspaces: async (options = {}) => {
    const { page = 1, limit = 10, search = "" } = options;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    const [workspaces, total] = await Promise.all([
      Workspace.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Workspace.countDocuments(query),
    ]);

    return { workspaces, total };
  },
  getWorkspacesCount: async () => {
    return await Workspace.countDocuments();
  },

  createWorkspace: async (workspaceData) => {
    const workspace = new Workspace({
      _id: new mongoose.Types.ObjectId(),
      ...workspaceData,
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
        { "workspaces.workspaceId": workspaceId.toString() },
        {
          $set: {
            "workspaces.$.workspaceName": updateData.name,
          },
        }
      );
      console.log("user updated");
    }

    return updatedWorkspace;
  },

  // Delete workspace
  deleteWorkspace: async (workspaceId) => {
    return await Workspace.findByIdAndDelete(workspaceId);
  },
};

//Workspace users module
const workspaceUserQueries = {
  listWorkspaceUsers: async (workspaceId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const query = { "workspaces.workspaceId": workspaceId };

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      User.countDocuments(query),
    ]);

    return { users, total };
  },

  getWorkspaceUsersCount: async (workspaceId) => {
    return await User.countDocuments({
      "workspaces.workspaceId": workspaceId,
    });
  },

  createWorkspaceUser: async (userData) => {
    const { workspaceId, role, workspaceName, ...userInfo } = userData;

    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      ...userInfo,
      workspaces: [
        {
          workspaceId: workspaceId,
          workspaceName: workspaceName,
          role: role,
        },
      ],
    });
    return await user.save();
  },

  getWorkspaceUserById: async (userId) => {
    return await User.findById(userId).populate("workspaces.workspaceId");
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

  addUserToWorkspace: async (userId, workspaceId, workspaceName, role) => {
    return await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          workspaces: { workspaceId, workspaceName, role },
        },
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
          workspaces: { workspaceId },
        },
      },
      { new: true }
    );
  },
};

// ------------------------------------------------------------------
// USER MANAGEMENT QUERIES
// ------------------------------------------------------------------

const userManagementQueries = {
  createUser: async (userData) => {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      workspaces: [],
      ...userData,
    });
    return await user.save();
  },

  getAllUsers: async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return await User.find()
      .populate("workspaces.workspaceId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  getAllUsersCount: async () => {
    return await User.countDocuments();
  },

  getUserById: async (userId) => {
    return await User.findById(userId).populate(
      "workspaces.workspaceId",
      "name"
    );
  },

  updateUser: async (userId, updateData) => {
    return await User.findByIdAndUpdate(
      userId,
      { ...updateData },
      { new: true }
    ).populate("workspaces.workspaceId", "name");
  },

  deleteUser: async (userId) => {
    return await User.findByIdAndDelete(userId);
  },

  searchUsers: async (searchTerm, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .populate("workspaces.workspaceId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  getUserByEmail: async (email) => {
    return await User.findOne({ email }).populate(
      "workspaces.workspaceId",
      "name"
    );
  },
};

// ------------------------------------------------------------------
// OUTREACHHUB PORTAL QUERIES
// ------------------------------------------------------------------

//User Authentication
const userAuthQueries = {
  findUserByEmail: async (email) => {
    return await User.findOne({ email }).populate("workspaces.workspaceId");
  },

  getUserWorkspaces: async (userId) => {
    return await User.findById(userId).populate("workspaces.workspaceId");
  },
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
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$launchedAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
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
            $lte: new Date(endDate),
          },
        },
      },
      {
        $addFields: {
          messageType: {
            $cond: {
              if: { $ne: ["$messageImageUrl", null] },
              then: "Text & Image",
              else: "Text",
            },
          },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$sentAt",
              },
            },
            type: "$messageType",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1, "_id.type": 1 } },
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
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$sentAt",
              },
            },
          },
          uniqueContacts: { $addToSet: "$contactPhoneNumber" },
        },
      },
      {
        $project: {
          _id: 1,
          count: { $size: "$uniqueContacts" },
        },
      },
      { $sort: { _id: 1 } },
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
          workspaceId: new mongoose.Types.ObjectId(workspaceId),
        },
      },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          contactCount: { $sum: 1 },
        },
      },
      { $sort: { contactCount: -1 } },
      { $limit: 5 },
    ]);
  },
};
//contacts module
const contactQueries = {
  listContacts: async (
    workspaceId,
    page = 1,
    limit = 10,
    tagFilter = null,
    search = ""
  ) => {
    const skip = (page - 1) * limit;
    let query = { workspaceId };

    if (tagFilter) {
      query.tags = { $in: [tagFilter] };
    }

    if (search) {
      query.$or = [
        { phoneNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Contact.countDocuments(query),
    ]);

    return { contacts, total };
  },

  createContact: async (contactData) => {
    const contact = new Contact({
      _id: new mongoose.Types.ObjectId(),
      updatedAt: new Date(),
      ...contactData,
    });
    return await contact.save();
  },

  getContactById: async (contactId, workspaceId) => {
    return await Contact.findOne({
      _id: contactId,
      workspaceId,
    }).populate("createdBy", "name email");
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
      workspaceId,
    });
  },

  // get contacts by phone number for campaigns
  getContactsByPhoneNumbers: async (workspaceId, phoneNumbers) => {
    return await Contact.find({
      workspaceId,
      phoneNumber: { $in: phoneNumbers },
    });
  },

  // get contacts by tags for campaigns
  getContactsByTags: async (workspaceId, tags) => {
    return await Contact.find({
      workspaceId,
      tags: { $in: tags },
    });
  },

  // search querry
};

//Message template MOdule
const messageQueries = {
  listMessages: async (
    workspaceId,
    page = 1,
    limit = 10,
    typeFilter = null,
    search = ""
  ) => {
    const skip = (page - 1) * limit;
    let query = { workspaceId };

    if (typeFilter) {
      query.type = typeFilter;
    }
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }];
    }
    const [messages, total] = await Promise.all([
      Message.find(query)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Message.countDocuments(query),
    ]);

    return { messages, total };
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
      ...messageData,
    });
    return await message.save();
  },

  getMessageById: async (messageId, workspaceId) => {
    return await Message.findOne({
      _id: messageId,
      workspaceId,
    }).populate("createdBy", "name email");
  },

  getMessageByName: async (workspaceId, name) => {
    let query = { workspaceId, name };

    return await Message.findOne(query);
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
      workspaceId,
    });
  },
};

//campaign module

const campaignQueries = {
  listCampaigns: async (
    workspaceId,
    page = 1,
    limit = 10,
    statusFilter = null,
    searchFilter = ""
  ) => {
    const skip = (page - 1) * limit;
    let query = { workspaceId };

    if (statusFilter) {
      query.status = statusFilter;
    }

    if (searchFilter && searchFilter.trim()) {
      query.name = { $regex: searchFilter, $options: "i" };
    }

    const campaigns = await Campaign.find(query)
      .populate("templateId", "name type")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await Campaign.countDocuments(query);

    return { campaigns, total };
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
      status: "Draft",
      ...campaignData,
    });
    return await campaign.save();
  },

  getCampaignById: async (campaignId, workspaceId) => {
    return await Campaign.findOne({
      _id: campaignId,
      workspaceId,
    })
      .populate("templateId")
      .populate("createdBy", "name email");
  },

  getCampaignByName: async (workspaceId, name) => {
    let query = { workspaceId, name };

    return await Campaign.findOne(query);
  },

  //updating campaign only when it is in draft state

  updateCampaign: async (campaignId, workspaceId, updateData) => {
    return await Campaign.findOneAndUpdate(
      {
        _id: campaignId,
        workspaceId,
        status: "Draft",
      },
      updateData,
      { new: true }
    );
  },

  deleteCampaign: async (campaignId, workspaceId) => {
    return await Campaign.findOneAndDelete({
      _id: campaignId,
      workspaceId,
    });
  },

  // Copy campaign
  copyCampaign: async (campaignId, workspaceId, newName) => {
    const originalCampaign = await Campaign.findOne({
      _id: campaignId,
      workspaceId,
    });

    if (!originalCampaign) return null;

    const copiedCampaign = new Campaign({
      _id: new mongoose.Types.ObjectId(),
      workspaceId: originalCampaign.workspaceId,
      name: newName,
      targetTags: [...originalCampaign.targetTags],
      templateId: originalCampaign.templateId,
      status: "Draft",
      createdBy: originalCampaign.createdBy,
      createdAt: new Date(),
    });

    return await copiedCampaign.save();
  },

  // Launch campaign
  launchCampaign: async (campaignId, workspaceId) => {
    return await Campaign.findOneAndUpdate(
      {
        _id: campaignId,
        workspaceId,
        status: "Draft",
      },
      {
        status: "Running",
        launchedAt: new Date(),
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
  createCampaignMessages: async (messagesArray) => {
    console.log("inside bulk create messages............");
    const messages = messagesArray.map((messageData) => ({
      _id: new mongoose.Types.ObjectId(),
      sentAt: new Date(),
      ...messageData,
    }));
    return await CampaignMessage.insertMany(messages);
  },
};

// ------------------------------------------------------------------
// UTILITY QUERIES
// ------------------------------------------------------------------

const utilityQueries = {
  // Check if user has access to workspace
  checkUserWorkspaceAccess: async (userId, workspaceId) => {
    const user = await User.findOne({
      _id: userId,
      "workspaces.workspaceId": workspaceId,
    });

    if (!user) return null;

    const workspace = user.workspaces.find(
      (ws) => ws.workspaceId.toString() === workspaceId.toString()
    );

    return workspace ? workspace.role : null;
  },

  // gives all the tags in the workspace
  getWorkspaceTags: async (workspaceId) => {
    return await Contact.aggregate([
      {
        $match: {
          workspaceId: new mongoose.Types.ObjectId(workspaceId),
        },
      },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },

  // Check if phone number exists in workspace
  checkPhoneNumberExists: async (workspaceId, phoneNumber) => {
    let query = { workspaceId, phoneNumber };

    return await Contact.findOne(query);
  },
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
  utilityQueries,
  userManagementQueries,
};
