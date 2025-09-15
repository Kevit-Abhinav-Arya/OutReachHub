import { PaginationResponse, ApiResponse } from '../../common/dto';

export interface WorkspaceResponse {
  id: string;
  name: string;
  createdAt: Date;
  usersCount?: number;
}

export interface WorkspaceUserResponse {
  id: string;
  email: string;
  name: string;
  role: 'Editor' | 'Viewer';
  createdAt: Date;
}

export interface WorkspaceListResponse
  extends ApiResponse<PaginationResponse<WorkspaceResponse>> {}
export interface WorkspaceDetailResponse
  extends ApiResponse<{ workspace: WorkspaceResponse }> {}
export interface WorkspaceUserListResponse
  extends ApiResponse<PaginationResponse<WorkspaceUserResponse>> {}
export interface WorkspaceUserDetailResponse
  extends ApiResponse<{ user: WorkspaceUserResponse }> {}
