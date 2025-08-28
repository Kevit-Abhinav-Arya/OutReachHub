import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;
}

export class SearchQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string = '';
}

export class SearchWithTagsQueryDto extends SearchQueryDto {
  @IsOptional()
  @IsString()
  tags?: string = '';
}

export class SearchWithStatusQueryDto extends SearchQueryDto {
  @IsOptional()
  @IsString()
  status?: string = '';
}

export class SearchWithTypeQueryDto extends SearchQueryDto {
  @IsOptional()
  @IsString()
  type?: string = '';
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
}

export interface ListResponse<T> extends ApiResponse<PaginationResponse<T>> {}
export interface SingleResponse<T> extends ApiResponse<T> {}
export interface DeleteResponse extends ApiResponse<null> {
  message: string;
}
