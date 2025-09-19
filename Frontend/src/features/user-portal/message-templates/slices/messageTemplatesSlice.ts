import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import * as messageTemplatesApi from "@/api/features/messageTemplatesApi";
import type {
  MessageTemplate,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  GetTemplatesQuery,
} from "../types";

// Async thunks for message templates API calls
export const fetchMessageTemplates = createAsyncThunk(
  "messageTemplates/fetchMessageTemplates",
  async (query: GetTemplatesQuery = {}, { rejectWithValue }) => {
    try {
      const response = await messageTemplatesApi.getMessageTemplates(query);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch templates"
      );
    }
  }
);

export const fetchMessageTemplateById = createAsyncThunk(
  "messageTemplates/fetchMessageTemplateById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await messageTemplatesApi.getMessageTemplate(id);
      return response.template;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch template"
      );
    }
  }
);

export const createMessageTemplate = createAsyncThunk(
  "messageTemplates/createMessageTemplate",
  async (templateData: CreateTemplateRequest, { rejectWithValue }) => {
    try {
      const response = await messageTemplatesApi.createMessageTemplate(
        templateData
      );
      return response.template;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create template"
      );
    }
  }
);

export const updateMessageTemplate = createAsyncThunk(
  "messageTemplates/updateMessageTemplate",
  async (
    { id, templateData }: { id: string; templateData: UpdateTemplateRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await messageTemplatesApi.updateMessageTemplate(
        id,
        templateData
      );
      return response.template;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update template"
      );
    }
  }
);

export const deleteMessageTemplate = createAsyncThunk(
  "messageTemplates/deleteMessageTemplate",
  async (id: string, { rejectWithValue }) => {
    try {
      await messageTemplatesApi.deleteMessageTemplate(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete template"
      );
    }
  }
);

export const uploadTemplateImage = createAsyncThunk(
  "messageTemplates/uploadTemplateImage",
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await messageTemplatesApi.uploadTemplateImage(file);
      return response.data.imageUrl;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload image"
      );
    }
  }
);

// Message Templates state interface
interface MessageTemplatesState {
  templates: MessageTemplate[];
  selectedTemplate: MessageTemplate | null;

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // filters: {
  //   search: string;
  //   type: 'Text' | 'Text & Image' | 'all';
  // };

  // Loading states
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    fetch: boolean;
    upload: boolean;
  };

  // Error states
  error: {
    list: string | null;
    create: string | null;
    update: string | null;
    delete: string | null;
    fetch: string | null;
    upload: string | null;
  };
}

const initialState: MessageTemplatesState = {
  templates: [],
  selectedTemplate: null,

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // filters: {
  //   search: '',
  //   type: 'all',
  // },

  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
    fetch: false,
    upload: false,
  },

  error: {
    list: null,
    create: null,
    update: null,
    delete: null,
    fetch: null,
    upload: null,
  },
};

