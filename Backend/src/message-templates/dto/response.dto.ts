export interface TemplateCreatorDto {
  id: string;
  name: string;
  email: string;
}

export interface TemplateResponseDto {
  id: string;
  name: string;
  type: 'Text' | 'Text & Image';
  body: string;
  imageUrl?: string;
  createdBy: TemplateCreatorDto;
  createdAt: Date;
}

export interface TemplateSummaryDto {
  id: string;
  name: string;
  type: 'Text' | 'Text & Image';
  body: string;
  imageUrl?: string;
  createdBy: TemplateCreatorDto;
  createdAt: Date;
}

// API Response interfaces
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
  template: TemplateResponseDto;
}

export interface TemplateListResponse {
  templates: TemplateSummaryDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface UpdateTemplateResponse {
  message: string;
  template: TemplateResponseDto;
}

export interface DeleteTemplateResponse {
  message: string;
}
