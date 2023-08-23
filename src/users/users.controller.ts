import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities';
import { Auth, GetUser } from 'src/common/decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.usersService.findOne(username);
  }

  @Auth()
  @Post('/join-chapter/:chapterName')
  joinChapter(
    @GetUser() user: User,
    @Param('chapterName') chapterName: string,
  ) {
    return this.usersService.joinChapter(user, chapterName);
  }

  @Auth()
  @Delete('/leave-chapter/:chapterName')
  leaveChapter(
    @GetUser() user: User,
    @Param('chapterName') chapterName: string,
  ) {
    return this.usersService.leaveChapter(user, chapterName);
  }

  // @Auth()
  // @Patch(':id')
  // update(
  //   @GetUser() authUser: User,
  //   @Param('id', ParseUUIDPipe)
  //   id: string,
  //   @Body() updateUserDto: UpdateUserDto,
  // ) {
  //   return this.usersService.update(id, updateUserDto, authUser);
  // }

  // @Auth()
  // @Post('/follow/:userId')
  // follow(
  //   @GetUser() authUser: User,
  //   @Param('userId', ParseUUIDPipe)
  //   userId: string,
  // ) {
  //   return this.usersService.follow(userId, authUser);
  // }

  // @Auth()
  // @Delete('/unfollow/:userId')
  // unfollow(
  //   @GetUser() authUser: User,
  //   @Param('userId', ParseUUIDPipe)
  //   userId: string,
  // ) {
  //   return this.usersService.unfollow(userId, authUser);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
