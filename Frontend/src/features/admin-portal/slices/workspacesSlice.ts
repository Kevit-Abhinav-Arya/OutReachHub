import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { adminWorkspacesApi } from "../../../api/features/adminWorkspacesApi";
import type {
  GetWorkspacesQuery,
  GetWorkspaceUsersQuery,
} from "../../../api/features/adminWorkspacesApi";

// Types for workspace management
export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  usersCount?: number;
}

export interface WorkspaceUser {
  id: string;
  email: string;
  name: string;
  role: "Editor" | "Viewer";
  createdAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
}

export interface UpdateWorkspaceRequest {
  name: string;
}

export interface CreateWorkspaceUserRequest {
  name: string;
  email: string;
  password: string;
  role: "Editor" | "Viewer";
}

export interface UpdateWorkspaceUserRequest {
  name?: string;
  email?: string;
  role?: "Editor" | "Viewer";
}

// API Response types
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export interface WorkspacesResponse {
  data: Workspace[];
  pagination: PaginationMeta;
}

export interface WorkspaceUsersResponse {
  data: WorkspaceUser[];
  pagination: PaginationMeta;
}

// State interface
export interface WorkspacesState {
  // Workspaces
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  workspacesLoading: boolean;
  workspacesError: string | null;
  workspacesPagination: PaginationMeta | null;

  // Workspace Users
  workspaceUsers: WorkspaceUser[];
  workspaceUsersLoading: boolean;
  workspaceUsersError: string | null;
  workspaceUsersPagination: PaginationMeta | null;

  // UI state
  isCreatingWorkspace: boolean;
  isUpdatingWorkspace: boolean;
  isDeletingWorkspace: boolean;
  isCreatingUser: boolean;
  isUpdatingUser: boolean;
  isDeletingUser: boolean;
}

// Initial state
const initialState: WorkspacesState = {
  // Workspaces
  workspaces: [],
  currentWorkspace: null,
  workspacesLoading: false,
  workspacesError: null,
  workspacesPagination: null,

  // Workspace Users
  workspaceUsers: [],
  workspaceUsersLoading: false,
  workspaceUsersError: null,
  workspaceUsersPagination: null,

  // UI state
  isCreatingWorkspace: false,
  isUpdatingWorkspace: false,
  isDeletingWorkspace: false,
  isCreatingUser: false,
  isUpdatingUser: false,
  isDeletingUser: false,
};

// Async thunks for workspace operations
export const fetchWorkspaces = createAsyncThunk(
  "workspaces/fetchWorkspaces",
  async (query: GetWorkspacesQuery = {}, { rejectWithValue }) => {
    try {
      const response = await adminWorkspacesApi.getWorkspaces(query);
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch workspaces";
      return rejectWithValue(message);
    }
  }
);

export const createWorkspace = createAsyncThunk(
  "workspaces/createWorkspace",
  async (data: CreateWorkspaceRequest, { rejectWithValue }) => {
    try {
      const response = await adminWorkspacesApi.createWorkspace(data);
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to create workspace";
      return rejectWithValue(message);
    }
  }
);

export const updateWorkspace = createAsyncThunk(
  "workspaces/updateWorkspace",
  async (
    { id, data }: { id: string; data: UpdateWorkspaceRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminWorkspacesApi.updateWorkspace(id, data);
      return { id, workspace: response.workspace };
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update workspace";
      return rejectWithValue(message);
    }
  }
);

export const deleteWorkspace = createAsyncThunk(
  "workspaces/deleteWorkspace",
  async (id: string, { rejectWithValue }) => {
    try {
      await adminWorkspacesApi.deleteWorkspace(id);
      return id;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to delete workspace";
      return rejectWithValue(message);
    }
  }
);

// Async thunks for workspace users
export const fetchWorkspaceUsers = createAsyncThunk(
  "workspaces/fetchWorkspaceUsers",
  async (
    {
      workspaceId,
      query = {},
    }: { workspaceId: string; query?: GetWorkspaceUsersQuery },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminWorkspacesApi.getWorkspaceUsers(
        workspaceId,
        query
      );
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to fetch workspace users";
      return rejectWithValue(message);
    }
  }
);

export const createWorkspaceUser = createAsyncThunk(
  "workspaces/createWorkspaceUser",
  async (
    {
      workspaceId,
      data,
    }: { workspaceId: string; data: CreateWorkspaceUserRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminWorkspacesApi.createWorkspaceUser(
        workspaceId,
        data
      );
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create user";
      return rejectWithValue(message);
    }
  }
);

export const updateWorkspaceUser = createAsyncThunk(
  "workspaces/updateWorkspaceUser",
  async (
    {
      workspaceId,
      userId,
      data,
    }: {
      workspaceId: string;
      userId: string;
      data: UpdateWorkspaceUserRequest;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminWorkspacesApi.updateWorkspaceUser(
        workspaceId,
        userId,
        data
      );
      return { userId, user: response.user };
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update user";
      return rejectWithValue(message);
    }
  }
);

export const deleteWorkspaceUser = createAsyncThunk(
  "workspaces/deleteWorkspaceUser",
  async (
    { workspaceId, userId }: { workspaceId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      await adminWorkspacesApi.deleteWorkspaceUser(workspaceId, userId);
      return userId;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete user";
      return rejectWithValue(message);
    }
  }
);

