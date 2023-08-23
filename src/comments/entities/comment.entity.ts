import { Post } from 'src/posts/entities';
import { User } from 'src/users/entities';
import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Entity,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { CommentVote } from './commentVote.entity';

@Entity({ name: 'comments' })
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  author: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;

  // Relations

  @OneToMany(() => CommentVote, (commentVote) => commentVote.comment)
  votes: CommentVote[];

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
  })
  replyTo: Comment;

  @OneToMany(() => Comment, (comment) => comment.replyTo)
  replies: Comment[];

  @BeforeInsert()
  setDates() {
    const actualDate = new Date();
    const localDate = new Date(
      actualDate.getTime() - actualDate.getTimezoneOffset() * 60000,
    );
    localDate.setHours(localDate.getHours() + 3);

    this.createdAt = localDate;
    this.updatedAt = localDate;
  }

  @BeforeUpdate()
  setDatesOnUpdate() {
    this.setDates();
  }
}
