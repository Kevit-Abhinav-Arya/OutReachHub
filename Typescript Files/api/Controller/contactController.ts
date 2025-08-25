import { Response } from "express";
import mongoose from "mongoose";
import { contactQueries, utilityQueries } from "../MODELS/queries";
import { AuthenticatedRequest, PaginatedResponse } from "../../types/types";

// Create contact
export const createContact = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, phoneNumber, tags = [], email, company, notes } = req.body;
    const workspaceId = req.user?.workspaceId;
    const createdBy = req.user?.id;

    if (!workspaceId || !createdBy) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    console.log(workspaceId);

    if (!name || !phoneNumber || !email || !company) {
      res.status(400).json({
        message: "Name, phone number, email, Company name are required",
      });
      return;
    }

    const phoneRegex = /^[6789]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      res.status(400).json({ message: "Invalid phone number format" });
      return;
    }

    const existingContact = await utilityQueries.checkPhoneNumberExists(
      workspaceId,
      phoneNumber.trim()
    );

    if (existingContact) {
      res.status(400).json({
        message:
          "Contact with this phone number already exists in this workspace",
      });
      return;
    }

    const contactData = {
      workspaceId,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      tags: tags.map((tag: string) => tag.trim()),
      email: email.trim(),
      company: company.trim(),
      notes,
      createdBy,
    };

    const contact = await contactQueries.createContact(contactData as any);

    res.status(201).json({
      message: "Contact created successfully",
      contact: {
        id: contact._id,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        tags: contact.tags,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all contacts
export const getAllContacts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = "1", limit = "10", search = "", tags = "" } = req.query;

    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { contacts, total } = await contactQueries.listContacts(workspaceId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      tags: tags
        ? (tags as string)
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
    });

    // Transform contacts for API response using flexible typing
    const contactsResponse = contacts.map((contact) => ({
      id: contact._id.toString(),
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      email: contact.email,
      company: contact.company,
      notes: contact.notes,
      tags: contact.tags,
      createdBy: {
        id: (contact.createdBy as any)._id.toString(),
        name: (contact.createdBy as any).name,
        email: (contact.createdBy as any).email,
      },
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    }));

    const response: PaginatedResponse<(typeof contactsResponse)[0]> = {
      data: contactsResponse,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
        totalItems: total,
        limit: parseInt(limit as string),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get contact by ID
export const getContactById = async (
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
      res.status(400).json({ message: "Invalid contact ID" });
      return;
    }

    const contact = await contactQueries.getContactById(id, workspaceId);

    if (!contact) {
      res.status(404).json({ message: "Contact not found" });
      return;
    }

    res.json({
      contact: {
        id: contact._id,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        tags: contact.tags,
        createdBy: {
          id: (contact.createdBy as any)?._id,
          name: (contact.createdBy as any)?.name,
          email: (contact.createdBy as any)?.email,
        },
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update contact
export const updateContact = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, tags } = req.body;
    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid contact ID" });
      return;
    }

    const contact = await contactQueries.getContactById(id, workspaceId);

    if (!contact) {
      res.status(404).json({ message: "Contact not found" });
      return;
    }

    const updateFields: any = { updatedAt: new Date() };

    if (name !== undefined) {
      if (!name.trim()) {
        res.status(400).json({ message: "Name cannot be empty" });
        return;
      }
      updateFields.name = name.trim();
    }

    if (phoneNumber !== undefined) {
      if (!phoneNumber.trim()) {
        res.status(400).json({ message: "Phone number cannot be empty" });
        return;
      }

      const phoneRegex = /^[6789]\d{9}$/;
      if (!phoneRegex.test(phoneNumber)) {
        res.status(400).json({ message: "Invalid phone number format" });
        return;
      }

      // Check if phone number is already in workspace
      if (phoneNumber.trim() !== contact.phoneNumber) {
        const existingContact = await utilityQueries.checkPhoneNumberExists(
          workspaceId,
          phoneNumber.trim()
        );

        if (existingContact) {
          res.status(400).json({
            message:
              "Phone number is already used by another contact in this workspace",
          });
          return;
        }
      }

      updateFields.phoneNumber = phoneNumber.trim();
    }

    if (tags !== undefined) {
      updateFields.tags = Array.isArray(tags)
        ? tags
            .filter((tag: string) => tag && tag.trim())
            .map((tag: string) => tag.trim())
        : [];
    }

    const updatedContact = await contactQueries.updateContact(
      id,
      workspaceId,
      updateFields
    );

    if (!updatedContact) {
      res.status(404).json({ message: "Contact not found" });
      return;
    }

    res.json({
      message: "Contact updated successfully",
      contact: {
        id: updatedContact._id,
        name: updatedContact.name,
        phoneNumber: updatedContact.phoneNumber,
        tags: updatedContact.tags,
        createdBy: {
          id: (updatedContact.createdBy as any)?._id,
          name: (updatedContact.createdBy as any)?.name,
          email: (updatedContact.createdBy as any)?.email,
        },
        createdAt: updatedContact.createdAt,
        updatedAt: updatedContact.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete contact
export const deleteContact = async (
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
      res.status(400).json({ message: "Invalid contact ID" });
      return;
    }

    const contact = await contactQueries.getContactById(id, workspaceId);

    if (!contact) {
      res.status(404).json({ message: "Contact not found" });
      return;
    }

    await contactQueries.deleteContact(id, workspaceId);
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
