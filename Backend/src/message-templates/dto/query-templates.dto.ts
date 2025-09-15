import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class GetTemplatesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string = '';

  @IsOptional()
  @IsString()
  @IsIn(['Text', 'Text & Image'])
  type?: 'Text' | 'Text & Image';
}
