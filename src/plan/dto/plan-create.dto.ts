import { IsEnum, IsNumber, Min } from 'class-validator';
import { IsObjectId } from 'class-validator-mongo-object-id';
import { Types } from 'mongoose';
import { EnumPlanStatus } from '../schemas/plan.model';

export class PlanCreateDto {
  @IsObjectId({ message: 'Id манги должно быть валидной' })
  manga: Types.ObjectId;

  // @IsNumber({}, { message: 'Номер главы должен быть цифрой' })
  // @Min(1, { message: 'Номер главый должен начинаться минимум с 1' })
  // chapter: number;

  // @IsNumber({}, { message: 'Номер страницы должен быть цифрой' })
  // @Min(0, { message: 'Номер страницы должен начинаться минимум с 1' })
  // page: number;

  @IsEnum(EnumPlanStatus, {
    message:
      'Статус плана должен быть одним из: ' +
      Object.values(EnumPlanStatus).join(', '),
  })
  status: EnumPlanStatus;
}
