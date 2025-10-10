// Auth API types and interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    type: "admin";
  };
}

export interface UserLoginResponse {
  message: string;
  token?: string;
  user: {
    id: string;
    email: string;
    name: string;
    type: "user";
    role?: string;
    workspaceId?: string;
    workspaceName?: string;
  };
  requiresWorkspaceSelection?: boolean;
  availableWorkspaces?: Workspace[];
  tempToken?: string;
}

export interface Workspace {
  workspaceId: string;
  name: string;
  role: "Editor" | "Viewer";
}

export interface SelectWorkspaceRequest {
  tempToken: string;
  workspaceId: string;
}

export interface SelectWorkspaceResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    type: "user";
    role: string;
    workspaceId: string;
    workspaceName: string;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  type: "admin" | "user";
  role?: string;
  workspaceId?: string;
  workspaceName?: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user: AuthUser;
}

// Auth API error response
export interface AuthError {
  message: string;
  statusCode: number;
  error?: string;
}
