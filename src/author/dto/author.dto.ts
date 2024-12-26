import { IsNotEmpty, IsString } from 'class-validator';

export class AuthorDto {
  @IsString({ message: 'Имя автора должно быть' })
  @IsNotEmpty({ message: 'Имя не должен быть пустым' })
  name: string;
}
