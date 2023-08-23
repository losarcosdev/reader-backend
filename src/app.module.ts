import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ChaptersModule } from './chapters/chapters.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: +process.env.DB_PORT,
      synchronize: true,
      type: 'postgres',
      username: process.env.DB_USERNAME,
    }),
    ChaptersModule,
    PostsModule,
    CommentsModule,
    PassportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
