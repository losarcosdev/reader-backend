import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/users/entities';
import { Auth, GetUser } from '../common/decorators';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Auth()
  @Post('add/:postId')
  addCommentToPost(
    @GetUser() user: User,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.addCommentToPost(
      createCommentDto,
      postId,
      user,
    );
  }

  @Auth()
  @Post('reply/:commentId')
  addReplyToComment(
    @GetUser() user: User,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.addReplyToComment(
      createCommentDto,
      commentId,
      user,
    );
  }

  @Get('post-comments/:postId')
  getPostComments(@Param('postId', ParseUUIDPipe) postId: string) {
    return this.commentsService.getPostComments(postId);
  }

  @Auth()
  @Patch('update-comment/:commentId')
  updateComment(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @GetUser() user: User,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(
      commentId,
      user,
      updateCommentDto,
    );
  }

  @Auth()
  @Post('delete-comment/:commentId')
  deleteComment(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @GetUser() user: User,
    @Body() deleteCommentDto: DeleteCommentDto,
  ) {
    return this.commentsService.deleteComment(
      commentId,
      user,
      deleteCommentDto,
    );
  }
}
