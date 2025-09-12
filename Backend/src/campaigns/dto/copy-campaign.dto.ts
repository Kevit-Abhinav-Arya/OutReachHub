import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CopyCampaignDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;
}
