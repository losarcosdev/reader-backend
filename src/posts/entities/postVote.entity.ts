/* eslint-disable prettier/prettier */
import { User } from 'src/users/entities';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

export enum VoteType {
  UP = 'UP',
}

@Entity({ name: 'postVote' })
export class PostVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.postVotes, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Post, (post) => post.votes, {
    onDelete: 'CASCADE',
  })
  post: Post;

  @Column()
  type: VoteType;
}
