import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Author, AuthorDocument } from './schemas/author.model';
import { Model, Types } from 'mongoose';
import { AuthorDto } from './dto/author.dto';
import { MangaService } from 'src/manga/manga.service';

@Injectable()
export class AuthorService {
  constructor(
    @InjectModel(Author.name)
    private readonly authorModel: Model<AuthorDocument>,
    private readonly mangaService: MangaService,
  ) {}

  async create(dto: AuthorDto) {
    const author = await this.authorModel.create({
      name: dto.name,
    });

    return author;
  }

  async existauthor(authorId: Types.ObjectId) {
    const author = await this.authorModel.findById(authorId);

    if (!author) throw new NotFoundException('Автор не найден');

    return author;
  }

  async update(authorId: Types.ObjectId, dto: AuthorDto) {
    const author = await this.existauthor(authorId);

    author.name = dto.name;

    await author.save({ validateBeforeSave: true });

    await this.mangaService.changeAuthorName();

    return author;
  }

  async getAll() {
    const authors = await this.authorModel.find();
    return authors;
  }

  async getById(authorId: Types.ObjectId) {
    const author = await this.authorModel.findById(authorId);

    if (!author) throw new NotFoundException('Автор не найден');

    return author;
  }

  async delete(authorId: Types.ObjectId) {
    const author = await this.authorModel
      .findById(authorId)
      .populate('existManga');

    if (author.existManga)
      throw new BadRequestException('у автора существует манга');

    await this.authorModel.findByIdAndDelete(authorId);

    return true;
  }
}
