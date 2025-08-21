import { Request } from 'express';
import { ObjectId, Document } from 'mongoose';

//Type Safes 

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    workspaceId: string;
    workspace: {
      _id: string;
      name: string;
      __v: number;
    };
    role: string;
    type: string;
  };
  currentUser?: IAdmin | IUser;
}

// Database Document Interfaces
export interface IAdmin extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface IWorkspace extends Document {
  _id: ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  workspaces: {
    workspaceId: ObjectId;
    workspaceName: string;
    role: 'Editor' | 'Viewer';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IContact extends Document {
  _id: ObjectId;
  workspaceId: ObjectId;
  name: string;
  phoneNumber: string;
  email: string;
  company: string;
  notes?: string;
  tags: string[];
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  _id: ObjectId;
  workspaceId: ObjectId;
  name: string;
  type: 'Text' | 'Text & Image';
  body: string;
  imageUrl?: string;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICampaign extends Document {
  _id: ObjectId;
  workspaceId: ObjectId;
  name: string;
  targetTags: string[];
  templateId: ObjectId;
  status: 'Draft' | 'Running' | 'Completed' | 'Failed';
  createdBy: ObjectId;
  createdAt: Date;
  launchedAt?: Date;
}

export interface ICampaignMessage extends Document {
  _id: ObjectId;
  workspaceId: ObjectId;
  campaignId: ObjectId;
  contactId: ObjectId;
  contactPhoneNumber: string;
  messageBody: string;
  messageImageUrl?: string;
  status: 'Sent' | 'Failed';
  sentAt: Date;
}

export interface IAuthToken extends Document {
  _id: ObjectId;
  userId: ObjectId;
  token: string;
  type: 'access' | 'refresh';
  expiresAt: Date;
  createdAt: Date;
}

export interface IToken extends Document {
  _id: ObjectId;
  userId: ObjectId;
  token: string;
  type: 'tempAccess';
  expiresAt: Date;
  createdAt: Date;
}

// API responses

export interface PaginatedResponse<T> {
  data?: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}

export interface ListOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

export interface ContactListOptions extends ListOptions {
  tags?: string[];
}

export interface CampaignListOptions extends ListOptions {
  status?: string;
}

export interface MessageListOptions extends ListOptions {
  type?: string;
}


// JWT Payload
export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  workspaceId: string;
  workspace: {
    _id: string;
    name: string;
    __v: number;
  };
  role: string;
  type: string;
  tempAccess?: boolean;
  iat: number;
  exp: number;
}
