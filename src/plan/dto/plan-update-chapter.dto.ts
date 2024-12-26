import { IsNumber, IsOptional, Min } from 'class-validator';

export class PlanUpdateChapterDto {
  @IsOptional()
  @IsNumber({}, { message: 'Номер главы должен быть цифрой' })
  @Min(1, { message: 'Номер главый должен начинаться минимум с 1' })
  chapter: number;
}
