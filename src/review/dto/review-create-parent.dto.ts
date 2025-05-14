import { IsNotEmpty, IsString } from 'class-validator';
import { IsObjectId } from 'class-validator-mongo-object-id';
import { Types } from 'mongoose';

export class ReviewParentCreateDto {
  @IsObjectId({ message: 'Id манги должна быть валидной' })
  manga: Types.ObjectId;

  @IsString({ message: 'Коментарий должен быть' })
  @IsNotEmpty({ message: 'Коментарий не должен быть пустым' })
  text: string;
}
