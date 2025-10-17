import apiClient from "../client";

import type {
  LoginCredentials,
  AdminLoginResponse,
  UserLoginResponse,
  SelectWorkspaceRequest,
  SelectWorkspaceResponse,
  VerifyTokenResponse,
} from "@/features/auth/types/auth.types";


export const authApi = {
  // Admin login
  adminLogin: async (
    credentials: LoginCredentials
  ): Promise<AdminLoginResponse> => {

    const response = await apiClient.post("/auth/admin/login", credentials);
    return response.data;
  },

  // User login
  userLogin: async (
    credentials: LoginCredentials
  ): Promise<UserLoginResponse> => {
    const response = await apiClient.post("/auth/user/login", credentials);
    return response.data;
  },

  // Select workspace after user login
  selectWorkspace: async (
    data: SelectWorkspaceRequest
  ): Promise<SelectWorkspaceResponse> => {
    const response = await apiClient.post("/auth/user/select-workspace", data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  // Verify token
  verifyToken: async (): Promise<VerifyTokenResponse> => {
    const response = await apiClient.get("/auth/verify");
    return response.data;
  },
};