const messageTemplatesSlice = createSlice({
  name: "messageTemplates",
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.error = {
        list: null,
        create: null,
        update: null,
        delete: null,
        fetch: null,
        upload: null,
      };
    },

    // Clear specific error
    clearError: (
      state,
      action: PayloadAction<keyof MessageTemplatesState["error"]>
    ) => {
      state.error[action.payload] = null;
    },

    // Set filters
    // setSearch: (state, action: PayloadAction<string>) => {
    //   state.filters.search = action.payload;
    //   state.pagination.page = 1; // Reset to first page when searching
    // },

    // setTypeFilter: (state, action: PayloadAction<'Text' | 'Text & Image' | 'all'>) => {
    //   state.filters.type = action.payload;
    //   state.pagination.page = 1; // Reset to first page when filtering
    // },

    // Set pagination
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },

    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page when changing limit
    },

    // Select template
    selectTemplate: (state, action: PayloadAction<MessageTemplate | null>) => {
      state.selectedTemplate = action.payload;
    },

    // Clear selected template
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
    },
  },

  extraReducers: (builder) => {
    // Fetch templates
    builder
      .addCase(fetchMessageTemplates.pending, (state) => {
        state.loading.list = true;
        state.error.list = null;
      })
      .addCase(fetchMessageTemplates.fulfilled, (state, action) => {
        state.loading.list = false;
        state.templates = action.payload.templates;
        state.pagination = {
          page: action.payload.pagination.currentPage,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.totalItems,
          totalPages: action.payload.pagination.totalPages,
        };
      })
      .addCase(fetchMessageTemplates.rejected, (state, action) => {
        state.loading.list = false;
        state.error.list = action.payload as string;
      });

    // Fetch single template
    builder
      .addCase(fetchMessageTemplateById.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
      })
      .addCase(fetchMessageTemplateById.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.selectedTemplate = action.payload;
      })
      .addCase(fetchMessageTemplateById.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error.fetch = action.payload as string;
      });

    // Create template
    builder
      .addCase(createMessageTemplate.pending, (state) => {
        state.loading.create = true;
        state.error.create = null;
      })
      .addCase(createMessageTemplate.fulfilled, (state) => {
        state.loading.create = false;
        // Don't add to list here since the response doesn't have full template data
        // The component will refetch the list after successful creation
      })
      .addCase(createMessageTemplate.rejected, (state, action) => {
        state.loading.create = false;
        state.error.create = action.payload as string;
      });

    // Update template
    builder
      .addCase(updateMessageTemplate.pending, (state) => {
        state.loading.update = true;
        state.error.update = null;
      })
      .addCase(updateMessageTemplate.fulfilled, (state, action) => {
        state.loading.update = false;
        const updatedTemplate = action.payload;
        const index = state.templates.findIndex(
          (template) => template.id === updatedTemplate.id
        );
        if (index !== -1) {
          state.templates[index] = updatedTemplate;
        }
        if (state.selectedTemplate?.id === updatedTemplate.id) {
          state.selectedTemplate = updatedTemplate;
        }
      })
      .addCase(updateMessageTemplate.rejected, (state, action) => {
        state.loading.update = false;
        state.error.update = action.payload as string;
      });

    // Delete template
    builder
      .addCase(deleteMessageTemplate.pending, (state) => {
        state.loading.delete = true;
        state.error.delete = null;
      })
      .addCase(deleteMessageTemplate.fulfilled, (state, action) => {
        state.loading.delete = false;
        const deletedId = action.payload;
        state.templates = state.templates.filter(
          (template) => template.id !== deletedId
        );
        state.pagination.total -= 1;
        if (state.selectedTemplate?.id === deletedId) {
          state.selectedTemplate = null;
        }
      })
      .addCase(deleteMessageTemplate.rejected, (state, action) => {
        state.loading.delete = false;
        state.error.delete = action.payload as string;
      });

    // Upload image
    builder
      .addCase(uploadTemplateImage.pending, (state) => {
        state.loading.upload = true;
        state.error.upload = null;
      })
      .addCase(uploadTemplateImage.fulfilled, (state) => {
        state.loading.upload = false;
      })
      .addCase(uploadTemplateImage.rejected, (state, action) => {
        state.loading.upload = false;
        state.error.upload = action.payload as string;
      });
  },
});

export const {
  clearErrors,
  clearError,
  // setSearch,
  // setTypeFilter,
  setPage,
  setLimit,
  selectTemplate,
  clearSelectedTemplate,
} = messageTemplatesSlice.actions;

export default messageTemplatesSlice.reducer;

// Selectors
export const selectMessageTemplates = (state: any) =>
  state.messageTemplates.templates;
export const selectSelectedTemplate = (state: any) =>
  state.messageTemplates.selectedTemplate;
export const selectPagination = (state: any) =>
  state.messageTemplates.pagination;
export const selectFilters = (state: any) => state.messageTemplates.filters;
export const selectLoading = (state: any) => state.messageTemplates.loading;
export const selectErrors = (state: any) => state.messageTemplates.error;
