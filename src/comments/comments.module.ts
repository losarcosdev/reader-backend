import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment, CommentVote } from './entities';
import { AuthModule } from 'src/auth/auth.module';
import { Post } from 'src/posts/entities';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [TypeOrmModule.forFeature([Comment, CommentVote, Post]), AuthModule],
})
export class CommentsModule {}
