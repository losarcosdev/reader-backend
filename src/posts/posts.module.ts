import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post, PostVote } from './entities';
import { AuthModule } from 'src/auth/auth.module';
import { Chapter } from 'src/chapters/entities';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [TypeOrmModule.forFeature([Post, PostVote, Chapter]), AuthModule],
})
export class PostsModule {}
