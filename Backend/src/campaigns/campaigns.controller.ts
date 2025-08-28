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
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User, CurrentUser } from '../common/decorators/user.decorator';
import { EditorGuard } from 'src/auth/guards/editor.guard';
import { ViewerGuard } from 'src/auth/guards/viewer.guard';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CopyCampaignDto,
  GetCampaignsQueryDto,
  CreateCampaignResponse,
  CampaignListResponse,
  SingleCampaignResponse,
  UpdateCampaignResponse,
  CopyCampaignResponse,
  LaunchCampaignResponse,
  DeleteCampaignResponse,
} from './dto';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(EditorGuard)
  async createCampaign(
    @Body() createCampaignDto: CreateCampaignDto,
    @User() user: CurrentUser,
  ): Promise<CreateCampaignResponse> {
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }
    return this.campaignsService.createCampaign(
      createCampaignDto,
      user.workspaceId,
      user.id,
    );
  }

  @Get()
  @UseGuards(ViewerGuard)
  async getAllCampaigns(
    @Query() query: GetCampaignsQueryDto,
    @User() user: CurrentUser,
  ): Promise<CampaignListResponse> {
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }
    return this.campaignsService.getAllCampaigns(query, user.workspaceId);
  }

  @Get(':id')
  @UseGuards(ViewerGuard)
  async getCampaignById(
    @Param('id') id: string,
    @User() user: CurrentUser,
  ): Promise<SingleCampaignResponse> {
    if (!id) {
      throw new BadRequestException('Campaign ID is required');
    }
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }
    return this.campaignsService.getCampaignById(id, user.workspaceId);
  }

  @Put(':id')
  @UseGuards(EditorGuard)
  async updateCampaign(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @User() user: CurrentUser,
  ): Promise<UpdateCampaignResponse> {
    if (!id) {
      throw new BadRequestException('Campaign ID is required');
    }
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }
    return this.campaignsService.updateCampaign(
      id,
      updateCampaignDto,
      user.workspaceId,
    );
  }

  @Delete(':id')
  @UseGuards(EditorGuard)
  async deleteCampaign(
    @Param('id') id: string,
    @User() user: CurrentUser,
  ): Promise<DeleteCampaignResponse> {
    if (!id) {
      throw new BadRequestException('Campaign ID is required');
    }
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }
    return this.campaignsService.deleteCampaign(id, user.workspaceId);
  }

  @Post(':id/copy')
  @UseGuards(EditorGuard)
  async copyCampaign(
    @Param('id') id: string,
    @Body() copyCampaignDto: CopyCampaignDto,
    @User() user: CurrentUser,
  ): Promise<CopyCampaignResponse> {
    if (!id) {
      throw new BadRequestException('Campaign ID is required');
    }
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }
    return this.campaignsService.copyCampaign(
      id,
      copyCampaignDto,
      user.workspaceId,
      user.id,
    );
  }

  @Patch(':id/launch')
  @UseGuards(EditorGuard)
  async launchCampaign(
    @Param('id') id: string,
    @User() user: CurrentUser,
  ): Promise<LaunchCampaignResponse> {
    if (!id) {
      throw new BadRequestException('Campaign ID is required');
    }
    if (!user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }
    return this.campaignsService.launchCampaign(id, user.workspaceId);
  }
}
