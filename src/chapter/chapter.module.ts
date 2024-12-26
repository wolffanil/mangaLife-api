import { Module } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ChapterSchema } from './schemas/chapter.model';
import { PageModule } from 'src/page/page.module';
import { PlanModule } from 'src/plan/plan.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Chapter', schema: ChapterSchema }]),
    PageModule,
    PlanModule,
  ],
  controllers: [ChapterController],
  providers: [ChapterService],
  exports: [ChapterService],
})
export class ChapterModule {}
