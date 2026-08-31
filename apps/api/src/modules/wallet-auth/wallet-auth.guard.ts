import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import {
  normalizeWalletAddress,
  type WalletAddress,
  type WalletJwtPayload,
} from './wallet-auth.constants';

declare module 'express' {
  interface Request {
    /** Set by WalletAuthGuard on success. Routes guarded by it can rely on this
     * being present and the user row existing. */
    walletUser?: {
      id: string;
      walletAddress: WalletAddress;
    };
  }
}

/**
 * Guard for endpoints that require a logged-in user wallet. Reads a Bearer
 * JWT, verifies it, asserts `kind === 'wallet'` (so an admin token cannot
 * accidentally grant user access), then loads the User row and attaches it
 * to `req.walletUser` for downstream handlers.
 *
 * NOT a passport strategy — kept deliberately small and explicit so the
 * one place we do the kind-check is auditable in one file.
 */
@Injectable()
export class WalletAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const header =
      typeof req.headers.authorization === 'string'
        ? req.headers.authorization
        : '';
    const m = header.match(/^Bearer\s+(.+)$/i);
    if (!m) {
      throw new UnauthorizedException('Missing Bearer token');
    }
    const token = m[1];
    let payload: WalletJwtPayload;
    try {
      payload = await this.jwt.verifyAsync<WalletJwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token is invalid or expired');
    }
    if (payload.kind !== 'wallet') {
      // An admin token landed on a user route; reject explicitly rather than
      // silently treating the admin as a user.
      throw new UnauthorizedException('Token is not a wallet token');
    }
    const address = normalizeWalletAddress(payload.sub);
    if (!address) {
      throw new UnauthorizedException('Token sub is not a wallet address');
    }
    const expectedAud = process.env.PHASE2_SIWE_DOMAIN?.trim() || 'estio.org';
    if (payload.aud !== expectedAud) {
      throw new UnauthorizedException('Token audience mismatch');
    }
    const user = await this.prisma.user.findUnique({
      where: { walletAddress: address },
    });
    if (!user) {
      // Edge case: user was deleted server-side after their token was issued.
      throw new UnauthorizedException('User no longer exists');
    }
    req.walletUser = { id: user.id, walletAddress: address };
    return true;
  }
}
