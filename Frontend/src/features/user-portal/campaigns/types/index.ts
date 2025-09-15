export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "running" | "completed";
  targetTags: string[];
  messageTemplateId: string;
  messageTemplateName: string;
  messageTemplateType: "text" | "text-image";
  contactsTargeted: number;
  messagesSent: number;
  messagesDelivered: number;
  messagesFailed: number;
  createdAt: string;
  updatedAt: string;
  launchedAt?: string;
  completedAt?: string;
  progress?: number; // 0-100 for running campaigns
}

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
  type: "text" | "text-image";
  content: string;
  imageUrl?: string;
}

export interface CampaignCreateRequest {
  name: string;
  description?: string;
  targetTags: string[];
  messageTemplateId: string;
}

export interface CampaignLaunchRequest {
  campaignId: string;
}

export interface CampaignStats {
  totalCampaigns: number;
  completedCampaigns: number;
  totalMessagesSent: number;
  averageDeliveryRate: number;
}
