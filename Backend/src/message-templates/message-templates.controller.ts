import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';
import { Request } from 'express';

import { MessageTemplatesService } from './message-templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ViewerGuard } from '../auth/guards/viewer.guard';
import { EditorGuard } from '../auth/guards/editor.guard';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  GetTemplatesQueryDto,
  CreateTemplateResponse,
  SingleTemplateResponse,
  TemplateListResponse,
  UpdateTemplateResponse,
  DeleteTemplateResponse,
} from './dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    workspaceId: string;
    role: string;
  };
}

@Controller('message-templates')
@UseGuards(JwtAuthGuard)
export class MessageTemplatesController {
  constructor(
    private readonly messageTemplatesService: MessageTemplatesService,
  ) {}

  // Create Template
  @Post()
  @UseGuards(EditorGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTemplate(
    @Body() createTemplateDto: CreateTemplateDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CreateTemplateResponse> {
    return await this.messageTemplatesService.createTemplate(
      createTemplateDto,
      req.user.workspaceId,
      req.user.id,
    );
  }

  // Upload Image for Template
  @Post('upload-image')
  @UseGuards(EditorGuard)
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @HttpCode(HttpStatus.CREATED)
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    // Return the full image URL
    const protocol = req.protocol;
    const host = req.get('Host');
    const imageUrl = `${protocol}://${host}/uploads/message-templates/${file.filename}`;
    
    return {
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl,
        originalName: file.originalname,
        size: file.size,
      },
    };
  }

  // Get All Templates
  @Get()
  @UseGuards(ViewerGuard)
  async getAllTemplates(
    @Query() query: GetTemplatesQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<TemplateListResponse> {
    return await this.messageTemplatesService.getAllTemplates(
      query,
      req.user.workspaceId,
    );
  }

  // Get Template by ID
  @Get(':id')
  @UseGuards(ViewerGuard)
  async getTemplateById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<SingleTemplateResponse> {
    return await this.messageTemplatesService.getTemplateById(
      id,
      req.user.workspaceId,
    );
  }

  // Update Template
  @Put(':id')
  @UseGuards(EditorGuard)
  async updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<UpdateTemplateResponse> {
    return await this.messageTemplatesService.updateTemplate(
      id,
      updateTemplateDto,
      req.user.workspaceId,
    );
  }

  // Delete Template
  @Delete(':id')
  @UseGuards(EditorGuard)
  @HttpCode(HttpStatus.OK)
  async deleteTemplate(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<DeleteTemplateResponse> {
    return await this.messageTemplatesService.deleteTemplate(
      id,
      req.user.workspaceId,
    );
  }
}
