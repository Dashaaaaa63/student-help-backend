import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      // Конфигурация стратегии
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return (
            request?.cookies?.Authentication ||
            request?.headers?.authorization?.split(' ')[1]
          );
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // Валидация декодированного токена
  async validate(payload: any) {
    // Добавляем проверку пользователя в БД
    const user = await this.usersService.findByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };
  }
}
