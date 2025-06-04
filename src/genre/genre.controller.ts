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
import { GenreService } from './genre.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GenreDto } from './dto/genre.dto';
import { Types } from 'mongoose';
import { IdValidationPipe } from 'src/pipes/id.validation.pipe';

@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Get()
  async getAll() {
    const genres = await this.genreService.getAll();
    return { genres };
  }

  @Get(':id')
  async getById(@Param('id', IdValidationPipe) genreId: Types.ObjectId) {
    const genre = await this.genreService.getById(genreId);

    return { genre };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Auth('publish')
  async create(@Body() dto: GenreDto) {
    const genre = await this.genreService.create(dto);

    return { genre };
  }

  @Patch(':id')
  @Auth('publish')
  async update(
    @Param('id', IdValidationPipe) genreId: Types.ObjectId,
    @Body() dto: GenreDto,
  ) {
    const genre = await this.genreService.update(genreId, dto);

    return { genre };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth('publish')
  async delete(@Param('id', IdValidationPipe) genreId: Types.ObjectId) {
    return await this.genreService.delete(genreId);
  }
}
