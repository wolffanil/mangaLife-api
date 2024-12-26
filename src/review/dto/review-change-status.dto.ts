import { IsEnum } from 'class-validator';
import { EnumReviewStatus } from '../schemas/review.model';

export class ReviewChangeStatusDto {
  @IsEnum(EnumReviewStatus, {
    message:
      'Статус комментарий должен быть из: ' +
      Object.values(EnumReviewStatus).join(', '),
  })
  status: EnumReviewStatus;
}
