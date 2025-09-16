import { IsEnum, IsOptional } from 'class-validator';

export enum WorkspaceRole {
  EDITOR = 'Editor',
  VIEWER = 'Viewer',
}

export class AssignUserToWorkspaceDto {
  @IsOptional()
  @IsEnum(WorkspaceRole)
  role?: WorkspaceRole = WorkspaceRole.VIEWER;
}
