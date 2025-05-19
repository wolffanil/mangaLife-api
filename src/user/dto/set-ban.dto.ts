import { IsObjectId } from 'class-validator-mongo-object-id';
import { Types } from 'mongoose';

export class SetBanDto {
  @IsObjectId({ message: 'Id жалобы должен быть валидный' })
  reasonId: Types.ObjectId;
}
