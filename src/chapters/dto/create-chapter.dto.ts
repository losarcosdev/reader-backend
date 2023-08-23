import { IsOptional, IsString, Length } from 'class-validator';

export class CreateChapterDto {
  @Length(3, 40, { message: 'Name must have between 3 and 40 characters' })
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  coverImage: string;

  @IsString()
  @IsOptional()
  about: string;
}
