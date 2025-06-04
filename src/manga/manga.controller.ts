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
  Query,
} from '@nestjs/common';
import { MangaService } from './manga.service';
import { MangaFilterDto } from './dto/manga-filter.dto';
import { Types } from 'mongoose';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { MangaDto } from './dto/manga.dto';
import { IdValidationPipe } from 'src/pipes/id.validation.pipe';

@Controller('mangas')
export class MangaController {
  constructor(private readonly mangaService: MangaService) {}

  @Get()
  async getAll(@Query() query: MangaFilterDto) {
    const filter: any = {
      type: query?.type ?? '',
      status: query?.status ?? '',
      genres: query?.genres ? query.genres.split(',') : [],
    };

    const mangas = await this.mangaService.getAll(filter);

    return { mangas };
  }

  @Get('search')
  async search(@Query('q') q: string) {
    return await this.mangaService.search(q);
  }

  @Get('get-similar-by-author/:authorId')
  async getSimilarByAuthor(
    @Param('authorId', IdValidationPipe) authorId: Types.ObjectId,
  ) {
    const mangas = await this.mangaService.getSimilarByAuthor(authorId);

    return { mangas };
  }

  @Get('get-new')
  async getNew() {
    const mangas = await this.mangaService.getNew();

    return { mangas };
  }

  @Get('get-popular')
  async getPopular() {
    const mangas = await this.mangaService.getPopular();
    return { mangas };
  }

  @Get('get-for-publish')
  @Auth('publish')
  async getForPublish() {
    const mangas = await this.mangaService.getForPublish();

    return { mangas };
  }

  @Get(':id')
  async getById(@Param('id', IdValidationPipe) mangaId: Types.ObjectId) {
    const manga = await this.mangaService.getById(mangaId);

    return { manga };
  }

  @Post()
  @Auth('publish')
  async create(@Body() dto: MangaDto) {
    const manga = await this.mangaService.create(dto);

    return { manga };
  }

  @Patch(':id')
  @Auth('publish')
  async update(
    @Param('id', IdValidationPipe) mangaId: Types.ObjectId,
    @Body() dto: MangaDto,
  ) {
    const manga = await this.mangaService.update(mangaId, dto);

    return { manga };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth('publish')
  async delete(@Param('id', IdValidationPipe) mangaId: Types.ObjectId) {
    return await this.mangaService.delete(mangaId);
  }
}
