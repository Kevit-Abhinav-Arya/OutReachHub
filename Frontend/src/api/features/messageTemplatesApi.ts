import apiClient from "../client";
import type {
  CreateTemplateRequest,
  UpdateTemplateRequest,
  GetTemplatesQuery,
  CreateTemplateResponse,
  SingleTemplateResponse,
  TemplateListResponse,
  UpdateTemplateResponse,
  DeleteTemplateResponse,
} from "../../features/user-portal/message-templates/types";

// Get all message templates
export const getMessageTemplates = async (params?: GetTemplatesQuery) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.type) queryParams.append("type", params.type);

  const url = `/message-templates${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await apiClient.get<TemplateListResponse>(url);
  return response.data;
};

// Get single message template
export const getMessageTemplate = async (id: string) => {
  const response = await apiClient.get<SingleTemplateResponse>(
    `/message-templates/${id}`
  );
  return response.data;
};

// Create new message template
export const createMessageTemplate = async (
  templateData: CreateTemplateRequest
) => {
  const response = await apiClient.post<CreateTemplateResponse>(
    "/message-templates",
    templateData
  );
  return response.data;
};

// Update message template
export const updateMessageTemplate = async (
  id: string,
  templateData: UpdateTemplateRequest
) => {
  const response = await apiClient.put<UpdateTemplateResponse>(
    `/message-templates/${id}`,
    templateData
  );
  return response.data;
};

// Delete message template
export const deleteMessageTemplate = async (id: string) => {
  const response = await apiClient.delete<DeleteTemplateResponse>(
    `/message-templates/${id}`
  );
  return response.data;
};

// Upload image for template
export const uploadTemplateImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: {
      imageUrl: string;
      originalName: string;
      size: number;
    };
  }>("/message-templates/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
