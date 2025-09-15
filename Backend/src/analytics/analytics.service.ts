import { Injectable, BadRequestException } from '@nestjs/common';
import { QueriesService } from '../common/services/queries.service';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import {
  GetAnalyticsQueryDto,
  CampaignsPerDayResponse,
  MessagesSentPerTypeResponse,
  ContactsReachedPerDayResponse,
  RecentCampaignsResponse,
  TopContactTagsResponse,
  ChartDataPoint,
  MessageTypeChartDataPoint,
} from './dto/analytics.dto';

dayjs.extend(utc);

@Injectable()
export class AnalyticsService {
  constructor(private readonly queriesService: QueriesService) {}

  //Get campaigns per day chart data

  async getCampaignsPerDay(
    workspaceId: string,
    query: GetAnalyticsQueryDto,
  ): Promise<CampaignsPerDayResponse> {
    try {
      const { startDate, endDate } = this.getDateRange(query);

      const data = await this.queriesService.getCampaignsPerDay(
        workspaceId,
        startDate,
        endDate,
      );

      return {
        success: true,
        data: this.formatChartData(data),
        message: 'Campaigns per day data retrieved successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve campaigns per day: ${error.message}`,
      );
    }
  }

  //Get messages sent per type per day

  async getMessagesSentPerType(
    workspaceId: string,
    query: GetAnalyticsQueryDto,
  ): Promise<MessagesSentPerTypeResponse> {
    try {
      const { startDate, endDate } = this.getDateRange(query);
      const data = await this.queriesService.getMessagesSentPerTypePerDay(
        workspaceId,
        startDate,
        endDate,
      );

      return {
        success: true,
        data: this.formatMessageTypeData(data),
        message: 'Messages sent per type data retrieved successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve messages per type: ${error.message}`,
      );
    }
  }

  //  Get contacts reached per day

  async getContactsReachedPerDay(
    workspaceId: string,
    query: GetAnalyticsQueryDto,
  ): Promise<ContactsReachedPerDayResponse> {
    try {
      const { startDate, endDate } = this.getDateRange(query);
      const data = await this.queriesService.getContactsReachedPerDay(
        workspaceId,
        startDate,
        endDate,
      );

      return {
        success: true,
        data: this.formatChartData(data),
        message: 'Contacts reached per day data retrieved successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve contacts reached per day: ${error.message}`,
      );
    }
  }

  //Get recent campaigns

  async getRecentCampaigns(
    workspaceId: string,
  ): Promise<RecentCampaignsResponse> {
    try {
      const campaigns =
        await this.queriesService.getRecentCampaigns(workspaceId);

      return {
        success: true,
        data: campaigns.map((campaign) => ({
          _id: campaign._id.toString(),
          name: campaign.name,
          status: campaign.status,
          targetTags: campaign.targetTags,
          createdAt: campaign.createdAt,
          launchedAt: campaign.launchedAt,
        })),
        message: 'Recent campaigns retrieved successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve recent campaigns: ${error.message}`,
      );
    }
  }

  // Get top contact tags

  async getTopContactTags(
    workspaceId: string,
  ): Promise<TopContactTagsResponse> {
    try {
      const tags = await this.queriesService.getTopContactTags(workspaceId);

      return {
        success: true,
        data: tags,
        message: 'Top contact tags retrieved successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve top contact tags: ${error.message}`,
      );
    }
  }

  private getDateRange(query: GetAnalyticsQueryDto): {
    startDate: Date;
    endDate: Date;
  } {
    let endDate: Date;
    if (query.endDate) {
      endDate = dayjs.utc(query.endDate).endOf('day').toDate();
    } else {
      endDate = dayjs.utc().endOf('day').toDate();
    }

    let startDate: Date;
    if (query.startDate) {
      startDate = dayjs.utc(query.startDate).startOf('day').toDate();
    } else {
      startDate = dayjs
        .utc(endDate)
        .subtract(180, 'day')
        .startOf('day')
        .toDate();
    }

    return { startDate, endDate };
  }

  private formatChartDate(dateString: string): string {
    return dayjs.utc(dateString).format('YYYY-MM-DD');
  }

  private formatChartData(data: any[]): ChartDataPoint[] {
    return data.map((item) => ({
      date: this.formatChartDate(item._id.date || item._id),
      count: item.count,
    }));
  }

  private formatMessageTypeData(data: any[]): MessageTypeChartDataPoint[] {
    return data.map((item) => ({
      date: this.formatChartDate(item._id.date),
      type: item._id.type,
      count: item.count,
    }));
  }
}
