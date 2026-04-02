import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async login(dto: LoginDto): Promise<{ access_token: string; expires_in: string }> {
    const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
    const plain = process.env.ADMIN_PASSWORD?.trim();
    let ok = false;
    if (hash) {
      ok = await bcrypt.compare(dto.password, hash);
    } else if (plain) {
      ok = dto.password === plain;
    } else {
      throw new UnauthorizedException(
        'Server auth is not configured (set ADMIN_PASSWORD_HASH or ADMIN_PASSWORD)',
      );
    }
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const expiresSeconds = 60 * 60 * 24 * 7;
    const access_token = await this.jwt.signAsync(
      { sub: 'admin' },
      { expiresIn: expiresSeconds },
    );
    return { access_token, expires_in: `${expiresSeconds}s` };
  }
}
