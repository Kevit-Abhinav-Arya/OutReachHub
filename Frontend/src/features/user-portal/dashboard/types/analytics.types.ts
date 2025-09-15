export interface ChartDataPoint {
  date: string;
  count: number;
}

export interface MessageTypeChartDataPoint {
  date: string;
  type: 'Text' | 'Text & Image';
  count: number;
}

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

// Analytics Query Parameters
export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
}

// API Response Types
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