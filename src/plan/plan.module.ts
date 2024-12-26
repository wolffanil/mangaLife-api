import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanSchema } from './schemas/plan.model';
import { MangaSchema } from 'src/manga/schemas/manga.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Plan', schema: PlanSchema },
      { name: 'Manga', schema: MangaSchema },
    ]),
  ],
  controllers: [PlanController],
  providers: [PlanService],
  exports: [PlanService],
})
export class PlanModule {}
