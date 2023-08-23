import { Module } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './entities/chapter.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ChaptersController],
  providers: [ChaptersService],
  imports: [TypeOrmModule.forFeature([Chapter]), AuthModule],
})
export class ChaptersModule {}
