import { Post } from 'src/posts/entities';
import { User } from 'src/users/entities';
import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Entity,
  OneToMany,
  ManyToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { generateSlug } from 'src/utils';

@Entity({ name: 'chapters' })
export class Chapter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  about: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ default: () => 'now()' })
  createdAt: Date;

  @Column({ default: () => 'now()', onUpdate: 'now()' })
  updatedAt: Date;

  @Column({ default: 1 })
  subscribersCount: number;

  @BeforeInsert()
  getSlug() {
    this.slug = generateSlug(this.name);
  }

  @BeforeUpdate()
  getSlugOnUpdate() {
    this.getSlug();
  }

  // Relations
  @ManyToMany(() => User, (user) => user.subscriptions)
  subscribers: User[];

  @OneToMany(() => Post, (post) => post.chapter)
  posts: Post[];

  @ManyToOne(() => User, (user) => user.chapters, {
    onDelete: 'SET NULL',
  })
  creator: User;
}
