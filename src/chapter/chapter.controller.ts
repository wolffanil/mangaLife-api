import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ChapterCreateDto } from './dto/chapter-create.dto';
import { IdValidationPipe } from 'src/pipes/id.validation.pipe';
import { ChapterUpdateDto } from './dto/chapter-update.dto';
import { Types } from 'mongoose';
import { User } from 'src/user/decorators/user.decorator';

@Controller('chapters')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Get('get-by-manga/:id')
  @Auth()
  async getByMangaId(@Param('id', IdValidationPipe) mangaId: Types.ObjectId) {
    const chapters = await this.chapterService.getByMangaId(mangaId);

    return { chapters };
  }

  @Get('get-by-user/:id')
  @Auth()
  async getForUser(
    @User('_id') userId: Types.ObjectId,
    @Param('id', IdValidationPipe) mangaId: Types.ObjectId,
  ) {
    const chapterInfo = await this.chapterService.getChapterByUser(
      mangaId,
      userId,
    );

    return { chapterInfo };
  }

  @Get(':id')
  @Auth()
  async getById(@Param('id') chapterId: Types.ObjectId) {
    const chapter = await this.chapterService.getById(chapterId);

    return { chapter };
  }

  @Post()
  @Auth('publish')
  async create(@Body() dto: ChapterCreateDto) {
    const page = await this.chapterService.create(dto);

    return { page };
  }

  @Patch(':id')
  @Auth('publish')
  async update(
    @Param('id', IdValidationPipe) chapterId: Types.ObjectId,
    @Body() dto: ChapterUpdateDto,
  ) {
    const chapter = await this.chapterService.update(chapterId, dto);

    return { chapter };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth('publish')
  async delete(@Param('id', IdValidationPipe) chapterId: Types.ObjectId) {
    return await this.chapterService.delete(chapterId);
  }
}
