import { IsString } from 'class-validator';
import { IsObjectId } from 'class-validator-mongo-object-id';
import { Types } from 'mongoose';

export class ReasonDto {
  @IsObjectId({ message: 'Id пользователя невалидный' })
  userId: Types.ObjectId;

  @IsString({ message: 'жалоба должна быть' })
  text: string;
}
