import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities';
import { AuthModule } from 'src/auth/auth.module';
import { ChaptersModule } from 'src/chapters/chapters.module';
import { Chapter } from 'src/chapters/entities';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([User, Chapter]), AuthModule],
})
export class UsersModule {}
