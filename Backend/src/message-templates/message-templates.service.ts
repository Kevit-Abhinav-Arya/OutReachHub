import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { QueriesService } from '../common/services/queries.service';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  GetTemplatesQueryDto,
  CreateTemplateResponse,
  SingleTemplateResponse,
  TemplateListResponse,
  UpdateTemplateResponse,
  DeleteTemplateResponse,
  TemplateResponseDto,
  TemplateSummaryDto,
} from './dto';

@Injectable()
export class MessageTemplatesService {
  constructor(private readonly queriesService: QueriesService) {}

  // Create Template
  async createTemplate(
    createTemplateDto: CreateTemplateDto,
    workspaceId: string,
    createdBy: string,
  ): Promise<CreateTemplateResponse> {
    const { name, type, body, imageUrl } = createTemplateDto;

    if (type === 'Text & Image' && !imageUrl?.trim()) {
      throw new BadRequestException(
        'Image URL is required for "Text & Image" type',
      );
    }

    const existingTemplate = await this.queriesService.getMessageByName(
      workspaceId,
      name.trim(),
    );

    if (existingTemplate) {
      throw new ConflictException(
        'Message template with this name already exists in this workspace',
      );
    }

    const templateData = {
      workspaceId,
      name: name.trim(),
      type,
      body: body.trim(),
      imageUrl: type === 'Text & Image' ? imageUrl?.trim() : undefined,
      createdBy,
    };

    const template = await this.queriesService.createMessage(templateData);

    return {
      message: 'Message template created successfully',
      template: {
        id: template._id.toString(),
        name: template.name,
        type: template.type,
        body: template.body,
        imageUrl: template.imageUrl,
        createdAt: template.createdAt,
      },
    };
  }

  // Get All Templates
  async getAllTemplates(
    query: GetTemplatesQueryDto,
    workspaceId: string,
  ): Promise<TemplateListResponse> {
    const { page = 1, limit = 10, search = '', type } = query;

    const { messages, total } = await this.queriesService.listMessages(
      workspaceId,
      {
        page,
        limit,
        typeFilter: type,
        search,
      },
    );

    const templates: TemplateSummaryDto[] = messages.map((template: any) => ({
      id: template._id.toString(),
      name: template.name,
      type: template.type,
      body: template.body,
      imageUrl: template.imageUrl,
      createdBy: template.createdBy
        ? {
            id: template.createdBy._id.toString(),
            name: template.createdBy.name,
            email: template.createdBy.email,
          }
        : {
            id: '',
            name: 'Unknown User',
            email: '',
          },
      createdAt: template.createdAt,
    }));

    return {
      templates,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit,
      },
    };
  }

  // Get Template by ID
  async getTemplateById(
    id: string,
    workspaceId: string,
  ): Promise<SingleTemplateResponse> {
    const template: any = await this.queriesService.getMessageById(
      id,
      workspaceId,
    );

    if (!template) {
      throw new NotFoundException('Message template not found');
    }

    const templateResponse: TemplateResponseDto = {
      id: template._id.toString(),
      name: template.name,
      type: template.type as 'Text' | 'Text & Image',
      body: template.body,
      imageUrl: template.imageUrl,
      createdBy: template.createdBy
        ? {
            id: template.createdBy._id.toString(),
            name: template.createdBy.name,
            email: template.createdBy.email,
          }
        : {
            id: '',
            name: 'Unknown User',
            email: '',
          },
      createdAt: template.createdAt,
    };

    return {
      template: templateResponse,
    };
  }

  // Update Template
  async updateTemplate(
    id: string,
    updateTemplateDto: UpdateTemplateDto,
    workspaceId: string,
  ): Promise<UpdateTemplateResponse> {
    const { name, type, body, imageUrl } = updateTemplateDto;

    const template = await this.queriesService.getMessageById(id, workspaceId);

    if (!template) {
      throw new NotFoundException('Message template not found');
    }

    const updateFields: any = {};

    if (name !== undefined) {
      if (!name.trim()) {
        throw new BadRequestException('Name cannot be empty');
      }

      if (name.trim() !== template.name) {
        const existingTemplate = await this.queriesService.getMessageByName(
          workspaceId,
          name.trim(),
        );

        if (existingTemplate) {
          throw new ConflictException(
            'Message template with this name already exists in this workspace',
          );
        }
      }

      updateFields.name = name.trim();
    }

    if (type !== undefined) {
      updateFields.type = type;
    }

    if (body !== undefined) {
      if (!body.trim()) {
        throw new BadRequestException('Body cannot be empty');
      }
      updateFields.body = body.trim();
    }

    // Handling imageUrl based on type
    const finalType = template.type;
    if (finalType === 'Text & Image') {
      if (imageUrl !== undefined) {
        updateFields.imageUrl = imageUrl?.trim();
      }
    } else {
      updateFields.imageUrl = undefined;
    }

    const updatedTemplate: any = await this.queriesService.updateMessage(
      id,
      workspaceId,
      updateFields,
    );

    if (!updatedTemplate) {
      throw new NotFoundException('Message template not found after update');
    }

    const templateResponse: TemplateResponseDto = {
      id: updatedTemplate._id.toString(),
      name: updatedTemplate.name,
      type: updatedTemplate.type as 'Text' | 'Text & Image',
      body: updatedTemplate.body,
      imageUrl: updatedTemplate.imageUrl,
      createdBy: updatedTemplate.createdBy
        ? {
            id: updatedTemplate.createdBy._id.toString(),
            name: updatedTemplate.createdBy.name,
            email: updatedTemplate.createdBy.email,
          }
        : {
            id: '',
            name: 'Unknown User',
            email: '',
          },
      createdAt: updatedTemplate.createdAt,
    };

    return {
      message: 'Message template updated successfully',
      template: templateResponse,
    };
  }

  // Delete Template
  async deleteTemplate(
    id: string,
    workspaceId: string,
  ): Promise<DeleteTemplateResponse> {
    const template = await this.queriesService.deleteMessage(id, workspaceId);

    if (!template) {
      throw new NotFoundException('Message template not found');
    }

    return {
      message: 'Message template deleted successfully',
    };
  }
}
