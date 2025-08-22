import mongoose from 'mongoose';
import Admin from './admin';
import User from './userModel';
import Workspace from './workspaceModel';
import Contact from './contactModel';
import Message from './messageModel';
import Campaign from './campaignsModel';
import CampaignMessage from './campaignMessage';
import { 
  IAdmin, 
  IUser,  
  IWorkspace, 
  IContact, 
  IMessage, 
  ICampaign, 
  ICampaignMessage,
  ListOptions,
  ContactListOptions,
  MessageListOptions,
  CampaignListOptions,
} from '../../types/types';

// ------------------------------------------------------------------
// ADMIN PORTAL QUERIES
// ------------------------------------------------------------------

// Admin Authentication
export const adminQueries = {
  findAdminByEmail: async (email: string): Promise<IAdmin | null> => {
    return await Admin.findOne({ email });
  },

  // Create new admin just to add an admin at first place
  createAdmin: async (adminData: Partial<IAdmin>): Promise<IAdmin> => {
    const admin = new Admin({
      _id: new mongoose.Types.ObjectId(),
      ...adminData
    });
    return await admin.save();
  }
};

// Workspace Module
export const workspaceQueries = {

  listWorkspaces: async (options: ListOptions ): Promise<{ workspaces: IWorkspace[]; total: number }> => {
    const { page = 1, limit = 10, search = '' } = options;
    const skip = (page - 1) * limit;
    
    let query: any = {};
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

  getWorkspacesCount: async (): Promise<number> => {
    return await Workspace.countDocuments();
  },

  createWorkspace: async (workspaceData: Partial<IWorkspace>): Promise<IWorkspace> => {
    const workspace = new Workspace({
      _id: new mongoose.Types.ObjectId(),
      ...workspaceData
    });
    return await workspace.save();
  },

  getWorkspaceById: async (workspaceId: string): Promise<IWorkspace | null> => {
    return await Workspace.findById(workspaceId);
  },

  updateWorkspace: async (workspaceId: string, updateData: Partial<IWorkspace>): Promise<IWorkspace | null> => {
    

      const updatedWorkspace = await Workspace.findByIdAndUpdate(
        workspaceId,
        { ...updateData },
        { new: true }
      );

      if (updateData.name && updatedWorkspace) {
        await User.updateMany(
          { 
            $or: [
              { 'workspaces.workspaceId': workspaceId },
              { 'workspaces.workspaceId': workspaceId.toString() }
            ]
          },
          { 
            $set: { 
              'workspaces.$.workspaceName': updateData.name 
            }
          }
        );
      }

      return updatedWorkspace;
     
  },

  // Delete workspace
  deleteWorkspace: async (workspaceId: string): Promise<IWorkspace | null> => {
    return await Workspace.findByIdAndDelete(workspaceId);
  }
};

// Workspace users module
export const workspaceUserQueries = {
  listWorkspaceUsers: async (workspaceId: string, page: number = 1, limit: number = 10): Promise<{ users: IUser[]; total: number }> => {
    const skip = (page - 1) * limit;
    const query = { 'workspaces.workspaceId': workspaceId };
    
    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      User.countDocuments(query)
    ]);
    
    return { users, total };
  },

  getWorkspaceUsersCount: async (workspaceId: string): Promise<number> => {
    return await User.countDocuments({
      'workspaces.workspaceId': workspaceId
    });
  },

  createWorkspaceUser: async (userData: { workspaceId: string; role: string; workspaceName: string}& Omit<IUser , '_id'>): Promise<IUser> => {
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

  getWorkspaceUserById: async (userId: string): Promise<IUser | null> => {
    return await User.findById(userId).populate('workspaces.workspaceId');
  },

  updateWorkspaceUser: async (userId: string, workspaceId: string, updateData: Partial<IUser & { role?: string }>): Promise<IUser | null> => {
    const updateFields: any = {};
    
    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.email) updateFields.email = updateData.email;
    
    if (updateData.role) {
      updateFields['workspaces.$.role'] = updateData.role;
    }
    
    return await User.findOneAndUpdate(
      { 
        _id: userId,
        'workspaces.workspaceId': workspaceId 
      },
      { $set: updateFields },
      { new: true }
    ).populate('workspaces.workspaceId');
  },

  deleteWorkspaceUser: async (userId: string): Promise<IUser | null> => {
    return await User.findByIdAndDelete(userId);
  },

  addUserToWorkspace: async (userId: string, workspaceId: string, workspaceName: string, role: string): Promise<IUser | null> => {
    return await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          workspaces: { workspaceId, workspaceName, role }
        }
      },
      { new: true }
    );
  },
    
  // Remove user from workspace
  removeUserFromWorkspace: async (userId: string, workspaceId: string): Promise<IUser | null> => {
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
// USER MANAGEMENT QUERIES
// ------------------------------------------------------------------

export const userManagementQueries = {
  createUser: async (userData: Partial<IUser>): Promise<IUser> => {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      workspaces: [], 
      ...userData
    });
    return await user.save();
  },

  getAllUsers: async (page: number = 1, limit: number = 10): Promise<IUser[]> => {
    const skip = (page - 1) * limit;
    return await User.find()
      .populate('workspaces.workspaceId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  getAllUsersCount: async (): Promise<number> => {
    return await User.countDocuments();
  },

  getUserById: async (userId: string): Promise<IUser | null> => {
    return await User.findById(userId).populate('workspaces.workspaceId', 'name');
  },

  updateUser: async (userId: string, updateData: Partial<IUser>): Promise<IUser | null> => {
    return await User.findByIdAndUpdate(
      userId,
      { ...updateData },
      { new: true }
    ).populate('workspaces.workspaceId', 'name');
  },

  deleteUser: async (userId: string): Promise<IUser | null> => {
    return await User.findByIdAndDelete(userId);
  },

  searchUsers: async (searchTerm: string, page: number = 1, limit: number = 10): Promise<IUser[]> => {
    const skip = (page - 1) * limit;
    return await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .populate('workspaces.workspaceId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
  },

  getUserByEmail: async (email: string): Promise<IUser | null> => {
    return await User.findOne({ email }).populate('workspaces.workspaceId', 'name');
  }
};

// ------------------------------------------------------------------
// OUTREACHHUB PORTAL QUERIES
// ------------------------------------------------------------------

// User Authentication
export const userAuthQueries = {
  findUserByEmail: async (email: string): Promise<IUser | null> => {
    return await User.findOne({ email }).populate('workspaces.workspaceId');
  },

  getUserWorkspaces: async (userId: string): Promise<IUser | null> => {
    return await User.findById(userId).populate('workspaces.workspaceId');
  }
};

//Home module, analytical datas

//chart data
export const analyticsQueries = {
  getCampaignsPerDay: async (workspaceId: string, startDate: string, endDate: string): Promise<any[]> => {
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

  // Getting message sent per type per day
  getMessagesSentPerTypePerDay: async (workspaceId: string, startDate: string, endDate: string): Promise<any[]> => {
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

  // Number of contacts reached per day
  getContactsReachedPerDay: async (workspaceId: string, startDate: string, endDate: string): Promise<any[]> => {
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
  // list of 5 recent campaigns
  getRecentCampaigns: async (workspaceId: string): Promise<ICampaign[]> => {
    return await Campaign.find({ workspaceId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
  },

  // list of top 5 tags with most contacts
  getTopContactTags: async (workspaceId: string): Promise<any[]> => {
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
    ])
  }
};

// contacts module
export const contactQueries = {
  listContacts: async (workspaceId: string, options: ContactListOptions): Promise<{ contacts: IContact[]; total: number }> => {
    const { page = 1, limit = 10, tags = [], search = '' } = options;
    const skip = (page - 1) * limit;
    let query: any = { workspaceId };
    
    if (tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (search) {
      query.$or = [
        { phoneNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Contact.countDocuments(query)
    ]);

    return { contacts, total };
  },

  createContact: async (contactData: Partial<IContact>): Promise<IContact> => {
    const contact = new Contact({
      _id: new mongoose.Types.ObjectId(),
      updatedAt: new Date(),
      ...contactData
    });
    return await contact.save();
  },

  getContactById: async (contactId: string, workspaceId: string): Promise<IContact | null> => {
    return await Contact.findOne({
      _id: contactId,
      workspaceId
    }).populate('createdBy', 'name email');
  },

  updateContact: async (contactId: string, workspaceId: string, updateData: Partial<IContact>): Promise<IContact | null> => {
    return await Contact.findOneAndUpdate(
      { _id: contactId, workspaceId },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
  },

  deleteContact: async (contactId: string, workspaceId: string): Promise<IContact | null> => {
    return await Contact.findOneAndDelete({
      _id: contactId,
      workspaceId
    });
  },

  getContactsByPhoneNumbers: async (workspaceId: string, phoneNumbers: string[]): Promise<IContact[]> => {
    return await Contact.find({
      workspaceId,
      phoneNumber: { $in: phoneNumbers }
    });
  },

  getContactsByTags: async (workspaceId: string, tags: string[]): Promise<IContact[]> => {
    return await Contact.find({
      workspaceId,
      tags: { $in: tags }
    });
  },

  searchContacts: async (workspaceId: string, searchTerm: string, page: number = 1, limit: number = 10): Promise<IContact[]> => {
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

// Message template Module
export const messageQueries = {
  listMessages: async (workspaceId: string, options: MessageListOptions): Promise<{ messages: IMessage[]; total: number }> => {
    const { page = 1, limit = 10, type, search = '' } = options;
    const skip = (page - 1) * limit;
    let query: any = { workspaceId };
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.name= { $regex: search, $options: 'i' }
    
    }
    
    const [messages, total] = await Promise.all([
      Message.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Message.countDocuments(query)
    ]);

    return { messages, total };
  },

  getMessagesCount: async (workspaceId: string, typeFilter?: string): Promise<number> => {
    let query: any = { workspaceId };
    if (typeFilter) {
      query.type = typeFilter;
    }
    return await Message.countDocuments(query);
  },

  createMessage: async (messageData: Partial<IMessage>): Promise<IMessage> => {
    const message = new Message({
      _id: new mongoose.Types.ObjectId(),
      ...messageData
    });
    return await message.save();
  },

  getMessageById: async (messageId: string, workspaceId: string): Promise<IMessage | null> => {
    return await Message.findOne({
      _id: messageId,
      workspaceId
    }).populate('createdBy', 'name email');
  },

  getMessageByName: async (workspaceId: string, name: string): Promise<IMessage | null> => {
    let query: any = { workspaceId, name };
    return await Message.findOne(query);
  },



  updateMessage: async (messageId: string, workspaceId: string, updateData: Partial<IMessage>): Promise<IMessage | null> => {
    return await Message.findOneAndUpdate(
      { _id: messageId, workspaceId },
      updateData,
      { new: true }
    );
  },

  deleteMessage: async (messageId: string, workspaceId: string): Promise<IMessage | null> => {
    return await Message.findOneAndDelete({
      _id: messageId,
      workspaceId
    });
  }
};

// campaign module
export const campaignQueries = {
  listCampaigns: async (workspaceId: string, options: CampaignListOptions): Promise<{ campaigns: ICampaign[]; total: number }> => {
    const { page = 1, limit = 10, status, search = '' } = options;
    const skip = (page - 1) * limit;
    let query: any = { workspaceId };
    
    if (status) {
      query.status = status;
    }

    if (search && search.trim()) {
      query.name = { $regex: search, $options: 'i' };
    }

    const campaigns = await Campaign.find(query)
      .populate('templateId', 'name type')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await Campaign.countDocuments(query);

    return { campaigns, total };
  },
  
  createCampaign: async (campaignData: Partial<ICampaign>): Promise<ICampaign> => {
    const campaign = new Campaign({
      _id: new mongoose.Types.ObjectId(),
      status: 'Draft',
      ...campaignData
    });
    return await campaign.save();
  },

  getCampaignById: async (campaignId: string, workspaceId: string): Promise<ICampaign | null> => {
    return await Campaign.findOne({
      _id: campaignId,
      workspaceId
    })
    .populate('templateId')
    .populate('createdBy', 'name email');
  },

  getCampaignByName: async (workspaceId: string, name: string): Promise<ICampaign | null> => {
    let query: any = { workspaceId, name };
    return await Campaign.findOne(query);
  },



  // updating campaign only when it is in draft state
  updateCampaign: async (campaignId: string, workspaceId: string, updateData: Partial<ICampaign>): Promise<ICampaign | null> => {
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

  deleteCampaign: async (campaignId: string, workspaceId: string): Promise<ICampaign | null> => {
    return await Campaign.findOneAndDelete({
      _id: campaignId,
      workspaceId
    });
  },

  // Copy campaign 
  copyCampaign: async (campaignId: string, workspaceId: string, newName: string): Promise<ICampaign | null> => {
    const originalCampaign = await Campaign.findOne({
      _id: campaignId,
      workspaceId
    });

    if (!originalCampaign) return null;

    const copiedCampaign: ICampaign = new Campaign({
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
  launchCampaign: async (campaignId: string, workspaceId: string): Promise<ICampaign | null> => {
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
  updateCampaignStatus: async (campaignId: string, status: string): Promise<ICampaign | null> => {
    return await Campaign.findByIdAndUpdate(
      campaignId,
      { status },
      { new: true }
    );
  },

  getCampaignStats: async (campaignId: string, workspaceId: string): Promise<{ total: number; sent: number; failed: number }> => {
    const stats = await CampaignMessage.aggregate([
      {
        $match: { 
          campaignId: new mongoose.Types.ObjectId(campaignId),
          workspaceId: new mongoose.Types.ObjectId(workspaceId)
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      sent: 0,
      failed: 0
    };

    stats.forEach((stat: any) => {
      result.total += stat.count;
      if (stat._id === 'Sent') {
        result.sent = stat.count;
      } else if (stat._id === 'Failed') {
        result.failed = stat.count;
      }
    });

    return result;
  }
};

// Campaign Message Module
export const campaignMessageQueries = {


  createCampaignMessages: async (messagesArray: Partial<ICampaignMessage>[]): Promise<ICampaignMessage[]> => {
    console.log("inside bulk create messages............");
    console.log(messagesArray);
    const messagesWithDefaults = messagesArray.map(messageData => ({
      _id: new mongoose.Types.ObjectId(),
      sentAt: new Date(),
      ...messageData
    }));
    const result = await CampaignMessage.insertMany(messagesWithDefaults);
    return result as ICampaignMessage[];
  },

  getCampaignMessages: async (campaignId: string, workspaceId: string, page: number = 1, limit: number = 10): Promise<ICampaignMessage[]> => {
    const skip = (page - 1) * limit;
    return await CampaignMessage.find({
      campaignId,
      workspaceId
    })
    .populate('contactId')
    .sort({ sentAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
  },

 

};

// ------------------------------------------------------------------
// UTILITY QUERIES
// ------------------------------------------------------------------
export const utilityQueries = {
  // gives all the tags in the workspace
  getWorkspaceTags: async (workspaceId: string): Promise<any[]> => {
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
  checkPhoneNumberExists: async (workspaceId: string, phoneNumber: string): Promise<IContact | null> => {
    let query: any = { workspaceId, phoneNumber };
    return await Contact.findOne(query);
  }
};
