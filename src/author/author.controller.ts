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
import { AuthorService } from './author.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthorDto } from './dto/author.dto';
import { IdValidationPipe } from 'src/pipes/id.validation.pipe';
import { Types } from 'mongoose';

@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get()
  async getAll() {
    const authors = await this.authorService.getAll();
    return { authors };
  }

  @Get(':id')
  async getById(@Param('id', IdValidationPipe) authorId: Types.ObjectId) {
    const author = await this.authorService.getById(authorId);

    return { author };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Auth('publish')
  async create(@Body() dto: AuthorDto) {
    const author = await this.authorService.create(dto);

    return { author };
  }

  @Patch(':id')
  @Auth('publish')
  async update(
    @Param('id', IdValidationPipe) authorId: Types.ObjectId,
    @Body() dto: AuthorDto,
  ) {
    const author = await this.authorService.update(authorId, dto);

    return { author };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth('publish')
  async delete(@Param('id', IdValidationPipe) authorId: Types.ObjectId) {
    return await this.authorService.delete(authorId);
  }
}
