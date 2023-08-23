import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { User } from 'src/users/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from './entities';
import { Repository } from 'typeorm';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
  ) {}

  async createChapter({ ...chapterData }: CreateChapterDto, user: User) {
    const foundChapter = await this.chapterRepository.findOneBy({
      name: chapterData.name,
    });

    if (foundChapter) {
      throw new ConflictException(`${chapterData.name} already exists`);
    }

    const newChapter = this.chapterRepository.create({
      ...chapterData,
      creator: user,
      subscribers: [user],
    });

    await this.chapterRepository.save(newChapter);

    return newChapter.slug;
  }

  async getAllChapters() {
    const chapters = await this.chapterRepository
      .createQueryBuilder('chapters')
      .leftJoin('chapters.creator', 'creator')
      .addSelect([
        'creator.fullName',
        'creator.username',
        'creator.profileImage',
        'creator.id',
      ])
      .getMany();

    return chapters;
  }

  async getOneChapter(slug: string) {
    const chapter = await this.chapterRepository
      .createQueryBuilder('chapters')
      .leftJoin('chapters.creator', 'creator')
      .addSelect([
        'creator.fullName',
        'creator.username',
        'creator.profileImage',
        'creator.id',
      ])
      .where({ slug })
      .getOne();

    if (!chapter) {
      throw new NotFoundException(`Chapter: ${slug} not found`);
    }

    return { ...chapter };
  }

  async getAllChaptersByCreator(username: string) {
    const chapters = await this.chapterRepository
      .createQueryBuilder('chapters')
      .leftJoin('chapters.creator', 'creator')
      .addSelect([
        'creator.fullName',
        'creator.username',
        'creator.profileImage',
        'creator.id',
      ])
      .where({ creator: { username } })
      .getMany();

    return chapters;
  }

  async checkIfUserIsSubscribed(user: User, chapterId: string) {
    const isUserSubscribed = await this.chapterRepository
      .createQueryBuilder('chapters')
      .leftJoin('chapters.subscribers', 'subscribers')
      .where('chapters.id = :id AND subscribers.id = :userId', {
        id: chapterId,
        userId: user.id,
      })
      .getCount();

    return isUserSubscribed > 0 ? true : false;
  }
}
