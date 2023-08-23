import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/users/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/posts/entities';
import { Repository } from 'typeorm';
import { Comment } from './entities';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  /**
   * Creates a new comment on a post and saves it to the database.
   * @param createCommentDto The DTO containing the content of the comment to be created.
   * @param postId The ID of the post on which the comment will be created.
   * @param user The user creating the comment.
   * @returns Success message
   * @throws NotFoundException if the post specified by `postId` cannot be found.
   */
  async addCommentToPost(
    { content }: CreateCommentDto,
    postId: string,
    user: User,
  ) {
    const post = await this.postRepository.findOneBy({ id: postId });

    if (!post) {
      throw new NotFoundException(`Post with ID: ${postId} not found`);
    }

    const newComment = this.commentRepository.create({
      content,
      author: user,
      post,
    });

    await this.commentRepository.manager.transaction(async () => {
      this.postRepository.increment({ id: post.id }, 'commentsAmount', 1);
      this.commentRepository.save(newComment);
    });

    return {
      messagge: 'Comment added successfully',
    };
  }

  /**
   * Adds a reply to a parent comment.
   * @param createCommentDto The DTO containing the reply content.
   * @param commentId The ID of the parent comment.
   * @param postId The ID of the post on wich the comment will be created.
   * @param user The user adding the reply.
   * @returns The newly created reply.
   * @throws NotFoundException if the parent comment or if the post cannot be found.
   */
  async addReplyToComment(
    { content, postId }: CreateCommentDto,
    commentId: string,
    user: User,
  ) {
    if (!postId) {
      throw new BadRequestException('Post ID is required');
    }

    const parentComment = await this.commentRepository.findOneBy({
      id: commentId,
    });

    if (!parentComment) {
      throw new NotFoundException(`Comment with ID: ${commentId} not found`);
    }

    const reply = this.commentRepository.create({
      content,
      author: user,
    });

    reply.replyTo = parentComment;

    await this.commentRepository.manager.transaction(async () => {
      this.postRepository.increment({ id: postId }, 'commentsAmount', 1);
      this.commentRepository.save(reply);
    });

    return {
      messagge: 'Reply added!',
    };
  }

  async getPostComments(postId: string) {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comments')
      .where({ id: postId })
      .orderBy('comments.createdAt', 'DESC')
      .getOne();

    if (!post) {
      throw new NotFoundException(`Post with ID: ${postId} not found`);
    }

    const comments = await this.loadCommentsWithReplies(post.comments);

    return comments || [];
  }

  private async loadCommentsWithReplies(
    comments: Comment[],
  ): Promise<Comment[]> {
    // Create an empty array to store the comments with their responses.
    const commentsWithReplies = [];

    // Iterate through each comment in the input array.
    for (const comment of comments) {
      // Fetch the comment and its associated user and response data from the database using the TypeORM library's createQueryBuilder method.
      // Use several leftJoint statements to specify the relationships between the entities.
      const commentWithReplies = await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoin('comment.author', 'commentAuthor')
        .addSelect([
          'commentAuthor.id',
          'commentAuthor.username',
          'commentAuthor.profileImage',
        ])
        .leftJoinAndSelect('comment.replies', 'replies')
        .where({ id: comment.id })
        .getOne();

      // If the fetched comment has any responses, recursively call this function passing the array of responses as input to retrieve the responses for each comment.
      if (commentWithReplies.replies.length > 0) {
        commentWithReplies.replies = await this.loadCommentsWithReplies(
          commentWithReplies.replies,
        );
      }

      // Add the fetched comment and its responses to the commentsWithReplies array.
      commentsWithReplies.push(commentWithReplies);
    }

    // Return the array of comments with their responses.
    return commentsWithReplies;
  }

  async updateComment(
    commentId: string,
    user: User,
    { content }: UpdateCommentDto,
  ) {
    const targetComment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.author', 'author')
      .addSelect(['author.id'])
      .where({ id: commentId })
      .getOne();

    if (!targetComment) {
      throw new NotFoundException(`Comment with ID: ${commentId} not found`);
    }

    if (targetComment.author.id !== user.id) {
      throw new ForbiddenException('You are not allowed to edit that comment');
    }

    targetComment.content = content;

    await this.commentRepository.save(targetComment);

    return { messagge: 'Comment edited successfully' };
  }

  async deleteComment(
    commentId: string,
    user: User,
    { postId }: DeleteCommentDto,
  ) {
    const targetComment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.author', 'author')
      .addSelect(['author.id'])
      .where({ id: commentId })
      .getOne();

    if (!targetComment) {
      throw new NotFoundException(`Comment with ID: ${commentId} not found`);
    }

    if (targetComment.author.id !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }

    const amountToDelete = await this.getCommentsCount(targetComment.id);

    await this.commentRepository.manager.transaction(async () => {
      this.postRepository.decrement(
        { id: postId },
        'commentsAmount',
        amountToDelete,
      );
      this.commentRepository.remove(targetComment);
    });

    return { message: 'Comment deleted successfully' };
  }

  async getCommentsCount(commentId: string) {
    let amount = 1;

    const targetComment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.author', 'author')
      .leftJoin('comment.replies', 'replies')
      .addSelect(['replies.id'])
      .addSelect(['author.id'])
      .where({ id: commentId })
      .getOne();

    if (!targetComment) {
      throw new NotFoundException(`Comment with ID: ${commentId} not found`);
    }

    if (targetComment.replies.length > 0) {
      for (const reply of targetComment.replies) {
        amount += await this.getCommentsCount(reply.id);
      }
    }

    return amount;
  }
}
