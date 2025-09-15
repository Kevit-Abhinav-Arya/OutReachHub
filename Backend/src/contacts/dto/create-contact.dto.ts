import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsArray,
  IsOptional,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateContactDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[6789]\d{9}$/, {
    message: 'Phone number must be a valid mobile number',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  company: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
          .filter((tag: string) => tag?.trim())
          .map((tag: string) => tag.trim())
      : [],
  )
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
