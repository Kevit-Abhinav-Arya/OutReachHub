import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsIn(['Text', 'Text & Image'])
  type: 'Text' | 'Text & Image';

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
