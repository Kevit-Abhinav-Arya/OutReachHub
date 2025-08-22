const mongoose = require("mongoose");
const { contactQueries, utilityQueries } = require("../MODELS/queries");

// Create contact
const createContact = async (req, res) => {
  try {
    const { name, phoneNumber, tags = [], email, company, notes } = req.body;
    const workspaceId = req.user.workspaceId;
    const createdBy = req.user.id;
    console.log(workspaceId);

    if (!name || !phoneNumber || !email || !company) {
      return res
        .status(400)
        .json({
          message: "Name, phone number, email , Company name  are required",
        });
    }

    const phoneRegex = /^[6789]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const existingContact = await utilityQueries.checkPhoneNumberExists(
      workspaceId,
      phoneNumber.trim()
    );

    if (existingContact) {
      return res.status(400).json({
        message:
          "Contact with this phone number already exists in this workspace",
      });
    }

    const contactData = {
      workspaceId,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      tags: tags.map((tag) => tag.trim()),
      email: email.trim(),
      company: company.trim(),
      notes,
      createdBy,
    };

    const contact = await contactQueries.createContact(contactData);

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
const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", tags = "" } = req.query;

    const workspaceId = req.user.workspaceId;

    const { contacts, total } = await contactQueries.listContacts(workspaceId, {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      tags: tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
    });

    res.json({
      contacts: contacts.map((contact) => ({
        id: contact._id,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        tags: contact.tags,
        createdBy: {
          id: contact.createdBy._id,
          name: contact.createdBy.name,
          email: contact.createdBy.email,
        },
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get contact by ID
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspaceId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }

    const contact = await contactQueries.getContactById(id, workspaceId);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({
      contact: {
        id: contact._id,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        tags: contact.tags,
        createdBy: {
          id: contact.createdBy._id,
          name: contact.createdBy.name,
          email: contact.createdBy.email,
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
const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, tags } = req.body;
    const workspaceId = req.user.workspaceId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }

    const contact = await contactQueries.getContactById(id, workspaceId);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const updateFields = { updatedAt: new Date() };

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      updateFields.name = name.trim();
    }

    if (phoneNumber !== undefined) {
      if (!phoneNumber.trim()) {
        return res
          .status(400)
          .json({ message: "Phone number cannot be empty" });
      }

      const phoneRegex = /^[6789]\d{9}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ message: "Invalid phone number format" });
      }

      //check if phone number is already in workspace
      if (phoneNumber.trim() !== contact.phoneNumber) {
        const existingContact = await utilityQueries.checkPhoneNumberExists(
          workspaceId,
          phoneNumber.trim()
        );

        if (existingContact) {
          return res.status(400).json({
            message:
              "Phone number is already used by another contact in this workspace",
          });
        }
      }

      updateFields.phoneNumber = phoneNumber.trim();
    }

    if (tags !== undefined) {
      updateFields.tags = Array.isArray(tags)
        ? tags.filter((tag) => tag && tag.trim()).map((tag) => tag.trim())
        : [];
    }

    const updatedContact = await contactQueries.updateContact(
      id,
      workspaceId,
      updateFields
    );

    res.json({
      message: "Contact updated successfully",
      contact: {
        id: updatedContact._id,
        name: updatedContact.name,
        phoneNumber: updatedContact.phoneNumber,
        tags: updatedContact.tags,
        createdBy: {
          id: updatedContact.createdBy._id,
          name: updatedContact.createdBy.name,
          email: updatedContact.createdBy.email,
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
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspaceId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }

    const contact = await contactQueries.getContactById(id, workspaceId);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    await contactQueries.deleteContact(id, workspaceId);
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
};
