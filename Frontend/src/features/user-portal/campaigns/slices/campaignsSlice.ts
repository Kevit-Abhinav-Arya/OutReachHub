import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  copyCampaign,
  launchCampaign,
  getWorkspaceTags,
} from "@/api/features/campaignsApi"
import type {
   Campaign,
   CreateCampaignRequest,
   UpdateCampaignRequest,
   CopyCampaignRequest,
   GetCampaignsQuery,
} from "@/features/user-portal/campaigns/types/index";
import { getMessageTemplates } from "../../../../api/features/messageTemplatesApi";

// State interface
export interface CampaignsState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  workspaceTags: string[];
  messageTemplates: any[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  // Progress tracking for launched campaigns
  campaignProgress: Record<
    string,
    {
      status: "launching" | "running" | "completed";
      progress: number;
      startTime?: number;
    }
  >;
}

const initialState: CampaignsState = {
  campaigns: [],
  selectedCampaign: null,
  workspaceTags: [],
  messageTemplates: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  },
  campaignProgress: {},
};

// Async thunks
export const fetchCampaigns = createAsyncThunk(
  "campaigns/fetchCampaigns",
  async (params?: GetCampaignsQuery) => {
    const response = await getCampaigns(params);
    return response;
  }
);

export const fetchCampaign = createAsyncThunk(
  "campaigns/fetchCampaign",
  async (id: string) => {
    const response = await getCampaign(id);
    return response.campaign;
  }
);

export const createCampaignAsync = createAsyncThunk(
  "campaigns/createCampaign",
  async (campaignData: CreateCampaignRequest) => {
    const response = await createCampaign(campaignData);
    return response.campaign;
  }
);

export const updateCampaignAsync = createAsyncThunk(
  "campaigns/updateCampaign",
  async ({
    id,
    campaignData,
  }: {
    id: string;
    campaignData: UpdateCampaignRequest;
  }) => {
    const response = await updateCampaign(id, campaignData);
    return response.campaign;
  }
);

export const deleteCampaignAsync = createAsyncThunk(
  "campaigns/deleteCampaign",
  async (id: string) => {
    await deleteCampaign(id);
    return id;
  }
);

export const copyCampaignAsync = createAsyncThunk(
  "campaigns/copyCampaign",
  async ({ id, copyData }: { id: string; copyData: CopyCampaignRequest }) => {
    const response = await copyCampaign(id, copyData);
    return response.campaign;
  }
);

export const launchCampaignAsync = createAsyncThunk(
  "campaigns/launchCampaign",
  async (id: string) => {
    const response = await launchCampaign(id);
    return response.campaign;
  }
);

export const fetchWorkspaceTags = createAsyncThunk(
  "campaigns/fetchWorkspaceTags",
  async () => {
    const response = await getWorkspaceTags();
    return response.tags;
  }
);

export const fetchMessageTemplates = createAsyncThunk(
  "campaigns/fetchMessageTemplates",
  async () => {
    const response = await getMessageTemplates();
    return response.templates || [];
  }
);

// Mock progress 
export const startCampaignProgress = createAsyncThunk(
  "campaigns/startCampaignProgress",
  async (campaignId: string, { dispatch }) => {
    const startTime = Date.now();

    dispatch(
      setCampaignProgress({
        campaignId,
        progress: {
          status: "launching",
          progress: 0,
          startTime,
        },
      })
    );

    // Simulate progress over 30 seconds
    const totalDuration = 30000; 
    const updateInterval = 500; 
    const progressIncrement = 100 / (totalDuration / updateInterval);

    let currentProgress = 0;

    const progressInterval = setInterval(() => {
      currentProgress += progressIncrement;

      if (currentProgress >= 100) {
        currentProgress = 100;
        dispatch(
          setCampaignProgress({
            campaignId,
            progress: {
              status: "completed",
              progress: 100,
              startTime,
            },
          })
        );
        clearInterval(progressInterval);

        dispatch(updateCampaignStatus({ id: campaignId, status: "Completed" }));
      } else {
        const status = currentProgress < 10 ? "launching" : "running";
        dispatch(
          setCampaignProgress({
            campaignId,
            progress: {
              status,
              progress: Math.min(currentProgress, 100),
              startTime,
            },
          })
        );
      }
    }, updateInterval);

    return campaignId;
  }
);

const campaignsSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCampaign: (state, action: PayloadAction<Campaign | null>) => {
      state.selectedCampaign = action.payload;
    },
    clearSelectedCampaign: (state) => {
      state.selectedCampaign = null;
    },
    setCampaignProgress: (
      state,
      action: PayloadAction<{
        campaignId: string;
        progress: {
          status: "launching" | "running" | "completed";
          progress: number;
          startTime?: number;
        };
      }>
    ) => {
      const { campaignId, progress } = action.payload;
      state.campaignProgress[campaignId] = progress;
    },
    clearCampaignProgress: (state, action: PayloadAction<string>) => {
      delete state.campaignProgress[action.payload];
    },
    updateCampaignStatus: (
      state,
      action: PayloadAction<{ id: string; status: Campaign["status"] }>
    ) => {
      const { id, status } = action.payload;
      const campaign = state.campaigns.find((c) => c.id === id);
      if (campaign) {
        campaign.status = status;
        if (status === "Running") {
          campaign.launchedAt = new Date().toISOString();
        }
      }
      if (state.selectedCampaign?.id === id) {
        state.selectedCampaign.status = status;
        if (status === "Running") {
          state.selectedCampaign.launchedAt = new Date().toISOString();
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch campaigns
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload.campaigns;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch campaigns";
      })

      // Fetch single campaign
      .addCase(fetchCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCampaign = action.payload;
      })
      .addCase(fetchCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch campaign";
      })

      // Create campaign
      .addCase(createCampaignAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCampaignAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns.unshift(action.payload);
        state.pagination.totalItems += 1;
      })
      .addCase(createCampaignAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create campaign";
      })

      // Update campaign
      .addCase(updateCampaignAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCampaignAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.campaigns.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
        if (state.selectedCampaign?.id === action.payload.id) {
          state.selectedCampaign = action.payload;
        }
      })
      .addCase(updateCampaignAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update campaign";
      })

      // Delete campaign
      .addCase(deleteCampaignAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCampaignAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = state.campaigns.filter(
          (c) => c.id !== action.payload
        );
        state.pagination.totalItems -= 1;
        if (state.selectedCampaign?.id === action.payload) {
          state.selectedCampaign = null;
        }
        delete state.campaignProgress[action.payload];
      })
      .addCase(deleteCampaignAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete campaign";
      })

      // Copy campaign
      .addCase(copyCampaignAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(copyCampaignAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns.unshift(action.payload);
        state.pagination.totalItems += 1;
      })
      .addCase(copyCampaignAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to copy campaign";
      })

      // Launch campaign
      .addCase(launchCampaignAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(launchCampaignAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.campaigns.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
       
          state.campaigns[index] = {
            ...state.campaigns[index],
            status: "Running",
            launchedAt: action.payload.launchedAt,
          };
        }
        if (state.selectedCampaign?.id === action.payload.id) {
          state.selectedCampaign = {
            ...state.selectedCampaign,
            status: "Running", 
            launchedAt: action.payload.launchedAt,
          };
        }
      })
      .addCase(launchCampaignAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to launch campaign";
      })

      // Fetch workspace tags
      .addCase(fetchWorkspaceTags.fulfilled, (state, action) => {
        state.workspaceTags = action.payload;
      })
      .addCase(fetchWorkspaceTags.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch workspace tags";
      })

      // Fetch message templates
      .addCase(fetchMessageTemplates.fulfilled, (state, action) => {
        state.messageTemplates = action.payload;
      })
      .addCase(fetchMessageTemplates.rejected, (state, action) => {
        state.error =
          action.error.message || "Failed to fetch message templates";
      });
  },
});

export const {
  clearError,
  setSelectedCampaign,
  clearSelectedCampaign,
  setCampaignProgress,
  clearCampaignProgress,
  updateCampaignStatus,
} = campaignsSlice.actions;

export default campaignsSlice.reducer;
