import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from 'src/chapters/entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
  ) {}

  async findAll() {
    const users = await this.userRepository.find();

    if (!users) {
      throw new NotFoundException();
    }

    return users;
  }

  async findOne(username: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.fullName',
        'user.profileImage',
        'user.email',
        'user.username',
      ])
      .leftJoinAndSelect('user.chapters', 'userChapters')
      .leftJoinAndSelect('user.posts', 'posts')
      .leftJoinAndSelect('user.postVotes', 'postVotes')
      .where({ username })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User: ${username} not found`);
    }

    return user;
  }

  async joinChapter(user: User, chapterName: string) {
    const foundChapter = await this.chapterRepository
      .createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.creator', 'creator')
      .where({ name: chapterName })
      .getOne();

    if (!foundChapter) {
      throw new NotFoundException(`Chapter: ${chapterName} not found`);
    }

    if (foundChapter.creator.id === user.id) {
      throw new BadRequestException(
        'You created this chapter, you are already joined in',
      );
    }

    const isSubscribed =
      (await this.chapterRepository
        .createQueryBuilder('chapter')
        .leftJoin('chapter.subscribers', 'subscriber')
        .where('chapter.id = :chapterId', { chapterId: foundChapter.id })
        .andWhere('subscriber.id = :userId', { userId: user.id })
        .getCount()) > 0;

    if (isSubscribed) {
      throw new ConflictException('You are already subscribed');
    }

    await this.chapterRepository
      .createQueryBuilder()
      .relation(Chapter, 'subscribers')
      .of(foundChapter)
      .add(user);

    await this.chapterRepository
      .createQueryBuilder()
      .update(Chapter)
      .set({ subscribersCount: () => 'subscribersCount + 1' })
      .where('id = :id', { id: foundChapter.id })
      .execute();

    return { message: `You are now subscribed to ${foundChapter.name}!` };
  }

  async leaveChapter(user: User, chapterName: string) {
    const foundChapter = await this.chapterRepository
      .createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.creator', 'creator')
      .where({ name: chapterName })
      .getOne();

    if (!foundChapter) {
      throw new NotFoundException(`Chapter: ${chapterName} not found`);
    }

    if (foundChapter.creator.id === user.id) {
      throw new BadRequestException(
        'You created this chapter,you can not leave,delete it instead',
      );
    }

    const isSubscribed =
      (await this.chapterRepository
        .createQueryBuilder('chapter')
        .leftJoin('chapter.subscribers', 'subscriber')
        .where('chapter.id = :chapterId', { chapterId: foundChapter.id })
        .andWhere('subscriber.id = :userId', { userId: user.id })
        .getCount()) > 0;

    if (!isSubscribed) {
      throw new NotFoundException('You are not subscribed to this chapter!');
    }

    await this.chapterRepository
      .createQueryBuilder()
      .relation(Chapter, 'subscribers')
      .of(foundChapter)
      .remove(user);

    await this.chapterRepository
      .createQueryBuilder()
      .update(Chapter)
      .set({ subscribersCount: () => 'subscribersCount - 1' })
      .where('id = :id', { id: foundChapter.id })
      .execute();

    return {
      message: 'You are not anymore in this chapter :(',
    };
  }
}
