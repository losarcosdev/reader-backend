/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteCommentDto {
  @IsNotEmpty()
  @IsUUID()
  postId: string;
}
