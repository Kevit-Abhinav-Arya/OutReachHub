import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../../../api/features/authApi";
import type {
  AuthUser,
  LoginCredentials,
  AdminLoginResponse,
  UserLoginResponse,
  SelectWorkspaceRequest,
  SelectWorkspaceResponse,
  Workspace,
} from "../types/auth.types";

// Auth state interface
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requiresWorkspaceSelection: boolean;
  availableWorkspaces: Workspace[];
  tempToken: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  requiresWorkspaceSelection: false,
  availableWorkspaces: [],
  tempToken: null,
};

// Async thunks
export const adminLogin = createAsyncThunk(
  "auth/adminLogin",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.adminLogin(credentials);
      // Storing token in localStorage
      localStorage.setItem("authToken", response.token);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      return rejectWithValue(message);
    }
  }
);

export const userLogin = createAsyncThunk(
  "auth/userLogin",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.userLogin(credentials);
      // If user is assosciated with single workspace then directly store token
      if (response.token) {
        localStorage.setItem("authToken", response.token);
      }
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      return rejectWithValue(message);
    }
  }
);

export const selectWorkspace = createAsyncThunk(
  "auth/selectWorkspace",
  async (data: SelectWorkspaceRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.selectWorkspace(data);
      // Store token after workspace selection
      localStorage.setItem("authToken", response.token);
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Workspace selection failed";
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout", // For user-initiated logout (proper API cleanup)
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      localStorage.removeItem("authToken");
      return;
    } catch (error: any) {
      // Even if API call fails clearing local storage
      localStorage.removeItem("authToken");
      const message = error.response?.data?.message || "Logout failed";
      return rejectWithValue(message);
    }
  }
);

export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyToken();
      return response;
    } catch (error:any) {
      // Don't remove token here - let the calling code handle it
      const message =
        error.response?.data?.message || "Token verification failed";
      return rejectWithValue(message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearWorkspaceSelection: (state) => {
      state.requiresWorkspaceSelection = false;
      state.availableWorkspaces = [];
      state.tempToken = null;
    },
    clearAuth: (state) => {
      // For forced logout (token validation failures, immediate cleanup)
      // Clear all auth state
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.requiresWorkspaceSelection = false;
      state.availableWorkspaces = [];
      state.tempToken = null;
    },
  },
  extraReducers: (builder) => {
    // Admin login
    builder
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        adminLogin.fulfilled,
        (state, action: PayloadAction<AdminLoginResponse>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // User login
    builder
      .addCase(userLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        userLogin.fulfilled,
        (state, action: PayloadAction<UserLoginResponse>) => {
          state.isLoading = false;

          if (action.payload.requiresWorkspaceSelection) {
            // Multiple workspaces
            state.requiresWorkspaceSelection = true;
            state.availableWorkspaces =
              action.payload.availableWorkspaces || [];
            state.tempToken = action.payload.tempToken || null;
            state.user = action.payload.user;
          } else {
            // Single workspace
            state.user = action.payload.user;
            state.token = action.payload.token || null;
            state.isAuthenticated = true;
          }
          state.error = null;
        }
      )
      .addCase(userLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Select workspace
    builder
      .addCase(selectWorkspace.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        selectWorkspace.fulfilled,
        (state, action: PayloadAction<SelectWorkspaceResponse>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.requiresWorkspaceSelection = false;
          state.availableWorkspaces = [];
          state.tempToken = null;
          state.error = null;
        }
      )
      .addCase(selectWorkspace.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, () => {
        return initialState;
      })
      .addCase(logout.rejected, () => {
        // Even if logout fails clearing the state
        return initialState;
      });

    // Verify token
    builder
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.valid;
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

// Export actions
export const { clearError, clearWorkspaceSelection, clearAuth } =
  authSlice.actions;

// Selectors
export const selectAuth = (state: any) => state.auth;
export const selectUser = (state: any) => state.auth.user;
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
export const selectIsLoading = (state: any) => state.auth.isLoading;
export const selectError = (state: any) => state.auth.error;
export const selectRequiresWorkspaceSelection = (state: any) =>
  state.auth.requiresWorkspaceSelection;
export const selectAvailableWorkspaces = (state: any) =>
  state.auth.availableWorkspaces;
export const selectTempToken = (state: any) => state.auth.tempToken;

// selectors for permissions
export const selectIsAdmin = (state: any) => state.auth.user?.type === "admin";
export const selectIsEditor = (state: any) => {
  const user = state.auth.user;
  return user?.type === "admin" || user?.role === "Editor";
};
export const selectIsViewer = (state: any) => {
  const user = state.auth.user;
  return (
    user?.type === "admin" || user?.role === "Editor" || user?.role === "Viewer"
  );
};

export default authSlice.reducer;
