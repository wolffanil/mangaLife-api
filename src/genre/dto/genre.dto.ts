import { IsNotEmpty, IsString } from 'class-validator';

export class GenreDto {
  @IsString({ message: 'Название жанра должно быть' })
  @IsNotEmpty({ message: 'жанр не должен быть пустым' })
  title: string;
}
