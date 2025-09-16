import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ViewerGuard } from '../auth/guards/viewer.guard';
import {
  GetAnalyticsQueryDto,
  CampaignsPerDayResponse,
  MessagesSentPerTypeResponse,
  ContactsReachedPerDayResponse,
  RecentCampaignsResponse,
  TopContactTagsResponse,
} from './dto/analytics.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    workspaceId: string;
    role: string;
  };
}

@Controller('analytics')
@UseGuards(JwtAuthGuard, ViewerGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('campaigns-per-day')
  async getCampaignsPerDay(
    @Query() query: GetAnalyticsQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CampaignsPerDayResponse> {
    if (!req.user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    return await this.analyticsService.getCampaignsPerDay(
      req.user.workspaceId,
      query,
    );
  }

  @Get('messages-per-type')
  async getMessagesSentPerType(
    @Query() query: GetAnalyticsQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<MessagesSentPerTypeResponse> {
    if (!req.user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    return await this.analyticsService.getMessagesSentPerType(
      req.user.workspaceId,
      query,
    );
  }

  @Get('contacts-reached')
  async getContactsReachedPerDay(
    @Query() query: GetAnalyticsQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ContactsReachedPerDayResponse> {
    if (!req.user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    return await this.analyticsService.getContactsReachedPerDay(
      req.user.workspaceId,
      query,
    );
  }

  @Get('recent-campaigns')
  async getRecentCampaigns(
    @Req() req: AuthenticatedRequest,
  ): Promise<RecentCampaignsResponse> {
    if (!req.user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    return await this.analyticsService.getRecentCampaigns(req.user.workspaceId);
  }

  @Get('top-tags')
  async getTopContactTags(
    @Req() req: AuthenticatedRequest,
  ): Promise<TopContactTagsResponse> {
    if (!req.user.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    return await this.analyticsService.getTopContactTags(req.user.workspaceId);
  }
}
