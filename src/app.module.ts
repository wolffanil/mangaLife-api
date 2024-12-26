import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getEnvConfig } from './config/env.config';
import { getMongoDbConfig } from './config/mongo.config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ReasonModule } from './reason/reason.module';
import { GenreModule } from './genre/genre.module';
import { AuthorModule } from './author/author.module';
import { PremiumModule } from './premium/premium.module';
import { FileModule } from './file/file.module';
import { MangaModule } from './manga/manga.module';
import { ReviewModule } from './review/review.module';
import { ChapterModule } from './chapter/chapter.module';
import { PageModule } from './page/page.module';
import { PlanModule } from './plan/plan.module';

@Module({
  imports: [
    ConfigModule.forRoot(getEnvConfig()),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getMongoDbConfig,
    }),
    AuthModule,
    UserModule,
    ReasonModule,
    GenreModule,
    AuthorModule,
    PremiumModule,
    FileModule,
    MangaModule,
    ReviewModule,
    ChapterModule,
    PageModule,
    PlanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
