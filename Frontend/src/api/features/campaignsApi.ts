import type { CampaignListResponse, CopyCampaignRequest, CopyCampaignResponse, CreateCampaignRequest, CreateCampaignResponse, DeleteCampaignResponse, GetCampaignsQuery, LaunchCampaignResponse, SingleCampaignResponse, UpdateCampaignRequest, UpdateCampaignResponse, WorkspaceTagsResponse } from "@/features/user-portal/campaigns/types";
import apiClient from "../client";



// Get all campaigns
export const getCampaigns = async (
  params?: GetCampaignsQuery
): Promise<CampaignListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.status) queryParams.append("status", params.status);

  const url = `/campaigns${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const response = await apiClient.get<CampaignListResponse>(url);
  return response.data;
};

// Get single campaign
export const getCampaign = async (
  id: string
): Promise<SingleCampaignResponse> => {
  const response = await apiClient.get<SingleCampaignResponse>(
    `/campaigns/${id}`
  );
  return response.data;
};

// Create new campaign
export const createCampaign = async (
  campaignData: CreateCampaignRequest
): Promise<CreateCampaignResponse> => {
  const response = await apiClient.post<CreateCampaignResponse>(
    "/campaigns",
    campaignData
  );
  return response.data;
};

// Update campaign
export const updateCampaign = async (
  id: string,
  campaignData: UpdateCampaignRequest
): Promise<UpdateCampaignResponse> => {
  const response = await apiClient.put<UpdateCampaignResponse>(
    `/campaigns/${id}`,
    campaignData
  );
  return response.data;
};

// Delete campaign
export const deleteCampaign = async (
  id: string
): Promise<DeleteCampaignResponse> => {
  const response = await apiClient.delete<DeleteCampaignResponse>(
    `/campaigns/${id}`
  );
  return response.data;
};

// Copy campaign
export const copyCampaign = async (
  id: string,
  copyData: CopyCampaignRequest
): Promise<CopyCampaignResponse> => {
  const response = await apiClient.post<CopyCampaignResponse>(
    `/campaigns/${id}/copy`,
    copyData
  );
  return response.data;
};

// Launch campaign
export const launchCampaign = async (
  id: string
): Promise<LaunchCampaignResponse> => {
  const response = await apiClient.patch<LaunchCampaignResponse>(
    `/campaigns/${id}/launch`
  );
  return response.data;
};

// Get workspace tags
export const getWorkspaceTags = async (): Promise<WorkspaceTagsResponse> => {
  const response = await apiClient.get<WorkspaceTagsResponse>(
    "/contacts/tags/workspace"
  );
  return response.data;
};
