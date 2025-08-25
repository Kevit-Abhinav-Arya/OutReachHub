import { Response } from "express";
import mongoose from "mongoose";
import {
  campaignQueries,
  contactQueries,
  messageQueries,
  campaignMessageQueries,
} from "../MODELS/queries";
import { AuthenticatedRequest, PaginatedResponse } from "../../types/types";

// Create campaign
export const createCampaign = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, targetTags, templateId } = req.body;
    const workspaceId = req.user?.workspaceId;
    const createdBy = req.user?.id;

    if (!workspaceId || !createdBy) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!name || !targetTags || !templateId) {
      res.status(400).json({
        message: "Name, target tags, and template ID are required",
      });
      return;
    }

    if (!Array.isArray(targetTags) || targetTags.length === 0) {
      res.status(400).json({
        message: "Target tags must be a non-empty array",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      res.status(400).json({ message: "Invalid template ID" });
      return;
    }

    const template = await messageQueries.getMessageById(
      templateId,
      workspaceId
    );

    if (!template) {
      res.status(404).json({ message: "Message template not found" });
      return;
    }

    const existingCampaign = await campaignQueries.getCampaignByName(
      workspaceId,
      name.trim()
    );

    if (existingCampaign) {
      res.status(400).json({
        message: "Campaign with this name already exists in this workspace",
      });
      return;
    }

    // Targeting contacts by tag
    const targetContacts = await contactQueries.getContactsByTags(
      workspaceId,
      targetTags
    );
    const contactsCount = targetContacts.length;

    const campaignData = {
      workspaceId,
      name: name.trim(),
      targetTags: targetTags.filter((tag: string) => tag && tag.trim()),
      templateId,
      createdBy,
    };

    const campaign = await campaignQueries.createCampaign(campaignData as any);

    res.status(201).json({
      message: "Campaign created successfully",
      campaign: {
        id: campaign._id,
        name: campaign.name,
        targetTags: campaign.targetTags,
        templateId: campaign.templateId,
        status: campaign.status,
        targetContactsCount: contactsCount,
        createdAt: campaign.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all campaigns
export const getAllCampaigns = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = "1", limit = "10", search = "", status = "" } = req.query;

    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { campaigns, total } = await campaignQueries.listCampaigns(
      workspaceId,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        status: (status as string) || undefined,
      }
    );

    // Get campaign details with message counts - using flexible typing for API response
    const campaignDetails = await Promise.all(
      campaigns.map(async (campaign) => {
        const stats = await campaignQueries.getCampaignStats(
          campaign._id.toString(),
          workspaceId
        );

        return {
          id: campaign._id.toString(),
          name: campaign.name,
          targetTags: campaign.targetTags,
          template: {
            id: (campaign.templateId as any)._id.toString(),
            name: (campaign.templateId as any).name,
            type: (campaign.templateId as any).type,
          },
          status: campaign.status,
          createdBy: {
            id: (campaign.createdBy as any)._id.toString(),
            name: (campaign.createdBy as any).name,
            email: (campaign.createdBy as any).email,
          },
          createdAt: campaign.createdAt,
          launchedAt: campaign.launchedAt,
          messagesCount: stats.total,
          successCount: stats.sent,
        };
      })
    );

    const response: PaginatedResponse<(typeof campaignDetails)[0]> = {
      data: campaignDetails,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
        totalItems: total,
        limit: parseInt(limit as string),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get campaigns error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get campaign by ID
export const getCampaignById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid campaign ID" });
      return;
    }

    const campaign = await campaignQueries.getCampaignById(id, workspaceId);

    if (!campaign) {
      res.status(404).json({ message: "Campaign not found" });
      return;
    }

    // Get campaign messages using queries
    const messages = await campaignMessageQueries.getCampaignMessages(
      id,
      workspaceId
    );

    const messagesCount = messages.length;
    const successCount = messages.filter((msg) => msg.status === "Sent").length;
    const failedCount = messages.filter(
      (msg) => msg.status === "Failed"
    ).length;

    res.json({
      campaign: {
        id: campaign._id,
        name: campaign.name,
        targetTags: campaign.targetTags,
        template: {
          id: (campaign.templateId as any)._id,
          name: (campaign.templateId as any).name,
          type: (campaign.templateId as any).type,
          body: (campaign.templateId as any).body,
          imageUrl: (campaign.templateId as any).imageUrl,
        },
        status: campaign.status,
        createdBy: {
          id: (campaign.createdBy as any)._id,
          name: (campaign.createdBy as any).name,
          email: (campaign.createdBy as any).email,
        },
        createdAt: campaign.createdAt,
        launchedAt: campaign.launchedAt,
        stats: {
          total: messagesCount,
          sent: successCount,
          failed: failedCount,
        },
      },
      messages: messages.map((msg) => ({
        id: msg._id,
        contact: msg.contactId
          ? {
              id: (msg.contactId as any)._id,
              name: (msg.contactId as any).name,
              phoneNumber: (msg.contactId as any).phoneNumber,
            }
          : {
              phoneNumber: msg.contactPhoneNumber,
            },
        messageBody: msg.messageBody,
        messageImageUrl: msg.messageImageUrl,
        status: msg.status,
        sentAt: msg.sentAt,
      })),
    });
  } catch (error) {
    console.error("Get campaign error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update campaign
export const updateCampaign = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, targetTags, templateId } = req.body;
    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid campaign ID" });
      return;
    }

    const campaign = await campaignQueries.getCampaignById(id, workspaceId);

    if (!campaign) {
      res.status(404).json({ message: "Campaign not found" });
      return;
    }

    if (campaign.status !== "Draft") {
      res.status(400).json({
        message: "Only draft campaigns can be updated",
      });
      return;
    }

    const updateFields: any = {};

    if (name !== undefined) {
      if (!name.trim()) {
        res.status(400).json({ message: "Name cannot be empty" });
        return;
      }

      if (name.trim() !== campaign.name) {
        const existingCampaign = await campaignQueries.getCampaignByName(
          workspaceId,
          name.trim()
        );

        if (existingCampaign) {
          res.status(400).json({
            message: "Campaign with this name already exists in this workspace",
          });
          return;
        }
      }

      updateFields.name = name.trim();
    }

    if (targetTags !== undefined) {
      if (!Array.isArray(targetTags) || targetTags.length === 0) {
        res.status(400).json({
          message: "Target tags must be a non-empty array",
        });
        return;
      }
      updateFields.targetTags = targetTags.filter(
        (tag: string) => tag && tag.trim()
      );
    }

    if (templateId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(templateId)) {
        res.status(400).json({ message: "Invalid template ID" });
        return;
      }

      const template = await messageQueries.getMessageById(
        templateId,
        workspaceId
      );

      if (!template) {
        res.status(404).json({ message: "Message template not found" });
        return;
      }

      updateFields.templateId = templateId;
    }

    const updatedCampaign = await campaignQueries.updateCampaign(
      id,
      workspaceId,
      updateFields
    );

    if (!updatedCampaign) {
      res.status(404).json({ message: "Campaign not found" });
      return;
    }

    const targetContacts = await contactQueries.getContactsByTags(
      workspaceId,
      updatedCampaign.targetTags
    );
    const contactsCount = targetContacts.length;

    res.json({
      message: "Campaign updated successfully",
      campaign: {
        id: updatedCampaign._id,
        name: updatedCampaign.name,
        targetTags: updatedCampaign.targetTags,
        template: {
          id: (updatedCampaign.templateId as any)._id,
          name: (updatedCampaign.templateId as any).name,
          type: (updatedCampaign.templateId as any).type,
        },
        status: updatedCampaign.status,
        targetContactsCount: contactsCount,
        createdBy: {
          id: (updatedCampaign.createdBy as any)._id,
          name: (updatedCampaign.createdBy as any).name,
          email: (updatedCampaign.createdBy as any).email,
        },
        createdAt: updatedCampaign.createdAt,
      },
    });
  } catch (error) {
    console.error("Update campaign error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete campaign
export const deleteCampaign = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid campaign ID" });
      return;
    }

    const campaign = await campaignQueries.deleteCampaign(id, workspaceId);

    if (!campaign) {
      res.status(404).json({ message: "Campaign not found" });
      return;
    }

    res.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Delete campaign error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Copy campaign
export const copyCampaign = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const workspaceId = req.user?.workspaceId;
    const createdBy = req.user?.id;

    if (!workspaceId || !createdBy) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid campaign ID" });
      return;
    }

    const originalCampaign = await campaignQueries.getCampaignById(
      id,
      workspaceId
    );

    if (!originalCampaign) {
      res.status(404).json({ message: "Campaign not found" });
      return;
    }

    const newName = name || `${originalCampaign.name} (Copy)`;

    const existingCampaign = await campaignQueries.getCampaignByName(
      workspaceId,
      newName.trim()
    );

    if (existingCampaign) {
      res.status(400).json({
        message: "Campaign with this name already exists in this workspace",
      });
      return;
    }

    const campaignData = {
      workspaceId,
      name: newName.trim(),
      targetTags: [...originalCampaign.targetTags],
      templateId: originalCampaign.templateId,
      status: "Draft",
      createdBy,
    };

    const copiedCampaign = await campaignQueries.createCampaign(
      campaignData as any
    );

    const targetContacts = await contactQueries.getContactsByTags(
      workspaceId,
      copiedCampaign.targetTags
    );
    const contactsCount = targetContacts.length;

    res.status(201).json({
      message: "Campaign copied successfully",
      campaign: {
        id: copiedCampaign._id,
        name: copiedCampaign.name,
        targetTags: copiedCampaign.targetTags,
        templateId: copiedCampaign.templateId,
        status: copiedCampaign.status,
        targetContactsCount: contactsCount,
        createdAt: copiedCampaign.createdAt,
      },
    });
  } catch (error) {
    console.error("Copy campaign error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Launch campaign
export const launchCampaign = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid campaign ID" });
      return;
    }

    const campaign = await campaignQueries.getCampaignById(id, workspaceId);

    if (!campaign) {
      res.status(404).json({ message: "Campaign not found" });
      return;
    }

    if (campaign.status !== "Draft") {
      res.status(400).json({
        message: "Only draft campaigns can be launched",
      });
      return;
    }

    const contacts = await contactQueries.getContactsByTags(
      workspaceId,
      campaign.targetTags
    );

    if (contacts.length === 0) {
      await campaignQueries.updateCampaign(id, workspaceId, {
        status: "Completed",
      } as any);

      res.json({
        message: "Campaign launched but no contacts found with target tags",
        campaign: {
          id: campaign._id,
          status: "Completed",
          launchedAt: new Date(),
          contactsReached: 0,
        },
      });
      return;
    }
    await campaignQueries.updateCampaign(id, workspaceId, {
      status: "Running",
      launchedAt: new Date(),
    } as any);

    const campaignMessages: any[] = [];

    for (const contact of contacts) {
      const messageSuccess = Math.random() > 0.1;

      const messageData = {
        workspaceId,
        campaignId: campaign._id,
        contactId: contact._id,
        contactPhoneNumber: contact.phoneNumber,
        messageBody: (campaign.templateId as any).body,
        messageImageUrl: (campaign.templateId as any).imageUrl,
        status: messageSuccess ? "Sent" : "Failed",
      };

      campaignMessages.push(messageData);
    }
    console.log(campaignMessages);

    await campaignMessageQueries.createCampaignMessages(campaignMessages);

    await campaignQueries.updateCampaign(id, workspaceId, {
      status: "Completed",
    } as any);

    const successCount = campaignMessages.filter(
      (msg) => msg.status === "Sent"
    ).length;
    const failedCount = campaignMessages.filter(
      (msg) => msg.status === "Failed"
    ).length;

    res.json({
      message: "Campaign launched successfully",
      campaign: {
        id: campaign._id,
        status: campaign.status,
        launchedAt: campaign.launchedAt,
        stats: {
          total: campaignMessages.length,
          sent: successCount,
          failed: failedCount,
        },
      },
    });
  } catch (error) {
    console.error("Launch campaign error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
