import apiClient from "../client";
import type {
  Workspace,
  WorkspaceUser,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  CreateWorkspaceUserRequest,
  UpdateWorkspaceUserRequest,
  WorkspacesResponse,
  WorkspaceUsersResponse,
} from "@/features/admin-portal/slices/workspacesSlice";

export interface GetWorkspacesQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetWorkspaceUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const adminWorkspacesApi = {
  // Workspace CRUD Operations
  getWorkspaces: async (
    query: GetWorkspacesQuery = {}
  ): Promise<WorkspacesResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.search) params.append("search", query.search);

    const response = await apiClient.get(`/workspaces?${params.toString()}`);
    return response.data;
  },

  getWorkspaceById: async (id: string): Promise<{ workspace: Workspace }> => {
    const response = await apiClient.get(`/workspaces/${id}`);
    return response.data;
  },

  createWorkspace: async (
    data: CreateWorkspaceRequest
  ): Promise<{ message: string; workspace: Workspace }> => {
    const response = await apiClient.post("/workspaces", data);
    return response.data;
  },

  updateWorkspace: async (
    id: string,
    data: UpdateWorkspaceRequest
  ): Promise<{ message: string; workspace: Workspace }> => {
    const response = await apiClient.put(`/workspaces/${id}`, data);
    return response.data;
  },

  deleteWorkspace: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/workspaces/${id}`);
    return response.data;
  },

  // Workspace User Operations
  getWorkspaceUsers: async (
    workspaceId: string,
    query: GetWorkspaceUsersQuery = {}
  ): Promise<WorkspaceUsersResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.search) params.append("search", query.search);

    const response = await apiClient.get(
      `/workspaces/${workspaceId}/users?${params.toString()}`
    );
    return response.data;
  },

  getWorkspaceUserById: async (
    workspaceId: string,
    userId: string
  ): Promise<{ user: WorkspaceUser }> => {
    const response = await apiClient.get(
      `/workspaces/${workspaceId}/users/${userId}`
    );
    return response.data;
  },

  createWorkspaceUser: async (
    workspaceId: string,
    data: CreateWorkspaceUserRequest
  ): Promise<{ message: string; user: WorkspaceUser }> => {
    const response = await apiClient.post(
      `/workspaces/${workspaceId}/users`,
      data
    );
    return response.data;
  },

  updateWorkspaceUser: async (
    workspaceId: string,
    userId: string,
    data: UpdateWorkspaceUserRequest
  ): Promise<{ message: string; user: WorkspaceUser }> => {
    const response = await apiClient.put(
      `/workspaces/${workspaceId}/users/${userId}`,
      data
    );
    return response.data;
  },

  deleteWorkspaceUser: async (
    workspaceId: string,
    userId: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.delete(
      `/workspaces/${workspaceId}/users/${userId}`
    );
    return response.data;
  },
};
