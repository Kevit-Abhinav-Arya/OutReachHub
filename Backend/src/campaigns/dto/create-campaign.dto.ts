import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsMongoId,
  ArrayNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
          .filter((tag) => tag && typeof tag === 'string' && tag.trim())
          .map((tag) => tag.trim())
      : [],
  )
  targetTags: string[];

  @IsString()
  @IsMongoId()
  templateId: string;
}
