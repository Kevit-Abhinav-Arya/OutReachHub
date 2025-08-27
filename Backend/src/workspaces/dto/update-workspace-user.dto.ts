import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  MinLength, 
  MaxLength 
} from 'class-validator';

export class UpdateWorkspaceUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsEnum(['Editor', 'Viewer'], { 
    message: 'Role must be either Editor or Viewer' 
  })
  role?: 'Editor' | 'Viewer';
}
