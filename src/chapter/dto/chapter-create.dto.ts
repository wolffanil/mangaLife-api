import { IsArray, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { IsObjectId } from 'class-validator-mongo-object-id';
import { Types } from 'mongoose';

export class ChapterCreateDto {
  @IsNumber({}, { message: 'Номер главы должен быть цифрой' })
  @Min(1, { message: 'Номер главый должен начинаться минимум с 1' })
  chapter: number;

  @IsNumber({}, { message: 'Номер тома должен быть цифрой' })
  @Min(1, { message: 'Номер тома должен начинаться минимум с 1' })
  tom: number;

  @IsString({ message: 'Название главы должно быть' })
  @IsNotEmpty({ message: 'Название главй не должно быть пустым' })
  name: string;

  @IsObjectId({ message: 'Id манги должно быть валидной' })
  manga: Types.ObjectId;

  @IsArray({ message: 'Массив изображений должен быть' })
  @IsString({
    each: true,
    message: 'Каждый элемент в массиве должен быть корректным',
  })
  @IsNotEmpty({ each: true, message: 'Элемент не должен быть пустым' })
  pagesUrl: string[];
}
