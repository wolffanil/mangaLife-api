import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ChapterUpdateDto {
  @IsNumber({}, { message: 'Номер главы должен быть цифрой' })
  @Min(1, { message: 'Номер главый должен начинаться минимум с 1' })
  chapter: number;

  @IsNumber({}, { message: 'Номер тома должен быть цифрой' })
  @Min(1, { message: 'Номер тома должен начинаться минимум с 1' })
  tom: number;

  @IsString({ message: 'Название главы должно быть' })
  @IsNotEmpty({ message: 'Название главй не должно быть пустым' })
  name: string;
}
