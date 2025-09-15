import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  @MinLength(2, {
    message: 'Workspace name must be at least 2 characters long',
  })
  @MaxLength(100, { message: 'Workspace name must not exceed 100 characters' })
  name?: string;
}
