import { IsNotEmpty, IsString } from 'class-validator';
import { IsObjectId } from 'class-validator-mongo-object-id';
import { Types } from 'mongoose';

export class PageCreateSingleDto {
  @IsString({ message: 'Картинка страницы должна быть' })
  @IsNotEmpty({ message: 'Картинка страницы не должна быть пустой' })
  image: string;

  @IsObjectId({ message: 'Id манги должно быть валидной' })
  manga: Types.ObjectId;

  @IsObjectId({ message: 'Id главы должно быть валидной' })
  chapter: Types.ObjectId;
}
