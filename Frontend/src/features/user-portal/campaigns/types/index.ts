

// Additional local types
export interface CampaignMessage {
  id: string;
  campaignId: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  messageContent: string;
  imageUrl?: string;
  status: "sent" | "failed";
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: "Text" | "Text & Image";
  content: string;
  imageUrl?: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CampaignStats {
  totalCampaigns: number;
  completedCampaigns: number;
  totalMessagesSent: number;
  averageDeliveryRate: number;
}
export interface Campaign {
  id: string;
  name: string;
  targetTags: string[];
  templateId: string;
  template?: {
    id: string;
    name: string;
    type: string;
    body?: string;
    imageUrl?: string;
  };
  status: "Draft" | "Running" | "Completed";
  targetContactsCount?: number;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  launchedAt?: string;
}

export interface CreateCampaignRequest {
  name: string;
  targetTags: string[];
  templateId: string;
}

export interface UpdateCampaignRequest {
  name?: string;
  targetTags?: string[];
  templateId?: string;
}

export interface CopyCampaignRequest {
  newName: string;
}

export interface GetCampaignsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "Draft" | "Running" | "Completed" | "Paused";
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface CreateCampaignResponse {
  message: string;
  campaign: Campaign;
}

export interface SingleCampaignResponse {
  campaign: Campaign;
  messages?: any[];
}

export interface UpdateCampaignResponse {
  message: string;
  campaign: Campaign;
}

export interface DeleteCampaignResponse {
  message: string;
}

export interface CopyCampaignResponse {
  message: string;
  campaign: Campaign;
}

export interface LaunchCampaignResponse {
  message: string;
  campaign: Campaign;
}

export interface WorkspaceTagsResponse {
  tags: string[];
}