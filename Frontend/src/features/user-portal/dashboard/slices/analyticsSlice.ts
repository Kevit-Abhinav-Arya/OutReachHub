import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { analyticsApi } from '@/api/features/analyticsApi';
import type { ChartDataPoint,  MessageTypeChartDataPoint,  RecentCampaign,  TopContactTag,  AnalyticsQuery } from '../types/analytics.types';

export const fetchCampaignsPerDay = createAsyncThunk(
  'analytics/fetchCampaignsPerDay',
  async (query?: AnalyticsQuery) => {
    const response = await analyticsApi.getCampaignsPerDay(query);
    return response.data;
  }
);

export const fetchMessagesSentPerType = createAsyncThunk(
  'analytics/fetchMessagesSentPerType',
  async (query?: AnalyticsQuery) => {
    const response = await analyticsApi.getMessagesSentPerType(query);
    return response.data;
  }
);

export const fetchContactsReachedPerDay = createAsyncThunk(
  'analytics/fetchContactsReachedPerDay',
  async (query?: AnalyticsQuery) => {
    const response = await analyticsApi.getContactsReachedPerDay(query);
    return response.data;
  }
);

export const fetchRecentCampaigns = createAsyncThunk(
  'analytics/fetchRecentCampaigns',
  async () => {
    const response = await analyticsApi.getRecentCampaigns();
    return response.data;
  }
);

export const fetchTopContactTags = createAsyncThunk(
  'analytics/fetchTopContactTags',
  async () => {
    const response = await analyticsApi.getTopContactTags();
    return response.data;
  }
);

interface AnalyticsState {
  campaignsPerDay: {
    data: ChartDataPoint[];
    loading: boolean;
    error: string | null;
  };
  messagesPerType: {
    data: MessageTypeChartDataPoint[];
    loading: boolean;
    error: string | null;
  };
  contactsReached: {
    data: ChartDataPoint[];
    loading: boolean;
    error: string | null;
  };
  recentCampaigns: {
    data: RecentCampaign[];
    loading: boolean;
    error: string | null;
  };
  topTags: {
    data: TopContactTag[];
    loading: boolean;
    error: string | null;
  };
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
}

const initialState: AnalyticsState = {
  campaignsPerDay: {
    data: [],
    loading: false,
    error: null,
  },
  messagesPerType: {
    data: [],
    loading: false,
    error: null,
  },
  contactsReached: {
    data: [],
    loading: false,
    error: null,
  },
  recentCampaigns: {
    data: [],
    loading: false,
    error: null,
  },
  topTags: {
    data: [],
    loading: false,
    error: null,
  },
  dateRange: {
    startDate: null,
    endDate: null,
  },
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<{ startDate: string | null; endDate: string | null }>) => {
      state.dateRange = action.payload;
    },
    clearAnalyticsData: (state) => {
      state.campaignsPerDay.data = [];
      state.messagesPerType.data = [];
      state.contactsReached.data = [];
      state.recentCampaigns.data = [];
      state.topTags.data = [];
    },
  },
  extraReducers: (builder) => {
    // Campaigns per day
    builder
      .addCase(fetchCampaignsPerDay.pending, (state) => {
        state.campaignsPerDay.loading = true;
        state.campaignsPerDay.error = null;
      })
      .addCase(fetchCampaignsPerDay.fulfilled, (state, action) => {
        state.campaignsPerDay.loading = false;
        state.campaignsPerDay.data = action.payload;
      })
      .addCase(fetchCampaignsPerDay.rejected, (state, action) => {
        state.campaignsPerDay.loading = false;
        state.campaignsPerDay.error = action.error.message || 'Failed to fetch campaigns data';
      });

    // Messages per type
    builder
      .addCase(fetchMessagesSentPerType.pending, (state) => {
        state.messagesPerType.loading = true;
        state.messagesPerType.error = null;
      })
      .addCase(fetchMessagesSentPerType.fulfilled, (state, action) => {
        state.messagesPerType.loading = false;
        state.messagesPerType.data = action.payload;
      })
      .addCase(fetchMessagesSentPerType.rejected, (state, action) => {
        state.messagesPerType.loading = false;
        state.messagesPerType.error = action.error.message || 'Failed to fetch messages data';
      });

    // Contacts reached per day
    builder
      .addCase(fetchContactsReachedPerDay.pending, (state) => {
        state.contactsReached.loading = true;
        state.contactsReached.error = null;
      })
      .addCase(fetchContactsReachedPerDay.fulfilled, (state, action) => {
        state.contactsReached.loading = false;
        state.contactsReached.data = action.payload;
      })
      .addCase(fetchContactsReachedPerDay.rejected, (state, action) => {
        state.contactsReached.loading = false;
        state.contactsReached.error = action.error.message || 'Failed to fetch contacts data';
      });

    // Recent campaigns
    builder
      .addCase(fetchRecentCampaigns.pending, (state) => {
        state.recentCampaigns.loading = true;
        state.recentCampaigns.error = null;
      })
      .addCase(fetchRecentCampaigns.fulfilled, (state, action) => {
        state.recentCampaigns.loading = false;
        state.recentCampaigns.data = action.payload;
      })
      .addCase(fetchRecentCampaigns.rejected, (state, action) => {
        state.recentCampaigns.loading = false;
        state.recentCampaigns.error = action.error.message || 'Failed to fetch recent campaigns';
      });

    // Top contact tags
    builder
      .addCase(fetchTopContactTags.pending, (state) => {
        state.topTags.loading = true;
        state.topTags.error = null;
      })
      .addCase(fetchTopContactTags.fulfilled, (state, action) => {
        state.topTags.loading = false;
        state.topTags.data = action.payload;
      })
      .addCase(fetchTopContactTags.rejected, (state, action) => {
        state.topTags.loading = false;
        state.topTags.error = action.error.message || 'Failed to fetch top tags';
      });
  },
});

export const { setDateRange, clearAnalyticsData } = analyticsSlice.actions;
export default analyticsSlice.reducer;