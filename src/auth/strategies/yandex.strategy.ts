import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Profile, Strategy } from 'passport-yandex';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('YANDEX_CLIENT_ID'),
      clientSecret: configService.get('YANDEX_CLIENT_SECRET'),
      callbackURL:
        configService.get('SERVER_URL') + '/api/auth/yandex/callback',
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: any,
  ): Promise<any> {
    const { username, emails, photos } = profile;

    const user = {
      email: emails[0].value,
      name: username,
      picture: photos[0].value,
    };

    done(null, user);
  }
}
