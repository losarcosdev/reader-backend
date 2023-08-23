/* eslint-disable prettier/prettier */

export interface RedisCachedPost {
  id: string;
  title: string;
  authorUsername: string;
  content: string;
  createdAt: Date;
}
