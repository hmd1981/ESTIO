import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
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

/**
 * Bearer first, then `X-Estio-Admin-Token` (raw JWT). Duplicate header helps when a proxy strips
 * `Authorization` but forwards custom headers (some edge CDN / WAF setups).
 */
function jwtFromRequest(req: Request): string | null {
  const bearer = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (bearer) {
    return bearer;
  }
  const raw = req.headers['x-estio-admin-token'];
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (typeof v === 'string' && v.trim().length > 0) {
    return v.trim();
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest,
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
