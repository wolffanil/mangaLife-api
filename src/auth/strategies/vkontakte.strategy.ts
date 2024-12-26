import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Profile, Strategy } from 'passport-vkontakte';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class VkontakteStrategy extends PassportStrategy(Strategy, 'vkontakte') {
  constructor(private configService: ConfigService) {
    super(
      {
        clientID: configService.get('VKONTAKTE_CLIENT_ID'),
        clientSecret: configService.get('VKONTAKTE_CLIENT_SECRET'),
        callbackURL:
          configService.get('SERVER_URL_VK') + '/api/auth/vkontakte/callback',
        scope: ['profile', 'email'],
        profileFields: ['email'],
      },
      function (
        _accessToken: string,
        _refreshToken: string,
        params: any,
        profile: Profile,
        done: (error: any, user?: any) => void,
      ) {
        const { username, emails, photos } = profile;

        const user = {
          email: emails[0].value || params.email || 'none@mail.ru',
          name: username,
          picture: photos[0].value,
        };

        return done(null, user);
      },
    );
  }

  //   async validate(
  //     accessToken: string,
  //     refreshToken: string,
  //     params: any,
  //     profile: Profile,
  //     done: (error: any, user?: any) => void,
  //   ): Promise<any> {
  //     console.log(profile, 'Profile');
  //     const { displayName, emails, photos } = profile;

  //     const user = {
  //       email: emails[0].value || params.email,
  //       name: displayName,
  //       picture: photos[0].value,
  //     };

  //     done(null, user);
  //   }
}
