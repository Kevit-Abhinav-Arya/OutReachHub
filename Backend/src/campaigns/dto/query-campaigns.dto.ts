import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetCampaignsQueryDto {
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
  @Transform(({ value }) => value?.trim() || '')
  search?: string = '';

  @IsOptional()
  @IsString()
  @IsIn(['Draft', 'Running', 'Completed'])
  status?: 'Draft' | 'Running' | 'Completed';
}
