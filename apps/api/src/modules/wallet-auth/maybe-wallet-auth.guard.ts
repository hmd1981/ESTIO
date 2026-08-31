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
  type WalletJwtPayload,
} from './wallet-auth.constants';

/**
 * Two-mode guard for the Phase 2 rollout window.
 *
 *   - Strict mode  (PHASE2_ENFORCE_AUTH=true): identical to {@link WalletAuthGuard}.
 *     A missing/invalid Bearer token returns 401.
 *   - Soft mode    (default — PHASE2_ENFORCE_AUTH unset or false):  if the
 *     request carries a valid wallet token, `req.walletUser` is populated
 *     and the request proceeds. If it doesn't, the request still proceeds
 *     anonymously. This lets us deploy the credit-debit code path before
 *     wallet login is mandatory site-wide.
 *
 * Once the operator flips `PHASE2_ENFORCE_AUTH=true`, every gated endpoint
 * (currently the media-job submit handlers) requires a logged-in wallet AND
 * positive credit balance.
 */
@Injectable()
export class MaybeWalletAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private get strict(): boolean {
    const v = (process.env.PHASE2_ENFORCE_AUTH ?? '').trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes';
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const header =
      typeof req.headers.authorization === 'string'
        ? req.headers.authorization
        : '';
    const m = header.match(/^Bearer\s+(.+)$/i);
    if (!m) {
      if (this.strict) throw new UnauthorizedException('Missing Bearer token');
      return true;
    }
    const token = m[1];
    let payload: WalletJwtPayload | null = null;
    try {
      payload = await this.jwt.verifyAsync<WalletJwtPayload>(token);
    } catch {
      if (this.strict)
        throw new UnauthorizedException('Token is invalid or expired');
      return true;
    }
    if (!payload || payload.kind !== 'wallet') {
      if (this.strict)
        throw new UnauthorizedException('Token is not a wallet token');
      return true;
    }
    const address = normalizeWalletAddress(payload.sub);
    if (!address) {
      if (this.strict)
        throw new UnauthorizedException('Token sub is not a wallet address');
      return true;
    }
    const expectedAud = process.env.PHASE2_SIWE_DOMAIN?.trim() || 'estio.org';
    if (payload.aud !== expectedAud) {
      if (this.strict)
        throw new UnauthorizedException('Token audience mismatch');
      return true;
    }
    const user = await this.prisma.user.findUnique({
      where: { walletAddress: address },
    });
    if (!user) {
      if (this.strict) throw new UnauthorizedException('User no longer exists');
      return true;
    }
    req.walletUser = { id: user.id, walletAddress: address };
    return true;
  }
}
