import { IsString, IsIn, IsOptional, IsUrl } from 'class-validator';

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Text', 'Text & Image'])
  type?: 'Text' | 'Text & Image';

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;
}
