import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Genre } from './schemas/genre.model';
import { Model, Types } from 'mongoose';
import { GenreDto } from './dto/genre.dto';

@Injectable()
export class GenreService {
  constructor(
    @InjectModel(Genre.name) private readonly genreModel: Model<Genre>,
  ) {}

  async create(dto: GenreDto) {
    const genre = await this.genreModel.create({
      title: dto.title,
    });

    return genre;
  }

  async existGenre(genreId: Types.ObjectId) {
    const genre = await this.genreModel.findById(genreId);

    if (!genre) throw new NotFoundException('Жанр не найден');

    return genre;
  }

  async update(genreId: Types.ObjectId, dto: GenreDto) {
    const genre = await this.existGenre(genreId);

    genre.title = dto.title;

    await genre.save({ validateBeforeSave: true });

    return genre;
  }

  async getAll() {
    const genres = await this.genreModel.find();
    return genres;
  }

  async getById(genreId: Types.ObjectId) {
    const genre = await this.genreModel.findById(genreId);

    if (!genre) throw new NotFoundException('Жанр не найден');

    return genre;
  }

  async delete(genreId: Types.ObjectId) {
    await this.genreModel.findByIdAndDelete(genreId);

    return true;
  }
}
