import { Module } from '@nestjs/common';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthorSchema } from './schemas/author.model';
import { MangaModule } from 'src/manga/manga.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Author', schema: AuthorSchema }]),
    MangaModule,
  ],
  controllers: [AuthorController],
  providers: [AuthorService],
})
export class AuthorModule {}
