import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { IsObjectId } from 'class-validator-mongo-object-id';
import { Types } from 'mongoose';
import { EnumMangaStatus, EnumMangaType } from '../schemas/manga.model';

export class MangaDto {
  @IsString({ message: 'Название должно быть' })
  @IsNotEmpty({ message: 'Название не должно быть пустым' })
  title: string;

  @IsString({ message: 'Название на русском должно быть' })
  @IsNotEmpty({ message: 'Название на русском не должно быть пустым' })
  titleRu: string;

  @IsString({ message: 'Описание должно быть' })
  @IsNotEmpty({ message: 'Описание не должно быть пустым' })
  description: string;

  @IsArray({ message: 'джанры должен быть массивом' })
  @IsObjectId({ each: true, message: 'Все элементы должны быть Id жанра' })
  genres: Types.ObjectId[];

  @IsObjectId({ message: 'Id автора не валидный' })
  author: Types.ObjectId;

  @IsNumber({}, { message: 'Возрастное ограничение должно быть' })
  @IsNotEmpty({ message: 'Возрастное ограничение не должен быть пустой' })
  ageLimit: number;

  @IsNumber({}, { message: 'Год релиза должен быть' })
  @IsNotEmpty({ message: 'Год релиза не должен быть пустой' })
  year: number;

  @IsString({ message: 'Постер должен быть' })
  @IsNotEmpty({ message: 'Постер не должен быть пустым' })
  poster: string;

  @IsString({ message: 'Страна должна быть' })
  @IsNotEmpty({ message: 'Страна не должна быть пустым' })
  country: string;

  @IsEnum(EnumMangaStatus, {
    message:
      'Статус манги должен быть одним из: ' +
      Object.values(EnumMangaStatus).join(', '),
  })
  status: EnumMangaStatus;

  @IsEnum(EnumMangaType, {
    message:
      'Тип манги должен быть одним из: ' +
      Object.values(EnumMangaType).join(', '),
  })
  type: EnumMangaType;
}
