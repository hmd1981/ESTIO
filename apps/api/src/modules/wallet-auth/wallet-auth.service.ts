import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verifyMessage } from 'viem';
import { PrismaService } from '../../prisma/prisma.service';
import {
  buildSiweMessage,
  normalizeWalletAddress,
  type SiweMessageFields,
  type WalletAddress,
  type WalletJwtPayload,
} from './wallet-auth.constants';
import { resolveChainConfig } from '../payments/chain.config';

interface NonceResponse {
  nonce: string;
  expiresAt: string;
  message: string;
}

interface VerifyInput {
  address: unknown;
  signature: unknown;
  message: unknown;
}

interface VerifyResponse {
  accessToken: string;
  expiresInSeconds: number;
  user: {
    id: string;
    walletAddress: WalletAddress;
  };
}

/**
 * SIWE-based wallet auth.
 *
 * - `nonce({ address })` issues a single-use nonce that expires after
 *   `PHASE2_SIWE_NONCE_TTL_SECONDS`. We pre-bind the nonce to the address so
 *   a stolen nonce can't be reused with a different address.
 * - `verify({ address, signature, message })` recovers the signer from the
 *   provided EIP-191 signature, checks it matches `address`, consumes the
 *   matching `SiweNonce`, upserts a `User` row, and signs a wallet JWT.
 *
 * Both methods are throttled at the controller layer with the global short/long
 * tiers; the consume-on-verify also makes brute force pointless because each
 * nonce is exactly one shot.
 */
@Injectable()
export class WalletAuthService {
  private readonly logger = new Logger(WalletAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private get domain(): string {
    return process.env.PHASE2_SIWE_DOMAIN?.trim() || 'estio.org';
  }

  private get nonceTtlSeconds(): number {
    const raw = Number(process.env.PHASE2_SIWE_NONCE_TTL_SECONDS ?? 600);
    if (!Number.isFinite(raw) || raw < 60 || raw > 60 * 60) return 600;
    return raw;
  }

  private get jwtTtlSeconds(): number {
    return 60 * 60 * 24 * 7;
  }

  async nonce(addressRaw: unknown): Promise<NonceResponse> {
    const address = normalizeWalletAddress(addressRaw);
    if (!address) {
      throw new BadRequestException('A valid 0x… wallet address is required');
    }
    const chain = resolveChainConfig();
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + this.nonceTtlSeconds * 1000);
    const nonce = randomBytes(16).toString('hex');

    await this.prisma.siweNonce.create({
      data: {
        nonce,
        walletAddress: address,
        expiresAt,
      },
    });

    const fields: SiweMessageFields = {
      domain: this.domain,
      address,
      chainId: chain.id,
      nonce,
      issuedAt,
      expiresAt,
    };
    return {
      nonce,
      expiresAt: expiresAt.toISOString(),
      message: buildSiweMessage(fields),
    };
  }

  async verify(input: VerifyInput): Promise<VerifyResponse> {
    const address = normalizeWalletAddress(input.address);
    if (!address) {
      throw new BadRequestException('address must be a 0x… hex address');
    }
    if (typeof input.signature !== 'string' || !/^0x[0-9a-fA-F]+$/.test(input.signature)) {
      throw new BadRequestException('signature must be a 0x… hex string');
    }
    if (typeof input.message !== 'string' || !input.message.includes(`Nonce: `)) {
      throw new BadRequestException('message must be the SIWE message returned by /auth/wallet/nonce');
    }

    // Cheap structural check before we hit the DB or do any crypto.
    const nonceMatch = input.message.match(/^Nonce: ([0-9a-f]{8,64})$/m);
    if (!nonceMatch) {
      throw new BadRequestException('message is missing a Nonce line');
    }
    const nonce = nonceMatch[1];

    const row = await this.prisma.siweNonce.findUnique({ where: { nonce } });
    if (!row || row.consumedAt) {
      throw new UnauthorizedException('Nonce is invalid or already used');
    }
    if (row.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Nonce has expired; request a fresh one');
    }
    if (row.walletAddress && row.walletAddress.toLowerCase() !== address) {
      throw new UnauthorizedException('Nonce was issued for a different address');
    }

    let recoveredOk = false;
    try {
      recoveredOk = await verifyMessage({
        address,
        message: input.message,
        signature: input.signature as `0x${string}`,
      });
    } catch (e) {
      this.logger.warn(`SIWE verifyMessage threw: ${(e as Error).message}`);
      throw new UnauthorizedException('Signature verification failed');
    }
    if (!recoveredOk) {
      throw new UnauthorizedException('Signature does not match address');
    }

    // Atomically consume the nonce + upsert the user. If two clients race the
    // same nonce, only one wins (the second sees consumedAt set and 401s above
    // on a retry).
    const now = new Date();
    const consumed = await this.prisma.siweNonce.updateMany({
      where: { nonce, consumedAt: null },
      data: { consumedAt: now },
    });
    if (consumed.count !== 1) {
      throw new UnauthorizedException('Nonce was just consumed by another request');
    }

    const user = await this.prisma.user.upsert({
      where: { walletAddress: address },
      update: { lastLoginAt: now },
      create: { walletAddress: address, lastLoginAt: now },
    });

    const chain = resolveChainConfig();
    const payload: WalletJwtPayload = {
      sub: address,
      kind: 'wallet',
      aud: this.domain,
      chainId: chain.id,
      issuedAt: Math.floor(now.getTime() / 1000),
    };
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: this.jwtTtlSeconds,
    });

    return {
      accessToken,
      expiresInSeconds: this.jwtTtlSeconds,
      user: { id: user.id, walletAddress: address },
    };
  }
}
