import { IsString, IsArray, IsMongoId, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
          .filter((tag) => tag && typeof tag === 'string' && tag.trim())
          .map((tag) => tag.trim())
      : [],
  )
  targetTags?: string[];

  @IsOptional()
  @IsString()
  @IsMongoId()
  templateId?: string;
}
