import { Module } from '@nestjs/common';
import { MangaService } from './manga.service';
import { MangaController } from './manga.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MangaSchema } from './schemas/manga.model';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { getElasticSearchConfig } from 'src/config/elasticsearch.config';
import { ConfigService } from '@nestjs/config';
import { AuthorSchema } from 'src/author/schemas/author.model';
import { CacheModule } from '@nestjs/cache-manager';
import { getRedisConfig } from 'src/config/redis.config';
import { ReviewModule } from 'src/review/review.module';
import { UserModule } from 'src/user/user.module';
import { ChapterModule } from 'src/chapter/chapter.module';
import { PageModule } from 'src/page/page.module';
import { PlanModule } from 'src/plan/plan.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: getRedisConfig,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'Manga', schema: MangaSchema },
      { name: 'Author', schema: AuthorSchema },
    ]),
    ElasticsearchModule.registerAsync({
      inject: [ConfigService],
      useFactory: getElasticSearchConfig,
    }),
    ScheduleModule.forRoot(),
    ReviewModule,
    UserModule,
    ChapterModule,
    PageModule,
    PlanModule,
  ],
  controllers: [MangaController],
  providers: [MangaService],
  exports: [MangaService],
})
export class MangaModule {}
