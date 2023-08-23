import { IsNotEmpty, IsObject, IsString, Length } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 128, { message: 'Title must be between 3 and 128 characters' })
  title: string;

  @IsNotEmpty()
  @IsObject()
  content: object;
}
