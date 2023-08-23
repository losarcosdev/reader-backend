import { Chapter } from 'src/chapters/entities';
import { Comment } from 'src/comments/entities';
import { User } from 'src/users/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostVote } from './postVote.entity';
import { generatePostPreviewContent } from 'src/utils';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'jsonb' })
  content: any | null;

  @Column({ nullable: true, type: 'jsonb' })
  previewContent: any | null;

  @Column({ default: () => 'now()' })
  createdAt: Date;

  @Column({ default: () => 'now()', onUpdate: 'now()' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  author: User;

  @ManyToOne(() => Chapter, (chapter) => chapter.posts, {
    onDelete: 'CASCADE',
  })
  chapter: Chapter;

  @OneToMany(() => PostVote, (postVote) => postVote.post, {
    onDelete: 'CASCADE',
  })
  votes: PostVote[];

  @Column({ default: 0 })
  votesAmount: number;

  @OneToMany(() => Comment, (comment) => comment.post, { onDelete: 'CASCADE' })
  comments: Comment[];

  @Column({ default: 0 })
  commentsAmount: number;

  @BeforeInsert()
  getPreviewContent() {
    this.previewContent = generatePostPreviewContent(
      this.content.blocks,
      this.content.time,
    );
  }

  @BeforeUpdate()
  getPreviewContentOnUdpate() {
    this.getPreviewContent();
  }
}