// Workspaces slice
const workspacesSlice = createSlice({
  name: "workspaces",
  initialState,
  reducers: {
    clearWorkspacesError: (state) => {
      state.workspacesError = null;
    },
    clearWorkspaceUsersError: (state) => {
      state.workspaceUsersError = null;
    },

    setCurrentWorkspace: (state, action: PayloadAction<Workspace | null>) => {
      state.currentWorkspace = action.payload;
    },

    clearWorkspaceUsers: (state) => {
      state.workspaceUsers = [];
      state.workspaceUsersError = null;
      state.workspaceUsersPagination = null;
    },

    resetWorkspacesState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Workspaces
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.workspacesLoading = true;
        state.workspacesError = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.workspacesLoading = false;
        state.workspaces = action.payload.data;
        state.workspacesPagination = action.payload.pagination;
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.workspacesLoading = false;
        state.workspacesError = action.payload as string;
      });

    // Create Workspace
    builder
      .addCase(createWorkspace.pending, (state) => {
        state.isCreatingWorkspace = true;
        state.workspacesError = null;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.isCreatingWorkspace = false;
        state.workspaces.unshift(action.payload.workspace);
        if (state.workspacesPagination) {
          state.workspacesPagination.totalItems += 1;
        }
      })
      .addCase(createWorkspace.rejected, (state, action) => {
        state.isCreatingWorkspace = false;
        state.workspacesError = action.payload as string;
      });

    // Update Workspace
    builder
      .addCase(updateWorkspace.pending, (state) => {
        state.isUpdatingWorkspace = true;
        state.workspacesError = null;
      })
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        state.isUpdatingWorkspace = false;
        const index = state.workspaces.findIndex(
          (w) => w.id === action.payload.id
        );
        if (index !== -1) {
          state.workspaces[index] = action.payload.workspace;
        }
        if (state.currentWorkspace?.id === action.payload.id) {
          state.currentWorkspace = action.payload.workspace;
        }
      })
      .addCase(updateWorkspace.rejected, (state, action) => {
        state.isUpdatingWorkspace = false;
        state.workspacesError = action.payload as string;
      });

    // Delete Workspace
    builder
      .addCase(deleteWorkspace.pending, (state) => {
        state.isDeletingWorkspace = true;
        state.workspacesError = null;
      })
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.isDeletingWorkspace = false;
        state.workspaces = state.workspaces.filter(
          (w) => w.id !== action.payload
        );
        if (state.currentWorkspace?.id === action.payload) {
          state.currentWorkspace = null;
          state.workspaceUsers = [];
        }
        if (state.workspacesPagination) {
          state.workspacesPagination.totalItems -= 1;
        }
      })
      .addCase(deleteWorkspace.rejected, (state, action) => {
        state.isDeletingWorkspace = false;
        state.workspacesError = action.payload as string;
      });

    // Fetch Workspace Users
    builder
      .addCase(fetchWorkspaceUsers.pending, (state) => {
        state.workspaceUsersLoading = true;
        state.workspaceUsersError = null;
      })
      .addCase(fetchWorkspaceUsers.fulfilled, (state, action) => {
        state.workspaceUsersLoading = false;
        state.workspaceUsers = action.payload.data;
        state.workspaceUsersPagination = action.payload.pagination;
      })
      .addCase(fetchWorkspaceUsers.rejected, (state, action) => {
        state.workspaceUsersLoading = false;
        state.workspaceUsersError = action.payload as string;
      });

    // Create Workspace User
    builder
      .addCase(createWorkspaceUser.pending, (state) => {
        state.isCreatingUser = true;
        state.workspaceUsersError = null;
      })
      .addCase(createWorkspaceUser.fulfilled, (state, action) => {
        state.isCreatingUser = false;
        state.workspaceUsers.unshift(action.payload.user);
        if (state.workspaceUsersPagination) {
          state.workspaceUsersPagination.totalItems += 1;
        }
      })
      .addCase(createWorkspaceUser.rejected, (state, action) => {
        state.isCreatingUser = false;
        state.workspaceUsersError = action.payload as string;
      });

    // Update Workspace User
    builder
      .addCase(updateWorkspaceUser.pending, (state) => {
        state.isUpdatingUser = true;
        state.workspaceUsersError = null;
      })
      .addCase(updateWorkspaceUser.fulfilled, (state, action) => {
        state.isUpdatingUser = false;
        const index = state.workspaceUsers.findIndex(
          (u) => u.id === action.payload.userId
        );
        if (index !== -1) {
          state.workspaceUsers[index] = action.payload.user;
        }
      })
      .addCase(updateWorkspaceUser.rejected, (state, action) => {
        state.isUpdatingUser = false;
        state.workspaceUsersError = action.payload as string;
      });

    // Delete Workspace User
    builder
      .addCase(deleteWorkspaceUser.pending, (state) => {
        state.isDeletingUser = true;
        state.workspaceUsersError = null;
      })
      .addCase(deleteWorkspaceUser.fulfilled, (state, action) => {
        state.isDeletingUser = false;
        state.workspaceUsers = state.workspaceUsers.filter(
          (u) => u.id !== action.payload
        );
        if (state.workspaceUsersPagination) {
          state.workspaceUsersPagination.totalItems -= 1;
        }
      })
      .addCase(deleteWorkspaceUser.rejected, (state, action) => {
        state.isDeletingUser = false;
        state.workspaceUsersError = action.payload as string;
      });
  },
});

export const {
  clearWorkspacesError,
  clearWorkspaceUsersError,
  setCurrentWorkspace,
  clearWorkspaceUsers,
  resetWorkspacesState,
} = workspacesSlice.actions;

export default workspacesSlice.reducer;
