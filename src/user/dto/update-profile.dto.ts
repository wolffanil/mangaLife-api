import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserGender } from '../schemas/user.model';

export class UpdateProfileDto {
  @IsString({ message: 'Ник должен быть' })
  @IsNotEmpty({ message: 'Ник не должен быть пустым' })
  nickname: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Биография не должна быть пустой' })
  bio: string;

  @IsOptional()
  @IsEnum(UserGender, { message: 'пол должен быть мужской или женский' })
  @IsNotEmpty({ message: 'пол не должен быть пустым' })
  gender: UserGender;

  @IsString({ message: 'Изображения должно быть' })
  @IsNotEmpty({ message: 'Изображения не может быть пустой' })
  picture: string;
}
