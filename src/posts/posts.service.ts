import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from 'src/users/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from 'src/chapters/entities';
import { Repository } from 'typeorm';
import { Post, PostVote, VoteType } from './entities';
import { CACHE_AFTER_UPVOTES } from './constants';
import type { RedisCachedPost } from './interfaces';
import { Redis } from '@upstash/redis';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostVote)
    private readonly postVoteRepository: Repository<PostVote>,
  ) {}

  async getPost(postId: string) {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.createdAt',
        'post.updatedAt',
        'post.votesAmount',
        'post.commentsAmount',
      ])
      .leftJoinAndSelect('post.votes', 'postVotes')
      .leftJoin('postVotes.user', 'postVotesUser')
      .addSelect([
        'postVotesUser.id',
        'postVotesUser.fullName',
        'postVotesUser.profileImage',
        'postVotesUser.email',
        'postVotesUser.username',
      ])
      .leftJoin('post.author', 'postAuthor')
      .addSelect([
        'postAuthor.id',
        'postAuthor.fullName',
        'postAuthor.profileImage',
        'postAuthor.email',
        'postAuthor.username',
      ])
      .leftJoinAndSelect('post.comments', 'postComments')
      .where({ id: postId })
      .getOne();

    if (!post) {
      throw new NotFoundException(`Post: ${postId} not found`);
    }

    return post;
  }

  async createPostInChapter(
    chapterId: string,
    user: User,
    { content, title }: CreatePostDto,
  ) {
    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID: ${chapterId} not found`);
    }

    const isUserSubscribed = await this.chapterRepository
      .createQueryBuilder('chapters')
      .leftJoin('chapters.subscribers', 'subscribers')
      .where('chapters.id = :id AND subscribers.id = :userId', {
        id: chapterId,
        userId: user.id,
      })
      .getCount();

    if (!isUserSubscribed) {
      throw new UnauthorizedException(
        `Join to ${chapter.name} before adding a post`,
      );
    }

    const newPost = this.postRepository.create({
      title,
      content,
      author: user,
      chapter,
    });

    await this.postRepository.save(newPost);

    return {
      message: 'Post created successfully!',
    };
  }

  async createPost(user: User, { content, title }: CreatePostDto) {
    const newPost = this.postRepository.create({
      content,
      title,
      author: user,
    });

    await this.postRepository.save(newPost);

    return {
      message: 'Post created successfully!',
    };
  }

  async getAllPostsOfAChapter(chapterId: string, page = 1) {
    const chapter = await this.chapterRepository.findOneBy({ id: chapterId });

    if (!chapter) {
      throw new NotFoundException(`Chapter: ${chapterId} not found`);
    }

    if (page < 1) page = 1;

    const postsPerPage = 10;
    const skipAmount = (page - 1) * postsPerPage;

    const posts = await this.postRepository
      .createQueryBuilder('posts')
      .select([
        'posts.id',
        'posts.title',
        'posts.previewContent',
        'posts.createdAt',
        'posts.updatedAt',
        'posts.votesAmount',
        'posts.commentsAmount',
      ])
      .leftJoinAndSelect('posts.votes', 'votes')
      .leftJoin('votes.user', 'votesUser')
      .addSelect([
        'votesUser.id',
        'votesUser.fullName',
        'votesUser.profileImage',
        'votesUser.email',
        'votesUser.username',
      ])
      .leftJoin('posts.author', 'author')
      .addSelect([
        'author.id',
        'author.fullName',
        'author.profileImage',
        'author.username',
      ])
      .leftJoin('posts.chapter', 'chapter')
      .addSelect(['chapter.id', 'chapter.name', 'chapter.slug'])
      .where('chapter.id = :chapterId', { chapterId })
      .orderBy('posts.createdAt', 'DESC')
      .take(postsPerPage)
      .skip(skipAmount)
      .getMany();

    return posts;
  }

  async getAllPosts(page = 1) {
    if (page < 1) page = 1;

    const postsPerPage = 10;
    const skipAmount = (page - 1) * postsPerPage;

    const posts = await this.postRepository
      .createQueryBuilder('posts')
      .select([
        'posts.id',
        'posts.title',
        'posts.previewContent',
        'posts.createdAt',
        'posts.updatedAt',
        'posts.votesAmount',
        'posts.commentsAmount',
      ])
      .leftJoinAndSelect('posts.votes', 'votes')
      .leftJoin('votes.user', 'votesUser')
      .addSelect([
        'votesUser.id',
        'votesUser.fullName',
        'votesUser.profileImage',
        'votesUser.email',
        'votesUser.username',
      ])
      .leftJoin('posts.author', 'author')
      .addSelect([
        'author.id',
        'author.fullName',
        'author.profileImage',
        'author.username',
      ])
      .leftJoin('posts.chapter', 'chapter')
      .addSelect(['chapter.id', 'chapter.name', 'chapter.slug'])
      .orderBy('posts.createdAt', 'DESC')
      .take(postsPerPage)
      .skip(skipAmount)
      .getMany();

    return posts;
  }

  async getUserPosts(username: string) {
    const posts = await this.postRepository
      .createQueryBuilder('posts')
      .select([
        'posts.id',
        'posts.title',
        'posts.previewContent',
        'posts.createdAt',
        'posts.updatedAt',
        'posts.votesAmount',
        'posts.commentsAmount',
      ])
      .leftJoinAndSelect('posts.votes', 'votes')
      .leftJoin('votes.user', 'votesUser')
      .addSelect([
        'votesUser.id',
        'votesUser.fullName',
        'votesUser.profileImage',
        'votesUser.email',
        'votesUser.username',
      ])
      .leftJoin('posts.author', 'author')
      .addSelect([
        'author.id',
        'author.fullName',
        'author.profileImage',
        'author.username',
      ])
      .where('author.username = :username', { username })
      .getMany();

    return posts;
  }

  async deletePost(user: User, postId: string) {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoin('post.author', 'author')
      .addSelect(['author.id'])
      .where({ id: postId })
      .getOne();

    if (!post) {
      throw new NotFoundException(`Post with ID: ${postId} not found`);
    }

    if (post.author.id !== user.id) {
      throw new UnauthorizedException(
        `You are not authorized to delete this post`,
      );
    }

    await this.postRepository.delete({ id: postId });

    return { message: 'Post deleted successfully!' };
  }

  async upVotePost(user: User, postId: string) {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoin('post.author', 'author')
      .addSelect(['author.id ', 'author.username'])
      .leftJoinAndSelect('post.votes', 'votes')
      .leftJoinAndSelect('votes.user', 'userVotes')
      .where({ id: postId })
      .getOne();

    if (!post) {
      throw new NotFoundException(`Post with ID: ${postId} not found`);
    }

    const alreadyVoted = post.votes.find((vote) => vote.user.id === user.id);

    if (alreadyVoted !== undefined) {
      await this.postVoteRepository.manager.transaction(async () => {
        const postVote = this.postVoteRepository.createQueryBuilder('postVote');
        postVote.delete().where({ id: alreadyVoted.id }).execute();
        this.postRepository.decrement({ id: post.id }, 'votesAmount', 1);
      });

      return { message: 'You already vote this post' };
    }

    const newUpVote = this.postVoteRepository.create({
      user,
      post,
      type: VoteType.UP,
    });

    await this.postVoteRepository.manager.transaction(async () => {
      this.postRepository.increment({ id: post.id }, 'votesAmount', 1);
      this.postVoteRepository.save(newUpVote);
    });

    if (post.votesAmount >= CACHE_AFTER_UPVOTES) {
      await this.cachePost(post.author, post);
    }

    return { message: 'Vote added successfully' };
  }

  private async cachePost(user: User, post: Post) {
    const redis = new Redis({
      url: process.env.REDIS_URL || '',
      token: process.env.REDIS_SECRET || '',
    });

    const cachePostPayload: RedisCachedPost = {
      authorUsername: user.username,
      content: JSON.stringify(post.content),
      id: post.id,
      title: post.title,
      createdAt: post.createdAt,
    };

    await redis.hset(`post:${post.id}`, { ...cachePostPayload });

    return { message: 'Vote added and the post was cached!' };
  }
}
