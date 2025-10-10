import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class BaseEntityDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;
}

export class BaseUpdateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name?: string;
}

export class TaggedEntityDto extends BaseEntityDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] = [];
}

export class TaggedUpdateDto extends BaseUpdateDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
