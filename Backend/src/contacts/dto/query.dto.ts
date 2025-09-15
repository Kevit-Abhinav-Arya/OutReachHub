import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetContactsQueryDto {
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
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return [];
    return value
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag);
  })
  tags?: string;
}
