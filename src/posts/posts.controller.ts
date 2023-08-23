import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Auth, GetUser } from 'src/common/decorators';
import { User } from 'src/users/entities';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get(':postId')
  getPost(@Param('postId', ParseUUIDPipe) postId: string) {
    return this.postsService.getPost(postId);
  }

  @Get('get/all')
  getAllPosts(@Query('page') page: number) {
    return this.postsService.getAllPosts(page);
  }

  @Get('get-chapter-posts/:chapterId')
  getAllPostsOfAChapter(
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Query('page') page: number,
  ) {
    return this.postsService.getAllPostsOfAChapter(chapterId, page);
  }

  @Get('user-posts/:username')
  getUserPosts(@Param('username') username: string) {
    return this.postsService.getUserPosts(username);
  }

  @Auth()
  @Post()
  createPost(@GetUser() user: User, @Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(user, createPostDto);
  }

  @Auth()
  @Delete(':postId')
  deletePost(@GetUser() user: User, @Param('postId') postId: string) {
    return this.postsService.deletePost(user, postId);
  }

  @Auth()
  @Post(':chapterId')
  createPostInChapter(
    @GetUser() user: User,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.createPostInChapter(
      chapterId,
      user,
      createPostDto,
    );
  }

  @Auth()
  @Post('up-vote/:postId')
  upVotePost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @GetUser() user: User,
  ) {
    return this.postsService.upVotePost(user, postId);
  }
}
