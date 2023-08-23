import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { SignInDto } from './';

export class SignUpDto extends SignInDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50, { message: 'Maximum 50 characters' })
  @MinLength(3, {
    message: 'At least 3 characters',
  })
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(12, { message: 'username must have a maximum of 12 characters' })
  @MinLength(3, { message: 'username must have at least 3 characters' })
  username: string;

  @IsString()
  @IsOptional()
  githubRepository: string;

  @IsString()
  @IsOptional()
  linkedln: string;

  @IsString()
  @IsOptional()
  biography: string;

  @IsString()
  @IsOptional()
  work: string;

  @IsString()
  @IsOptional()
  education: string;

  @IsString()
  @IsOptional()
  location: string;

  @IsString()
  @IsOptional()
  codingLanguages: string;

  @IsString()
  @IsOptional()
  personalWebsite: string;

  @IsString()
  @IsOptional()
  currentlyLearning: string;
}
