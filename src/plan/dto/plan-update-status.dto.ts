import { IsEnum } from 'class-validator';
import { EnumPlanStatus } from '../schemas/plan.model';

export class PlanUpdateStatusDto {
  @IsEnum(EnumPlanStatus, {
    message:
      'Статус плана должен быть одним из: ' +
      Object.values(EnumPlanStatus).join(', '),
  })
  status: EnumPlanStatus;
}
