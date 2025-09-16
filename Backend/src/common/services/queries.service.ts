import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Admin } from "../../database/schemas/admin.schema";
import { User } from "../../database/schemas/user.schema";
import { Workspace } from "../../database/schemas/workspace.schema";
import { Contact } from "../../database/schemas/contact.schema";
import { Message } from "../../database/schemas/message.schema";
import { Campaign } from "../../database/schemas/campaign.schema";
import { CampaignMessage } from "../../database/schemas/campaign-message.schema";

// Types for query options
interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
}

interface ContactQueryOptions extends PaginationOptions {
  tagFilter?: string;
}

interface MessageQueryOptions extends PaginationOptions {
  typeFilter?: "Text" | "Text & Image";
}

interface CampaignQueryOptions extends PaginationOptions {
  statusFilter?: "Draft" | "Running" | "Completed" | "Paused";
}

@Injectable()
export class QueriesService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
    @InjectModel(Contact.name) private contactModel: Model<Contact>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    @InjectModel(CampaignMessage.name)
    private campaignMessageModel: Model<CampaignMessage>
  ) {}

  // ------------------------------------------------------------------
  // ADMIN PORTAL QUERIES
  // ------------------------------------------------------------------

  // Admin Authentication
  async findAdminByEmail(email: string) {
    return await this.adminModel.findOne({ email });
  }

  async createAdmin(adminData: any) {
    const admin = new this.adminModel({
      _id: new Types.ObjectId(),
      ...adminData,
    });
    return await admin.save();
  }

  // Workspace Module
  async listWorkspaces(options: PaginationOptions = {}) {
    const { page = 1, limit = 10, search = "" } = options;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = { name: { $regex: search, $options: "i" } };
    }

    const [workspaces, total] = await Promise.all([
      this.workspaceModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.workspaceModel.countDocuments(query),
    ]);

    return { workspaces, total };
  }

  async getWorkspacesCount() {
    return await this.workspaceModel.countDocuments();
  }

  async createWorkspace(workspaceData: any) {
    const workspace = new this.workspaceModel({
      _id: new Types.ObjectId(),
      ...workspaceData,
    });
    return await workspace.save();
  }

  async getWorkspaceById(workspaceId: string) {
    return await this.workspaceModel.findById(workspaceId);
  }

  async updateWorkspace(workspaceId: string, updateData: any) {
    const updatedWorkspace = await this.workspaceModel.findByIdAndUpdate(
      workspaceId,
      { ...updateData },
      { new: true }
    );

    if (updateData.name && updatedWorkspace) {
      await this.userModel.updateMany(
        { "workspaces.workspaceId": workspaceId },
        {
          $set: {
            "workspaces.$.workspaceName": updateData.name,
          },
        }
      );
    }

    return updatedWorkspace;
  }

  async deleteWorkspace(workspaceId: string) {
    return await this.workspaceModel.findByIdAndDelete(workspaceId);
  }

  // Workspace Users Module
  async listWorkspaceUsers(
    workspaceId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    const query = { "workspaces.workspaceId": workspaceId };

    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(query),
    ]);

    return { users, total };
  }

  async getWorkspaceUsersCount(workspaceId: string) {
    return await this.userModel.countDocuments({
      "workspaces.workspaceId": workspaceId,
    });
  }

  async createWorkspaceUser(userData: any) {
    const { workspaceId, role, workspaceName, ...userInfo } = userData;

    const user = new this.userModel({
      _id: new Types.ObjectId(),
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
  }

  async getWorkspaceUserById(userId: string) {
    return await this.userModel.findById(userId).exec();
  }

  async updateWorkspaceUser(userId: string, updateData: any) {
    return await this.userModel.findByIdAndUpdate(
      userId,
      { ...updateData },
      { new: true }
    );
  }

  async deleteWorkspaceUser(userId: string) {
    return await this.userModel.findByIdAndDelete(userId);
  }

  async addUserToWorkspace(
    userId: string,
    workspaceId: string,
    workspaceName: string,
    role: string
  ) {
    return await this.userModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          workspaces: { workspaceId, workspaceName, role },
        },
      },
      { new: true }
    );
  }

  async removeUserFromWorkspace(userId: string, workspaceId: string) {
    return await this.userModel.findByIdAndUpdate(
      userId,
      {
        $pull: {
          workspaces: { workspaceId },
        },
      },
      { new: true }
    );
  }

  // ------------------------------------------------------------------
  // USER MANAGEMENT QUERIES
  // ------------------------------------------------------------------

  async createUser(userData: any) {
    const user = new this.userModel({
      _id: new Types.ObjectId(),
      workspaces: [],
      ...userData,
    });
    return await user.save();
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return await this.userModel
      .find()
      .populate("workspaces.workspaceId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async getAllUsersCount() {
    return await this.userModel.countDocuments();
  }

  async getUserById(userId: string) {
    return await this.userModel
      .findById(userId)
      .populate("workspaces.workspaceId", "name");
  }

  async updateUser(userId: string, updateData: any) {
    return await this.userModel
      .findByIdAndUpdate(userId, { ...updateData }, { new: true })
      .populate("workspaces.workspaceId", "name");
  }

  async deleteUser(userId: string) {
    return await this.userModel.findByIdAndDelete(userId);
  }

  async searchUsers(searchTerm: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return await this.userModel
      .find({
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
  }

  async getUserByEmail(email: string) {
    return await this.userModel
      .findOne({ email })
      .populate("workspaces.workspaceId", "name");
  }

  // User Authentication
  async findUserByEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
  }

  async getUserWorkspaces(userId: string) {
    return await this.userModel
      .findById(userId)
      .populate("workspaces.workspaceId");
  }

  async getUsersNotInWorkspace(workspaceId: string) {
    return await this.userModel
      .find({
        "workspaces.workspaceId": { $ne: workspaceId },
      })
      .select("_id name email")
      .exec();
  }

  // ------------------------------------------------------------------
  // OUTREACHHUB PORTAL QUERIES
  // ------------------------------------------------------------------

  // ------------------------------------------------------------------
  // ANALYTICS QUERIES
  // ------------------------------------------------------------------

  async getCampaignsPerDay(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Try both string and ObjectId formats for workspace ID to handle different data storage formats
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    // Check which format is used in the database
    const campaignsAsObjectId = await this.campaignModel
      .find({
        workspaceId: workspaceObjectId,
      })
      .limit(1)
      .exec();

    const actualWorkspaceId =
      campaignsAsObjectId.length > 0 ? workspaceObjectId : workspaceId;

    return await this.campaignModel.aggregate([
      {
        $match: {
          workspaceId: actualWorkspaceId,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getLaunchedCampaignsPerDay(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Try both string and ObjectId formats for workspace ID to handle different data storage formats
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    // Check which format is used in the database
    const campaignsAsObjectId = await this.campaignModel
      .find({
        workspaceId: workspaceObjectId,
      })
      .limit(1)
      .exec();

    const actualWorkspaceId =
      campaignsAsObjectId.length > 0 ? workspaceObjectId : workspaceId;

    return await this.campaignModel.aggregate([
      {
        $match: {
          workspaceId: actualWorkspaceId,
          launchedAt: {
            $exists: true,
            $gte: startDate,
            $lte: endDate,
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
  }

  async getMessagesSentPerTypePerDay(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Try both string and ObjectId formats for workspace ID to handle different data storage formats
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    // Check which format is used in the database
    const messagesAsObjectId = await this.campaignMessageModel
      .find({
        workspaceId: workspaceObjectId,
      })
      .limit(1)
      .exec();

    const actualWorkspaceId =
      messagesAsObjectId.length > 0 ? workspaceObjectId : workspaceId;

    return await this.campaignMessageModel.aggregate([
      {
        $match: {
          workspaceId: actualWorkspaceId,
          sentAt: {
            $gte: startDate,
            $lte: endDate,
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
  }

  async getContactsReachedPerDay(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Try both string and ObjectId formats for workspace ID to handle different data storage formats
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    // Check which format is used in the database
    const messagesAsObjectId = await this.campaignMessageModel
      .find({
        workspaceId: workspaceObjectId,
      })
      .limit(1)
      .exec();

    const actualWorkspaceId =
      messagesAsObjectId.length > 0 ? workspaceObjectId : workspaceId;

    return await this.campaignMessageModel.aggregate([
      {
        $match: {
          workspaceId: actualWorkspaceId,
          sentAt: {
            $gte: startDate,
            $lte: endDate,
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
  }

  async getRecentCampaigns(workspaceId: string) {
    // Try both string and ObjectId formats for workspace ID to handle different data storage formats
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    // Check which format is used in the database
    const campaignsAsObjectId = await this.campaignModel
      .find({
        workspaceId: workspaceObjectId,
      })
      .limit(1)
      .exec();

    const actualWorkspaceId =
      campaignsAsObjectId.length > 0 ? workspaceObjectId : workspaceId;

    return await this.campaignModel
      .find({ workspaceId: actualWorkspaceId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
  }

  async getTopContactTags(workspaceId: string) {
    // Try both string and ObjectId formats for workspace ID to handle different data storage formats
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    // Check which format is used in the database
    const contactsAsObjectId = await this.contactModel
      .find({
        workspaceId: workspaceObjectId,
      })
      .limit(1)
      .exec();

    const actualWorkspaceId =
      contactsAsObjectId.length > 0 ? workspaceObjectId : workspaceId;

    return await this.contactModel.aggregate([
      {
        $match: {
          workspaceId: actualWorkspaceId,
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
  }

  // ------------------------------------------------------------------
  // CONTACTS QUERIES
  // ------------------------------------------------------------------

  async listContacts(workspaceId: string, options: ContactQueryOptions = {}) {
    const { page = 1, limit = 10, tagFilter, search = "" } = options;
    const skip = (page - 1) * limit;
    let query: any = { workspaceId };

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
      this.contactModel
        .find(query)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.contactModel.countDocuments(query),
    ]);

    return { contacts, total };
  }

  async createContact(contactData: any) {
    const contact = new this.contactModel({
      _id: new Types.ObjectId(),
      updatedAt: new Date(),
      ...contactData,
    });
    return await contact.save();
  }

  async getContactById(contactId: string, workspaceId: string) {
    return await this.contactModel
      .findOne({
        _id: contactId,
        workspaceId,
      })
      .populate("createdBy", "name email");
  }

  async updateContact(contactId: string, workspaceId: string, updateData: any) {
    return await this.contactModel.findOneAndUpdate(
      { _id: contactId, workspaceId },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
  }

  async deleteContact(contactId: string, workspaceId: string) {
    return await this.contactModel.findOneAndDelete({
      _id: contactId,
      workspaceId,
    });
  }

  async getContactsByPhoneNumbers(workspaceId: string, phoneNumbers: string[]) {
    return await this.contactModel.find({
      workspaceId,
      phoneNumber: { $in: phoneNumbers },
    });
  }

  async getContactsByTags(workspaceId: string, tags: string[]) {
    return await this.contactModel.find({
      workspaceId,
      tags: { $in: tags },
    });
  }

  // ------------------------------------------------------------------
  // MESSAGE TEMPLATE QUERIES
  // ------------------------------------------------------------------

  async listMessages(workspaceId: string, options: MessageQueryOptions = {}) {
    const { page = 1, limit = 10, typeFilter, search = "" } = options;
    const skip = (page - 1) * limit;
    let query: any = { workspaceId };

    if (typeFilter) {
      query.type = typeFilter;
    }
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    const [messages, total] = await Promise.all([
      this.messageModel
        .find(query)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.messageModel.countDocuments(query),
    ]);

    return { messages, total };
  }

  async getMessagesCount(workspaceId: string, typeFilter?: string) {
    let query: any = { workspaceId };
    if (typeFilter) {
      query.type = typeFilter;
    }
    return await this.messageModel.countDocuments(query);
  }

  async createMessage(messageData: any) {
    const message = new this.messageModel({
      _id: new Types.ObjectId(),
      ...messageData,
    });
    return await message.save();
  }

  async getMessageById(messageId: string, workspaceId: string) {
    return await this.messageModel
      .findOne({
        _id: messageId,
        workspaceId,
      })
      .populate("createdBy", "name email");
  }

  async getMessageByName(workspaceId: string, name: string) {
    let query = { workspaceId, name };
    return await this.messageModel.findOne(query);
  }

  async updateMessage(messageId: string, workspaceId: string, updateData: any) {
    return await this.messageModel
      .findOneAndUpdate({ _id: messageId, workspaceId }, updateData, {
        new: true,
      })
      .populate("createdBy", "name email")
      .exec();
  }

  async deleteMessage(messageId: string, workspaceId: string) {
    return await this.messageModel.findOneAndDelete({
      _id: messageId,
      workspaceId,
    });
  }

  // ------------------------------------------------------------------
  // CAMPAIGN QUERIES
  // ------------------------------------------------------------------

  async listCampaigns(workspaceId: string, options: CampaignQueryOptions = {}) {
    const { page = 1, limit = 10, statusFilter, search = "" } = options;
    const skip = (page - 1) * limit;
    let query: any = { workspaceId };

    if (statusFilter) {
      query.status = statusFilter;
    }

    if (search && search.trim()) {
      query.name = { $regex: search, $options: "i" };
    }

    const campaigns = await this.campaignModel
      .find(query)
      .populate("templateId", "name type body imageUrl")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.campaignModel.countDocuments(query);

    return { campaigns, total };
  }

  async getCampaignsCount(workspaceId: string, statusFilter?: string) {
    let query: any = { workspaceId };
    if (statusFilter) {
      query.status = statusFilter;
    }
    return await this.campaignModel.countDocuments(query);
  }

  async createCampaign(campaignData: any) {
    const campaign = new this.campaignModel({
      _id: new Types.ObjectId(),
      status: "Draft",
      ...campaignData,
    });
    return await campaign.save();
  }

  async getCampaignById(campaignId: string, workspaceId: string) {
    return await this.campaignModel
      .findOne({
        _id: campaignId,
        workspaceId,
      })
      .populate("templateId", "name type body imageUrl")
      .populate("createdBy", "name email");
  }

  async getCampaignByName(workspaceId: string, name: string) {
    let query = { workspaceId, name };
    return await this.campaignModel.findOne(query);
  }

  async updateCampaign(
    campaignId: string,
    workspaceId: string,
    updateData: any
  ) {
    return await this.campaignModel
      .findOneAndUpdate(
        {
          _id: campaignId,
          workspaceId,
          status: "Draft",
        },
        updateData,
        { new: true }
      )
      .populate("templateId", "name type body imageUrl")
      .populate("createdBy", "name email");
  }

  async deleteCampaign(campaignId: string, workspaceId: string) {
    return await this.campaignModel.findOneAndDelete({
      _id: campaignId,
      workspaceId,
    });
  }

  async copyCampaign(campaignId: string, workspaceId: string, newName: string) {
    const originalCampaign = await this.campaignModel.findOne({
      _id: campaignId,
      workspaceId,
    });

    if (!originalCampaign) return null;

    const copiedCampaign = new this.campaignModel({
      _id: new Types.ObjectId(),
      workspaceId: originalCampaign.workspaceId,
      name: newName,
      targetTags: [...originalCampaign.targetTags],
      templateId: originalCampaign.templateId,
      status: "Draft",
      createdBy: originalCampaign.createdBy,
      createdAt: new Date(),
    });

    return await copiedCampaign.save();
  }

  async launchCampaign(campaignId: string, workspaceId: string) {
    return await this.campaignModel.findOneAndUpdate(
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
  }

  async updateCampaignStatus(campaignId: string, status: string) {
    return await this.campaignModel.findByIdAndUpdate(
      campaignId,
      { status },
      { new: true }
    );
  }

  // ------------------------------------------------------------------
  // CAMPAIGN MESSAGE QUERIES
  // ------------------------------------------------------------------

  async createCampaignMessages(messagesArray: any[]) {
    console.log("inside bulk create messages............");
    const messages = messagesArray.map((messageData) => ({
      _id: new Types.ObjectId(),
      sentAt: new Date(),
      ...messageData,
    }));
    return await this.campaignMessageModel.insertMany(messages);
  }

  async createCampaignMessage(messageData: any) {
    const message = new this.campaignMessageModel({
      _id: new Types.ObjectId(),
      ...messageData,
    });
    return await message.save();
  }

  async getCampaignMessages(
    campaignId: string,
    options: { limit?: number; skip?: number } = {}
  ) {
    const { limit = 10, skip = 0 } = options;
    return await this.campaignMessageModel
      .find({ campaignId })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async updateCampaignMessage(messageId: string, updateData: any) {
    return await this.campaignMessageModel.findByIdAndUpdate(
      messageId,
      updateData,
      { new: true }
    );
  }

  async deleteCampaignMessages(campaignId: string) {
    return await this.campaignMessageModel.deleteMany({ campaignId });
  }

  // ------------------------------------------------------------------
  // UTILITY QUERIES
  // ------------------------------------------------------------------

  async checkUserWorkspaceAccess(userId: string, workspaceId: string) {
    const user = await this.userModel.findOne({
      _id: userId,
      "workspaces.workspaceId": workspaceId,
    });

    if (!user) return null;

    const workspace = user.workspaces.find(
      (ws) => ws.workspaceId.toString() === workspaceId.toString()
    );

    return workspace ? workspace.role : null;
  }

  async getWorkspaceTags(workspaceId: string) {
    const testContacts = await this.contactModel.find({ workspaceId }).limit(1);

    if (testContacts.length === 0) {
      return [];
    }

    const actualWorkspaceId = testContacts[0].workspaceId;

    return await this.contactModel.aggregate([
      {
        $match: {
          workspaceId: actualWorkspaceId,
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
  }

  async checkPhoneNumberExists(workspaceId: string, phoneNumber: string) {
    let query = { workspaceId, phoneNumber };
    return await this.contactModel.findOne(query);
  }
}
