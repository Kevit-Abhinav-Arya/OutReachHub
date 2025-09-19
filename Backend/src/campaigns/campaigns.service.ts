import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { QueriesService } from '../common/services/queries.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CopyCampaignDto,
  GetCampaignsQueryDto,
  CampaignStatus,
  CreateCampaignResponse,
  CampaignListResponse,
  SingleCampaignResponse,
  UpdateCampaignResponse,
  CopyCampaignResponse,
  LaunchCampaignResponse,
  DeleteCampaignResponse,
  CampaignResponseDto,
  CampaignMessageDto,
  CampaignSummaryDto,
} from './dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly queriesService: QueriesService) {}

  // Create Campaign
  async createCampaign(
    createCampaignDto: CreateCampaignDto,
    workspaceId: string,
    createdBy: string,
  ): Promise<CreateCampaignResponse> {
    const { name, targetTags, templateId } = createCampaignDto;

    const template = await this.queriesService.getMessageById(
      templateId,
      workspaceId,
    );

    if (!template) {
      throw new NotFoundException('Message template not found');
    }

    const existingCampaign = await this.queriesService.getCampaignByName(
      workspaceId,
      name.trim(),
    );

    if (existingCampaign) {
      throw new ConflictException(
        'Campaign with this name already exists in this workspace',
      );
    }

    const targetContacts = await this.queriesService.getContactsByTags(
      workspaceId,
      targetTags,
    );
    const contactsCount = targetContacts.length;

    const campaignData = {
      workspaceId,
      name: name.trim(),
      targetTags: targetTags.filter((tag) => tag && tag.trim()),
      templateId,
      createdBy,
    };

    const campaign = await this.queriesService.createCampaign(campaignData);

    // Get the populated campaign with template data
    const populatedCampaign: any = await this.queriesService.getCampaignById(
      campaign._id.toString(),
      workspaceId,
    );

    if (!populatedCampaign) {
      throw new NotFoundException('Failed to retrieve created campaign');
    }

    return {
      message: 'Campaign created successfully',
      campaign: {
        id: populatedCampaign._id.toString(),
        name: populatedCampaign.name,
        targetTags: populatedCampaign.targetTags,
        templateId:
          populatedCampaign.templateId?._id?.toString() ||
          populatedCampaign.templateId?.toString(),
        template:
          populatedCampaign.templateId &&
          typeof populatedCampaign.templateId === 'object'
            ? {
                id: populatedCampaign.templateId._id.toString(),
                name: populatedCampaign.templateId.name,
                type: populatedCampaign.templateId.type,
                body: populatedCampaign.templateId.body,
                imageUrl: populatedCampaign.templateId.imageUrl,
              }
            : undefined,
        status: populatedCampaign.status as CampaignStatus,
        targetContactsCount: contactsCount,
        createdBy: populatedCampaign.createdBy
          ? {
              id: populatedCampaign.createdBy._id.toString(),
              name: populatedCampaign.createdBy.name,
              email: populatedCampaign.createdBy.email,
            }
          : undefined,
        createdAt: populatedCampaign.createdAt,
      },
    };
  }

  async getAllCampaigns(
    query: GetCampaignsQueryDto,
    workspaceId: string,
  ): Promise<CampaignListResponse> {
    const { page = 1, limit = 10, search = '', status } = query;

    const { campaigns, total } = await this.queriesService.listCampaigns(
      workspaceId,
      {
        page,
        limit,
        statusFilter: status,
        search,
      },
    );

    // Transform campaigns to match frontend expectations
    const transformedCampaigns = campaigns.map((campaign: any) => ({
      id: campaign._id.toString(),
      name: campaign.name,
      targetTags: campaign.targetTags,
      templateId:
        campaign.templateId?._id?.toString() ||
        campaign.templateId?.toString() ||
        campaign.templateId,
      template:
        campaign.templateId && typeof campaign.templateId === 'object'
          ? {
              id: campaign.templateId._id.toString(),
              name: campaign.templateId.name,
              type: campaign.templateId.type,
              body: campaign.templateId.body,
              imageUrl: campaign.templateId.imageUrl,
            }
          : undefined,
      status: campaign.status,
      createdBy: campaign.createdBy
        ? {
            id: campaign.createdBy._id.toString(),
            name: campaign.createdBy.name,
            email: campaign.createdBy.email,
          }
        : undefined,
      createdAt: campaign.createdAt,
      launchedAt: campaign.launchedAt,
    }));

    return {
      campaigns: transformedCampaigns,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit,
      },
    };
  }

  async getCampaignById(
    id: string,
    workspaceId: string,
  ): Promise<SingleCampaignResponse> {
    const campaign: any = await this.queriesService.getCampaignById(
      id,
      workspaceId,
    );

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const messages = await this.queriesService.getCampaignMessages(id);

    const campaignResponse: CampaignResponseDto = {
      id: campaign._id.toString(),
      name: campaign.name,
      targetTags: campaign.targetTags,
      template: campaign.templateId
        ? {
            id: campaign.templateId._id.toString(),
            name: campaign.templateId.name,
            type: campaign.templateId.type,
            body: campaign.templateId.body,
            imageUrl: campaign.templateId.imageUrl,
          }
        : null,
      status: campaign.status,
      createdBy: campaign.createdBy
        ? {
            id: campaign.createdBy._id.toString(),
            name: campaign.createdBy.name,
            email: campaign.createdBy.email,
          }
        : null,
      createdAt: campaign.createdAt,
      launchedAt: campaign.launchedAt,
    };

    const messageDtos: CampaignMessageDto[] = messages.map((msg: any) => {
      let contactInfo;
      if (msg.contactId) {
        contactInfo = {
          id: msg.contactId.toString(),
          phoneNumber: msg.contactPhoneNumber,
        };
      } else {
        contactInfo = {
          phoneNumber: msg.contactPhoneNumber,
        };
      }
      return {
        id: msg._id.toString(),
        contact: contactInfo,
        messageBody: msg.messageBody,
        messageImageUrl: msg.messageImageUrl,
        status: msg.status,
        sentAt: msg.sentAt,
      };
    });

    return {
      campaign: campaignResponse,
      messages: messageDtos,
    };
  }

  // Update Campaign
  async updateCampaign(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
    workspaceId: string,
  ): Promise<UpdateCampaignResponse> {
    const { name, targetTags, templateId } = updateCampaignDto;

    const campaign = await this.queriesService.getCampaignById(id, workspaceId);

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Only draft campaigns can be updated');
    }

    const updateFields: any = {};

    if (name !== undefined) {
      if (name.trim() !== campaign.name) {
        const existingCampaign = await this.queriesService.getCampaignByName(
          workspaceId,
          name.trim(),
        );

        if (existingCampaign) {
          throw new ConflictException(
            'Campaign with this name already exists in this workspace',
          );
        }
      }

      updateFields.name = name.trim();
    }

    if (targetTags !== undefined) {
      if (!Array.isArray(targetTags) || targetTags.length === 0) {
        throw new BadRequestException('Target tags must be a non-empty array');
      }
      updateFields.targetTags = targetTags.filter((tag) => tag && tag.trim());
    }

    if (templateId !== undefined) {
      const template = await this.queriesService.getMessageById(
        templateId,
        workspaceId,
      );

      if (!template) {
        throw new NotFoundException('Message template not found');
      }

      updateFields.templateId = templateId;
    }

    const updatedCampaign: any = await this.queriesService.updateCampaign(
      id,
      workspaceId,
      updateFields,
    );

    const targetContacts = await this.queriesService.getContactsByTags(
      workspaceId,
      updatedCampaign.targetTags,
    );
    const contactsCount = targetContacts.length;

    console.log('Updated campaign template data:', updatedCampaign.templateId);
    return {
      message: 'Campaign updated successfully',
      campaign: {
        id: updatedCampaign._id.toString(),
        name: updatedCampaign.name,
        targetTags: updatedCampaign.targetTags,
        template: updatedCampaign.templateId
          ? {
              id: updatedCampaign.templateId._id,
              name: updatedCampaign.templateId.name,
              type: updatedCampaign.templateId.type,
              body: updatedCampaign.templateId.body,
              imageUrl: updatedCampaign.templateId.imageUrl,
            }
          : null,
        status: updatedCampaign.status,
        targetContactsCount: contactsCount,
        createdBy: updatedCampaign.createdBy
          ? {
              id: updatedCampaign.createdBy._id.toString(),
              name: updatedCampaign.createdBy.name,
              email: updatedCampaign.createdBy.email,
            }
          : null,
        createdAt: updatedCampaign.createdAt,
      },
    };
  }

  // Delete Campaign
  async deleteCampaign(
    id: string,
    workspaceId: string,
  ): Promise<DeleteCampaignResponse> {
    const campaign = await this.queriesService.deleteCampaign(id, workspaceId);

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return {
      message: `Campaign ${campaign.name} deleted successfully`,
    };
  }

  // Copy Campaign
  async copyCampaign(
    id: string,
    copyCampaignDto: CopyCampaignDto,
    workspaceId: string,
    createdBy: string,
  ): Promise<CopyCampaignResponse> {
    const originalCampaign = await this.queriesService.getCampaignById(
      id,
      workspaceId,
    );

    if (!originalCampaign) {
      throw new NotFoundException('Campaign not found');
    }

    const newName =
      copyCampaignDto.newName || `${originalCampaign.name} (Copy)`;

    const existingCampaign = await this.queriesService.getCampaignByName(
      workspaceId,
      newName.trim(),
    );

    if (existingCampaign) {
      throw new ConflictException(
        'Campaign with this name already exists in this workspace',
      );
    }

    const campaignData = {
      workspaceId,
      name: newName.trim(),
      targetTags: [...originalCampaign.targetTags],
      templateId: originalCampaign.templateId,
      status: CampaignStatus.DRAFT,
      createdBy,
    };

    const copiedCampaign =
      await this.queriesService.createCampaign(campaignData);

    // Get the populated campaign with template data
    const populatedCampaign: any = await this.queriesService.getCampaignById(
      copiedCampaign._id.toString(),
      workspaceId,
    );

    if (!populatedCampaign) {
      throw new NotFoundException('Failed to retrieve copied campaign');
    }

    const targetContacts = await this.queriesService.getContactsByTags(
      workspaceId,
      populatedCampaign.targetTags,
    );
    const contactsCount = targetContacts.length;

    return {
      message: 'Campaign copied successfully',
      campaign: {
        id: populatedCampaign._id.toString(),
        name: populatedCampaign.name,
        targetTags: populatedCampaign.targetTags,
        templateId:
          populatedCampaign.templateId?._id?.toString() ||
          populatedCampaign.templateId?.toString(),
        template:
          populatedCampaign.templateId &&
          typeof populatedCampaign.templateId === 'object'
            ? {
                id: populatedCampaign.templateId._id.toString(),
                name: populatedCampaign.templateId.name,
                type: populatedCampaign.templateId.type,
                body: populatedCampaign.templateId.body,
                imageUrl: populatedCampaign.templateId.imageUrl,
              }
            : undefined,
        status: populatedCampaign.status as CampaignStatus,
        targetContactsCount: contactsCount,
        createdBy: populatedCampaign.createdBy
          ? {
              id: populatedCampaign.createdBy._id.toString(),
              name: populatedCampaign.createdBy.name,
              email: populatedCampaign.createdBy.email,
            }
          : undefined,
        createdAt: populatedCampaign.createdAt,
      },
    };
  }

  // Launch Campaign
  async launchCampaign(
    id: string,
    workspaceId: string,
  ): Promise<LaunchCampaignResponse> {
    const campaign: any = await this.queriesService.getCampaignById(
      id,
      workspaceId,
    );

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Only draft campaigns can be launched');
    }

    const contacts = await this.queriesService.getContactsByTags(
      workspaceId,
      campaign.targetTags,
    );

    if (contacts.length === 0) {
      await this.queriesService.updateCampaign(id, workspaceId, {
        status: CampaignStatus.COMPLETED,
      });

      return {
        message: 'Campaign launched but no contacts found with target tags',
        campaign: {
          id: campaign._id.toString(),
          status: CampaignStatus.COMPLETED,
          launchedAt: new Date(),
          contactsReached: 0,
        },
      };
    }

    await this.queriesService.updateCampaign(id, workspaceId, {
      status: CampaignStatus.COMPLETED,
      launchedAt: new Date(),
    });

    // Collect all phone numbers in one array
    const allPhoneNumbers = contacts.map((contact) => contact.phoneNumber);

    // Simulate message success/failure (90% success rate)
    const messageSuccess = Math.random() > 0.1;

    const messageData = {
      workspaceId,
      campaignId: campaign._id,
      contactPhoneNumber: allPhoneNumbers,
      messageBody: campaign.templateId.body,
      messageImageUrl: campaign.templateId.imageUrl,
      status: messageSuccess ? 'Sent' : 'Failed',
    };

    await this.queriesService.createCampaignMessages([messageData]);

    return {
      message: 'Campaign launched successfully',
      campaign: {
        id: campaign._id.toString(),
        status: CampaignStatus.COMPLETED,
        launchedAt: new Date(),
        contactsReached: contacts.length,
      },
    };
  }
}
