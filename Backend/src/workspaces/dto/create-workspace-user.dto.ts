import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateWorkspaceUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{5,15}$/,
    {
      message:
        'Password must be 5-15 characters long, include uppercase, lowercase, number, and special character.',
    },
  )
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @IsEnum(['Editor', 'Viewer'], {
    message: 'Role must be either Editor or Viewer',
  })
  role: 'Editor' | 'Viewer';
}
