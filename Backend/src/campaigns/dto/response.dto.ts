export interface CampaignCreatorDto {
  id: string;
  name: string;
  email: string;
}

export interface CampaignTemplateDto {
  id: string;
  name: string;
  type: 'Text' | 'Text & Image';
  body?: string;
  imageUrl?: string;
}

export interface CampaignContactDto {
  id?: string;
  name?: string;
  phoneNumber: string[];
}

export interface CampaignMessageDto {
  id: string;
  contact: CampaignContactDto;
  messageBody: string;
  messageImageUrl?: string;
  status: 'Sent' | 'Failed';
  sentAt?: Date;
}

export interface CampaignResponseDto {
  id: string;
  name: string;
  targetTags: string[];
  template: CampaignTemplateDto | null;
  status: 'Draft' | 'Running' | 'Completed';
  createdBy: CampaignCreatorDto | null;
  createdAt: Date;
  launchedAt?: Date;
}

export interface CampaignWithMessagesDto extends CampaignResponseDto {
  messages: CampaignMessageDto[];
}

export interface CampaignSummaryDto {
  id: string;
  name: string;
  targetTags: string[];
  templateId: string;
  template?: CampaignTemplateDto;
  status: 'Draft' | 'Running' | 'Completed';
  targetContactsCount?: number;
  createdBy?: CampaignCreatorDto;
  createdAt: Date;
  launchedAt?: Date;
}

// API Response interfaces
export interface CreateCampaignResponse {
  message: string;
  campaign: CampaignSummaryDto;
}

export interface CampaignListResponse {
  campaigns: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface SingleCampaignResponse {
  campaign: CampaignResponseDto;
  messages: CampaignMessageDto[];
}

export interface UpdateCampaignResponse {
  message: string;
  campaign: {
    id: string;
    name: string;
    targetTags: string[];
    template: CampaignTemplateDto | null;
    status: string;
    targetContactsCount: number;
    createdBy: CampaignCreatorDto | null;
    createdAt: Date;
  };
}

export interface CopyCampaignResponse {
  message: string;
  campaign: CampaignSummaryDto;
}

export interface LaunchCampaignResponse {
  message: string;
  campaign: {
    id: string;
    status: string;
    launchedAt: Date;
    contactsReached?: number;
  };
}

export interface DeleteCampaignResponse {
  message: string;
}
