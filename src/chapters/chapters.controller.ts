import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { Auth, GetUser } from 'src/common/decorators';
import { User } from 'src/users/entities';

@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Auth()
  @Post('create')
  createChapter(
    @Body() createChapterDto: CreateChapterDto,
    @GetUser() user: User,
  ) {
    return this.chaptersService.createChapter(createChapterDto, user);
  }

  @Get(':slug')
  getOneChapter(@Param('slug') slug: string) {
    return this.chaptersService.getOneChapter(slug);
  }

  @Get('get/all')
  getAllChapters() {
    return this.chaptersService.getAllChapters();
  }

  @Get('get/all/by-creator/:username')
  getAllChaptersByCreator(@Param('username') username: string) {
    return this.chaptersService.getAllChaptersByCreator(username);
  }

  @Auth()
  @Get('check-user-subscription/:chapterId')
  checkIfUserIsSubscribed(
    @GetUser() user: User,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
  ) {
    return this.chaptersService.checkIfUserIsSubscribed(user, chapterId);
  }
}
