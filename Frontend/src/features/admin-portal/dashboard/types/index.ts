export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  usersCount?: number;
}

export interface WorkspaceUser {
  id: string;
  email: string;
  name: string;
  role: "Editor" | "Viewer";
  createdAt: string;
}
