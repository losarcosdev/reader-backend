import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  @IsOptional()
  postId: string;

  @Length(1, 2500, { message: 'Comment must be between 1 and 2500 characters' })
  @IsString()
  content: string;
}
