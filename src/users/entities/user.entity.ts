import { Chapter } from 'src/chapters/entities/chapter.entity';
import { Comment, CommentVote } from 'src/comments/entities';
import { Post } from 'src/posts/entities';
import { PostVote } from 'src/posts/entities/postVote.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  fullName: string;

  @Column('text')
  password: string;

  @Column('text', { nullable: true })
  profileImage: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { unique: true })
  username: string;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @BeforeInsert()
  checkUserEmail() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkUserFieldsBeforeUpdate() {
    this.checkUserEmail();
  }

  // Relations
  @ManyToMany(() => Chapter, (chapter) => chapter.subscribers)
  @JoinTable({
    name: 'user_subscriptions',
    joinColumn: {
      name: 'user',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'chapters',
      referencedColumnName: 'id',
    },
  })
  subscriptions: Chapter[];

  @OneToMany(() => Chapter, (chapter) => chapter.creator)
  chapters: Chapter[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => CommentVote, (commentVote) => commentVote.user)
  commentVotes: CommentVote[];

  @OneToMany(() => PostVote, (postVote) => postVote.user)
  postVotes: PostVote[];
}
