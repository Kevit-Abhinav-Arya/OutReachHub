import { Response } from "express";
import mongoose from "mongoose";
import { messageQueries } from "../MODELS/queries";
import { AuthenticatedRequest, PaginatedResponse } from "../../types/types";

// Create message template
export const createMessageTemplate = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, type, body, imageUrl } = req.body;
    const workspaceId = req.user?.workspaceId;
    const createdBy = req.user?.id;

    if (!workspaceId || !createdBy) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!name || !type || !body) {
      res.status(400).json({
        message: "Name, type, and body are required",
      });
      return;
    }

    if (!["Text", "Text & Image"].includes(type)) {
      res.status(400).json({
        message: 'Type must be either "Text" or "Text & Image"',
      });
      return;
    }

    if (type === "Text & Image" && !imageUrl) {
      res.status(400).json({
        message: 'Image URL is required for "Text & Image" type',
      });
      return;
    }

    const existingTemplate = await messageQueries.getMessageByName(
      workspaceId,
      name.trim()
    );

    if (existingTemplate) {
      res.status(400).json({
        message:
          "Message template with this name already exists in this workspace",
      });
      return;
    }

    const templateData = {
      workspaceId,
      name: name.trim(),
      type,
      body: body.trim(),
      imageUrl: type === "Text & Image" ? imageUrl?.trim() : undefined,
      createdBy,
    };

    const template = await messageQueries.createMessage(templateData as any);

    res.status(201).json({
      message: "Message template created successfully",
      template: {
        id: template._id,
        name: template.name,
        type: template.type,
        body: template.body,
        imageUrl: template.imageUrl,
        createdAt: template.createdAt,
      },
    });
  } catch (error) {
    console.error("Create message template error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all message templates
export const getAllMessageTemplates = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = "1", limit = "10", search = "", type = "" } = req.query;

    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { messages, total } = await messageQueries.listMessages(workspaceId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      type: type as string,
      search: search as string,
    });

    // Transform message templates for API response using flexible typing
    const templatesResponse = messages.map((template) => ({
      id: template._id.toString(),
      name: template.name,
      type: template.type,
      body: template.body,
      imageUrl: template.imageUrl,
      createdBy: template.createdBy
        ? {
            id: (template.createdBy as any)._id.toString(),
            name: (template.createdBy as any).name,
            email: (template.createdBy as any).email,
          }
        : null,
      createdAt: template.createdAt,
    }));

    const response: PaginatedResponse<(typeof templatesResponse)[0]> = {
      data: templatesResponse,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
        totalItems: total,
        limit: parseInt(limit as string),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get message templates error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get message template by ID
export const getMessageTemplateById = async (
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
      res.status(400).json({ message: "Invalid template ID" });
      return;
    }

    const template = await messageQueries.getMessageById(id, workspaceId);

    if (!template) {
      res.status(404).json({ message: "Message template not found" });
      return;
    }

    res.json({
      template: {
        id: template._id,
        name: template.name,
        type: template.type,
        body: template.body,
        imageUrl: template.imageUrl,
        createdBy: template.createdBy
          ? {
              id: (template.createdBy as any)._id,
              name: (template.createdBy as any).name,
              email: (template.createdBy as any).email,
            }
          : null,
        createdAt: template.createdAt,
      },
    });
  } catch (error) {
    console.error("Get message template error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update message template
export const updateMessageTemplate = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, type, body, imageUrl } = req.body;
    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid template ID" });
      return;
    }

    const template = await messageQueries.getMessageById(id, workspaceId);

    if (!template) {
      res.status(404).json({ message: "Message template not found" });
      return;
    }

    const updateFields: any = {};

    if (name !== undefined) {
      if (!name.trim()) {
        res.status(400).json({ message: "Name cannot be empty" });
        return;
      }

      if (name.trim() !== template.name) {
        const existingTemplate = await messageQueries.getMessageByName(
          workspaceId,
          name.trim()
        );

        if (existingTemplate) {
          res.status(400).json({
            message:
              "Message template with this name already exists in this workspace",
          });
          return;
        }
      }

      updateFields.name = name.trim();
    }

    if (type !== undefined) {
      if (!["Text", "Text & Image"].includes(type)) {
        res.status(400).json({
          message: 'Type must be either "Text" or "Text & Image"',
        });
        return;
      }
      updateFields.type = type;
    }

    if (body !== undefined) {
      if (!body.trim()) {
        res.status(400).json({ message: "Body cannot be empty" });
        return;
      }
      updateFields.body = body.trim();
    }

    const finalType = type !== undefined ? type : template.type;
    if (finalType === "Text & Image") {
      if (imageUrl !== undefined) {
        updateFields.imageUrl = imageUrl?.trim();
      }
    } else {
      updateFields.imageUrl = undefined;
    }

    const updatedTemplate = await messageQueries.updateMessage(
      id,
      workspaceId,
      updateFields
    );

    if (!updatedTemplate) {
      res
        .status(404)
        .json({ message: "Message template not found or update failed" });
      return;
    }

    res.json({
      message: "Message template updated successfully",
      template: {
        id: updatedTemplate._id,
        name: updatedTemplate.name,
        type: updatedTemplate.type,
        body: updatedTemplate.body,
        imageUrl: updatedTemplate.imageUrl,
        createdBy: updatedTemplate.createdBy
          ? {
              id: (updatedTemplate.createdBy as any)._id,
              name: (updatedTemplate.createdBy as any).name,
              email: (updatedTemplate.createdBy as any).email,
            }
          : null,
        createdAt: updatedTemplate.createdAt,
      },
    });
  } catch (error) {
    console.error("Update message template error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete message template
export const deleteMessageTemplate = async (
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
      res.status(400).json({ message: "Invalid template ID" });
      return;
    }

    const template = await messageQueries.deleteMessage(id, workspaceId);

    if (!template) {
      res.status(404).json({ message: "Message template not found" });
      return;
    }

    res.json({ message: "Message template deleted successfully" });
  } catch (error) {
    console.error("Delete message template error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
