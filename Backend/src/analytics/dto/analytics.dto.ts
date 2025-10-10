import { IsDateString, IsOptional } from 'class-validator';

// Request DTOs
export class GetAnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// Response DTOs for Charts
export interface ChartDataPoint {
  date: string;
  count: number;
}

export interface MessageTypeChartDataPoint {
  date: string;
  type: 'Text' | 'Text & Image';
  count: number;
}

export interface CampaignsPerDayResponse {
  success: boolean;
  data: ChartDataPoint[];
  message: string;
}

export interface MessagesSentPerTypeResponse {
  success: boolean;
  data: MessageTypeChartDataPoint[];
  message: string;
}

export interface ContactsReachedPerDayResponse {
  success: boolean;
  data: ChartDataPoint[];
  message: string;
}

// Response DTOs for Tables
export interface RecentCampaign {
  _id: string;
  name: string;
  status: string;
  targetTags: string[];
  createdAt: Date;
  launchedAt?: Date;
}

export interface TopContactTag {
  _id: string;
  contactCount: number;
}

export interface RecentCampaignsResponse {
  success: boolean;
  data: RecentCampaign[];
  message: string;
}

export interface TopContactTagsResponse {
  success: boolean;
  data: TopContactTag[];
  message: string;
}
