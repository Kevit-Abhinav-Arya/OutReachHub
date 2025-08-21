const mongoose = require('mongoose');
const { 
  campaignQueries, 
  contactQueries, 
  messageQueries ,
  campaignMessageQueries
} = require('../MODELS/queries');

// Create campaign
const createCampaign = async (req, res) => {
  try {
    const { name, targetTags, templateId } = req.body;
    const workspaceId = req.user.workspaceId;
    const createdBy = req.user.id;

    if (!name || !targetTags || !templateId) {
      return res.status(400).json({ 
        message: 'Name, target tags, and template ID are required' 
      });
    }

    if (!Array.isArray(targetTags) || targetTags.length === 0) {
      return res.status(400).json({ 
        message: 'Target tags must be a non-empty array' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      return res.status(400).json({ message: 'Invalid template ID' });
    }

    const template = await messageQueries.getMessageById(templateId, workspaceId);

    if (!template) {
      return res.status(404).json({ message: 'Message template not found' });
    }

    const existingCampaign = await campaignQueries.getCampaignByName(
      workspaceId, 
      name.trim()
    );

    if (existingCampaign) {
      return res.status(400).json({ 
        message: 'Campaign with this name already exists in this workspace' 
      });
    }


    //Targeting contacts by tag
    const targetContacts = await contactQueries.getContactsByTags(
      workspaceId,
      targetTags
    );
    const contactsCount = targetContacts.length;

    const campaignData = {
      workspaceId,
      name: name.trim(),
      targetTags: targetTags.filter(tag => tag && tag.trim()),
      templateId,
      createdBy,
      
    };

    const campaign = await campaignQueries.createCampaign(campaignData);

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign: {
        id: campaign._id,
        name: campaign.name,
        targetTags: campaign.targetTags,
        templateId: campaign.templateId,
        status: campaign.status,
        targetContactsCount: contactsCount,
        createdAt: campaign.createdAt
      }
    });

  } catch (error) {
    console.error( error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all campaigns
const getAllCampaigns = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '',
    } = req.query;
    
    const workspaceId = req.user.workspaceId;
   

    const { campaigns, total } = await campaignQueries.listCampaigns(
      workspaceId,
      parseInt(page),
      parseInt(limit),
      status ,
      search
    );



    res.json({
      campaigns: campaigns,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get campaign by ID
const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspaceId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const campaign = await campaignQueries.getCampaignById(id, workspaceId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const messages = await campaignMessageQueries.getCampaignMessages(id, workspaceId); 

    const messagesCount = messages.length;


    res.json({
      campaign: {
        id: campaign._id,
        name: campaign.name,
        targetTags: campaign.targetTags,
        template: campaign.templateId ? {
          id: campaign.templateId._id,
          name: campaign.templateId.name,
          type: campaign.templateId.type,
          body: campaign.templateId.body,
          imageUrl: campaign.templateId.imageUrl
        } : null,
        status: campaign.status,
        createdBy: campaign.createdBy ? {
          id: campaign.createdBy._id,
          name: campaign.createdBy.name,
          email: campaign.createdBy.email
        } : null,
        createdAt: campaign.createdAt,
        launchedAt: campaign.launchedAt,
      
      },
      messages: messages.map(msg => ({
        id: msg._id,
        contact: msg.contactId ? {
          id: msg.contactId._id,
          name: msg.contactId.name,
          phoneNumber: msg.contactId.phoneNumber
        } : {
          phoneNumber: msg.contactPhoneNumber
        },
        messageBody: msg.messageBody,
        messageImageUrl: msg.messageImageUrl,
        status: msg.status,
        sentAt: msg.sentAt
      }))
    });

  } catch (error) {
    console.error( error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update campaign
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, targetTags, templateId } = req.body;
    const workspaceId = req.user.workspaceId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const campaign = await campaignQueries.getCampaignById(id, workspaceId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status !== 'Draft') {
      return res.status(400).json({ 
        message: 'Only draft campaigns can be updated' 
      });
    }

    const updateFields = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }

      if (name.trim() !== campaign.name) {
        const existingCampaign = await campaignQueries.getCampaignByName(
          workspaceId, 
          name.trim(),
          
        );

        if (existingCampaign) {
          return res.status(400).json({ 
            message: 'Campaign with this name already exists in this workspace' 
          });
        }
      }

      updateFields.name = name.trim();
    }

    if (targetTags !== undefined) {
      if (!Array.isArray(targetTags) || targetTags.length === 0) {
        return res.status(400).json({ 
          message: 'Target tags must be a non-empty array' 
        });
      }
      updateFields.targetTags = targetTags.filter(tag => tag && tag.trim());
    }

    if (templateId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(templateId)) {
        return res.status(400).json({ message: 'Invalid template ID' });
      }

      const template = await messageQueries.getMessageById(templateId, workspaceId);

      if (!template) {
        return res.status(404).json({ message: 'Message template not found' });
      }

      updateFields.templateId = templateId;
    }

    const updatedCampaign = await campaignQueries.updateCampaign(id,workspaceId, updateFields);

    const targetContacts = await contactQueries.getContactsByTags(
      workspaceId,
      updatedCampaign.targetTags
    );
    const contactsCount = targetContacts.length;

    res.json({
      message: 'Campaign updated successfully',
      campaign: {
        id: updatedCampaign._id,
        name: updatedCampaign.name,
        targetTags: updatedCampaign.targetTags,
        template: updatedCampaign.templateId ? {
          id: updatedCampaign.templateId._id,
          name: updatedCampaign.templateId.name,
          type: updatedCampaign.templateId.type
        } : null,
        status: updatedCampaign.status,
        targetContactsCount: contactsCount,
        createdBy: updatedCampaign.createdBy ? {
          id: updatedCampaign.createdBy._id,
          name: updatedCampaign.createdBy.name,
          email: updatedCampaign.createdBy.email
        } : null,
        createdAt: updatedCampaign.createdAt
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspaceId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const campaign = await campaignQueries.deleteCampaign(id, workspaceId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json({ message: `Campaign ${campaign.name} deleted Succesfully` });

  } catch (error) {
    console.error( error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Copy campaign
const copyCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const workspaceId = req.user.workspaceId;
    const createdBy = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const originalCampaign = await campaignQueries.getCampaignById(id, workspaceId);

    if (!originalCampaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const newName = name || `${originalCampaign.name} (Copy)`;

    const existingCampaign = await campaignQueries.getCampaignByName(workspaceId, newName.trim());

    if (existingCampaign) {
      return res.status(400).json({ 
        message: 'Campaign with this name already exists in this workspace' 
      });
    }

    const campaignData = {
      workspaceId,
      name: newName.trim(),
      targetTags: [...originalCampaign.targetTags],
      templateId: originalCampaign.templateId,
      status: 'Draft', 
      createdBy
    };

    const copiedCampaign = await campaignQueries.createCampaign(campaignData);

    const targetContacts = await contactQueries.getContactsByTags(
      workspaceId,
      copiedCampaign.targetTags
    );
    const contactsCount = targetContacts.length;

    res.status(201).json({
      message: 'Campaign copied successfully',
      campaign: {
        id: copiedCampaign._id,
        name: copiedCampaign.name,
        targetTags: copiedCampaign.targetTags,
        templateId: copiedCampaign.templateId,
        status: copiedCampaign.status,
        targetContactsCount: contactsCount,
        createdAt: copiedCampaign.createdAt
      }
    });

  } catch (error) {
    console.error('Copy campaign error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Launch campaign
const launchCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspaceId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    const campaign = await campaignQueries.getCampaignById(id, workspaceId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status !== 'Draft') {
      return res.status(400).json({ 
        message: 'Only draft campaigns can be launched' 
      });
    }

  

    const contacts = await contactQueries.getContactsByTags(
      workspaceId,
      campaign.targetTags
    );
    
    if (contacts.length === 0) {
      await campaignQueries.updateCampaign(id, workspaceId, { status: 'Completed' });
      
      return res.json({
        message: 'Campaign launched but no contacts found with target tags',
        campaign: {
          id: campaign._id,
          status: 'Completed',
          launchedAt: new Date(),
          contactsReached: 0
        }
      });
    }
    
    await campaignQueries.updateCampaign(id, workspaceId, {
      status: 'Running',
      launchedAt: new Date()
    });

    const campaignMessages = [];
    
    for (const contact of contacts) {
      const messageSuccess = Math.random() > 0.1; 
      
      const messageData = {
        workspaceId,
        campaignId: campaign._id,
        contactId: contact._id,
        contactPhoneNumber: contact.phoneNumber,
        messageBody: campaign.templateId.body,
        messageImageUrl: campaign.templateId.imageUrl,
        status: messageSuccess ? 'Sent' : 'Failed'
      };
      
      campaignMessages.push(messageData);
    }
    
    await campaignMessageQueries.createCampaignMessages(campaignMessages);
    
    
    
 

    res.json({
      message: 'Campaign launched successfully',
      campaign: {
        id: campaign._id,
        status: campaign.status,
        launchedAt: campaign.launchedAt,
        
      }
    });

  } catch (error) {
    console.error( error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  copyCampaign,
  launchCampaign,
};
