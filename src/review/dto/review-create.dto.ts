import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { IsObjectId } from 'class-validator-mongo-object-id';
import { Types } from 'mongoose';

export class ReviewCreateDto {
  @IsObjectId({ message: 'Id манги должна быть валидной' })
  manga: Types.ObjectId;

  @IsString({ message: 'Коментарий должен быть' })
  @IsNotEmpty({ message: 'Коментарий не должен быть пустым' })
  text: string;

  @IsNumber({}, { message: 'Оценка должна быть' })
  @Min(1, { message: 'Оценка должна быть минимум от 1' })
  @Max(5, { message: 'Оценка должна быть максимум до 5' })
  rating: number;
}
