import { IsNotEmpty, IsString } from 'class-validator';

export class PageUpdateImageDto {
  @IsString({ message: 'Картинка страницы должна быть' })
  @IsNotEmpty({ message: 'Картинка страницы не должна быть пустой' })
  image: string;
}
