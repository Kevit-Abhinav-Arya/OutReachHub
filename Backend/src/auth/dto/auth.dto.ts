import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class UserLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class SelectWorkspaceDto {
  @IsString()
  tempToken: string;

  @IsString()
  workspaceId: string;
}

export class LoginResponseDto {
  message: string;
  token?: string;
  user?: any;
  requiresWorkspaceSelection?: boolean;
  availableWorkspaces?: any[];
  tempToken?: string;
}
