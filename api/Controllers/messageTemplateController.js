const mongoose = require('mongoose');
const { messageQueries } = require('../MODELS/queries');

// Create message template
const createMessageTemplate = async (req, res) => {
  try {
    const { name, type, body, imageUrl } = req.body;
    const workspaceId = req.user.workspaceId;
    const createdBy = req.user.id;

    if (!name || !type || !body) {
      return res.status(400).json({ 
        message: 'Name, type, and body are required' 
      });
    }

    if (!['Text', 'Text & Image'].includes(type)) {
      return res.status(400).json({ 
        message: 'Type must be either "Text" or "Text & Image"' 
      });
    }

    if (type === 'Text & Image' && !imageUrl) {
      return res.status(400).json({ 
        message: 'Image URL is required for "Text & Image" type' 
      });
    }

    const existingTemplate = await messageQueries.getMessageByName(
      workspaceId, 
      name.trim()
    );

    if (existingTemplate) {
      return res.status(400).json({ 
        message: 'Message template with this name already exists in this workspace' 
      });
    }

    const templateData = {
      workspaceId,
      name: name.trim(),
      type,
      body: body.trim(),
      imageUrl: type === 'Text & Image' ? imageUrl?.trim() : undefined,
      createdBy
    };

    const template = await messageQueries.createMessage(templateData);

    res.status(201).json({
      message: 'Message template created successfully',
      template: {
        id: template._id,
        name: template.name,
        type: template.type,
        body: template.body,
        imageUrl: template.imageUrl,
        createdAt: template.createdAt
      }
    });

  } catch (error) {
    console.error('Create message template error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all message templates
const getAllMessageTemplates = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      type = '',
     
    } = req.query;
    
    const workspaceId = req.user.workspaceId;

    const { messages, total } = await messageQueries.listMessages(
      workspaceId,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        search,
        
      }
    );

  

    res.json({
      templates: messages.map(template => ({
        id: template._id,
        name: template.name,
        type: template.type,
        body: template.body,
        imageUrl: template.imageUrl,
        createdBy: template.createdBy ? {
          id: template.createdBy._id,
          name: template.createdBy.name,
          email: template.createdBy.email
        } : null,
        createdAt: template.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit: parseInt(limit)
      },
      
    });

  } catch (error) {
    console.error('Get message templates error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get message template by ID
const getMessageTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspaceId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid template ID' });
    }

    const template = await messageQueries.getMessageById(id, workspaceId);

    if (!template) {
      return res.status(404).json({ message: 'Message template not found' });
    }

    res.json({
      template: {
        id: template._id,
        name: template.name,
        type: template.type,
        body: template.body,
        imageUrl: template.imageUrl,
        createdBy: template.createdBy ? {
          id: template.createdBy._id,
          name: template.createdBy.name,
          email: template.createdBy.email
        } : null,
        createdAt: template.createdAt
      }
    });

  } catch (error) {
    console.error('Get message template error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update message template
const updateMessageTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, body, imageUrl } = req.body;
    const workspaceId = req.user.workspaceId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid template ID' });
    }

    const template = await messageQueries.getMessageById(id, workspaceId);

    if (!template) {
      return res.status(404).json({ message: 'Message template not found' });
    }

    const updateFields = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }

      if (name.trim() !== template.name) {
        const existingTemplate = await messageQueries.getMessageByName(
          workspaceId, 
          name.trim(),
        );

        if (existingTemplate) {
          return res.status(400).json({ 
            message: 'Message template with this name already exists in this workspace' 
          });
        }
      }

      updateFields.name = name.trim();
    }

    if (type !== undefined) {
      if (!['Text', 'Text & Image'].includes(type)) {
        return res.status(400).json({ 
          message: 'Type must be either "Text" or "Text & Image"' 
        });
      }
      updateFields.type = type;
    }

    if (body !== undefined) {
      if (!body.trim()) {
        return res.status(400).json({ message: 'Body cannot be empty' });
      }
      updateFields.body = body.trim();
    }

    const finalType = type !== undefined ? type : template.type;
    if (finalType === 'Text & Image') {
      if (imageUrl !== undefined) {
        updateFields.imageUrl = imageUrl?.trim();
      }
    } else {
      updateFields.imageUrl = undefined;
    }

    const updatedTemplate = await messageQueries.updateMessage(id, workspaceId,updateFields);

    res.json({
      message: 'Message template updated successfully',
      template: {
        id: updatedTemplate._id,
        name: updatedTemplate.name,
        type: updatedTemplate.type,
        body: updatedTemplate.body,
        imageUrl: updatedTemplate.imageUrl,
        createdBy: updatedTemplate.createdBy ? {
          id: updatedTemplate.createdBy._id,
          name: updatedTemplate.createdBy.name,
          email: updatedTemplate.createdBy.email
        } : null,
        createdAt: updatedTemplate.createdAt
      }
    });

  } catch (error) {
    console.error('Update message template error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete message template
const deleteMessageTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspaceId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid template ID' });
    }

    const template = await messageQueries.deleteMessage(id, workspaceId);

    if (!template) {
      return res.status(404).json({ message: 'Message template not found' });
    }

    res.json({ message: 'Message template deleted successfully' });

  } catch (error) {
    console.error('Delete message template error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createMessageTemplate,
  getAllMessageTemplates,
  getMessageTemplateById,
  updateMessageTemplate,
  deleteMessageTemplate
};
