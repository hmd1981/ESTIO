import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtPayload = { sub: string };

function jwtSecret(): string {
  const s = process.env.JWT_SECRET?.trim();
  if (s) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }
  return 'development-only-secret';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret(),
    });
  }

  validate(payload: JwtPayload) {
    if (payload.sub !== 'admin') {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub };
  }
}
