import apiClient from "../client";
import type {
  AnalyticsQuery,
  CampaignsPerDayResponse,
  MessagesSentPerTypeResponse,
  ContactsReachedPerDayResponse,
  RecentCampaignsResponse,
  TopContactTagsResponse,
} from "@/features/user-portal/dashboard/types/analytics.types";

export const analyticsApi = {
  // Get campaigns per day chart data
  getCampaignsPerDay: async (
    query?: AnalyticsQuery
  ): Promise<CampaignsPerDayResponse> => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append("startDate", query.startDate);
    if (query?.endDate) params.append("endDate", query.endDate);

    const response = await apiClient.get(
      `/analytics/campaigns-per-day?${params.toString()}`
    );
    return response.data;
  },

  // Get messages sent per type chart data
  getMessagesSentPerType: async (
    query?: AnalyticsQuery
  ): Promise<MessagesSentPerTypeResponse> => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append("startDate", query.startDate);
    if (query?.endDate) params.append("endDate", query.endDate);

    const response = await apiClient.get(
      `/analytics/messages-per-type?${params.toString()}`
    );
    return response.data;
  },

  // Get contacts reached per day chart data
  getContactsReachedPerDay: async (
    query?: AnalyticsQuery
  ): Promise<ContactsReachedPerDayResponse> => {
    const params = new URLSearchParams();
    if (query?.startDate) params.append("startDate", query.startDate);
    if (query?.endDate) params.append("endDate", query.endDate);

    const response = await apiClient.get(
      `/analytics/contacts-reached?${params.toString()}`
    );
    return response.data;
  },

  // Get recent campaigns table data
  getRecentCampaigns: async (): Promise<RecentCampaignsResponse> => {
    const response = await apiClient.get("/analytics/recent-campaigns");
    return response.data;
  },

  // Get top contact tags table data
  getTopContactTags: async (): Promise<TopContactTagsResponse> => {
    const response = await apiClient.get("/analytics/top-tags");
    return response.data;
  },
};
