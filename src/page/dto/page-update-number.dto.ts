import { IsNumber, Min } from 'class-validator';

export class PageUpdateNumberDto {
  @IsNumber({}, { message: 'Номер страницы должен быть' })
  @Min(1, { message: 'Номер должен начинаться минимум с 1' })
  number: number;
}
