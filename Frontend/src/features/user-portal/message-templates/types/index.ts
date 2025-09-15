// Backend-aligned types
export interface TemplateCreator {
  id: string;
  name: string;
  email: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: "Text" | "Text & Image";
  body: string;
  imageUrl?: string;
  createdBy: TemplateCreator;
  createdAt: Date;
}

// Request types
export interface CreateTemplateRequest {
  name: string;
  type: "Text" | "Text & Image";
  body: string;
  imageUrl?: string;
}

export interface UpdateTemplateRequest {
  name?: string;
  type?: "Text" | "Text & Image";
  body?: string;
  imageUrl?: string;
}

export interface GetTemplatesQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: "Text" | "Text & Image";
}

// Response types
export interface CreateTemplateResponse {
  message: string;
  template: {
    id: string;
    name: string;
    type: string;
    body: string;
    imageUrl?: string;
    createdAt: Date;
  };
}

export interface SingleTemplateResponse {
  template: MessageTemplate;
}

export interface TemplateListResponse {
  templates: MessageTemplate[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface UpdateTemplateResponse {
  message: string;
  template: MessageTemplate;
}

export interface DeleteTemplateResponse {
  message: string;
}
// Component props
export interface MessageTemplateCardProps {
  template: MessageTemplate;
  canEdit: boolean;
  onAction: (
    template: MessageTemplate,
    action: "view" | "edit" | "delete" | "copy"
  ) => void;
}

export interface MessageTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: MessageTemplate | null;
  mode: "create" | "edit" | "view" | "delete" | "copy" | null;
  formData: {
    name: string;
    type: "Text" | "Text & Image";
    body: string;
    imageUrl: string | null;
  };
  onFormChange: (field: string, value: any) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
}

export type MessageTemplateType = "Text" | "Text & Image" | "all";

export interface MessageTemplateFilters {
  type: MessageTemplateType;
  createdBy?: string;
}
