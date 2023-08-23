/* eslint-disable prettier/prettier */
import { User } from 'src/users/entities';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './';

export enum VoteType {
  UP = 'UP',
  DOWN = 'DOWN',
}

@Entity({ name: 'commentVote' })
export class CommentVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.commentVotes, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.votes, {
    onDelete: 'CASCADE',
  })
  comment: Comment;

  @Column()
  type: VoteType;
}
