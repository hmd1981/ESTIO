/**
 * Phase 2 — wallet auth constants. Centralized so the SIWE message construction
 * (server side) and the verification (server side) cannot drift apart, and so a
 * future client copy can be diffed cleanly.
 */

/** Lower-cased, 0x-prefixed hex address as a branded string for clarity. */
export type WalletAddress = `0x${string}`;

/** JWT claim shape returned by `POST /auth/wallet/verify`. */
export interface WalletJwtPayload {
  sub: WalletAddress;
  /** Distinguishes from the admin JWT (sub: 'admin'). Anywhere we accept a user
   * token we MUST check `kind === 'wallet'` to defend against an admin token
   * accidentally being passed to a user route (or vice versa). */
  kind: 'wallet';
  /** Audience — pinned to PHASE2_SIWE_DOMAIN so a token issued for one domain
   * cannot be replayed against a different one. */
  aud: string;
  /** Chain id the user signed against (8453 mainnet, 84532 sepolia). Useful
   * audit trail and lets the client warn when the network mismatches the
   * payment chain. */
  chainId: number;
  /** Issued-at (epoch seconds). JWT lib also adds `iat`; this is duplicated
   * for ergonomic reads. */
  issuedAt: number;
}

/**
 * SIWE-style message we ask the user to sign. We deliberately follow the
 * EIP-4361 layout but skip the strict library so we don't take a heavy dep
 * just for one message format. viem's `verifyMessage` recovers the address
 * from the signature, which is all the verification we need.
 *
 * Format (each line separated by \n):
 *   <domain> wants you to sign in with your Ethereum account:
 *   <address>
 *
 *   Sign in to Estio. By signing this message you authenticate your wallet.
 *
 *   URI: https://<domain>
 *   Version: 1
 *   Chain ID: <chainId>
 *   Nonce: <nonce>
 *   Issued At: <iso8601>
 *   Expiration Time: <iso8601>
 */
export interface SiweMessageFields {
  domain: string;
  address: WalletAddress;
  chainId: number;
  nonce: string;
  issuedAt: Date;
  expiresAt: Date;
}

export function buildSiweMessage(f: SiweMessageFields): string {
  const lines = [
    `${f.domain} wants you to sign in with your Ethereum account:`,
    f.address,
    '',
    'Sign in to Estio. By signing this message you authenticate your wallet.',
    '',
    `URI: https://${f.domain}`,
    'Version: 1',
    `Chain ID: ${f.chainId}`,
    `Nonce: ${f.nonce}`,
    `Issued At: ${f.issuedAt.toISOString()}`,
    `Expiration Time: ${f.expiresAt.toISOString()}`,
  ];
  return lines.join('\n');
}

/** Recovers the canonical lowercase 0x address from a user-provided string,
 * or returns null if the input doesn't look like an address at all. We do
 * NOT do EIP-55 checksum validation here — viem's `getAddress` would do
 * that, but failing on a non-checksummed-but-valid input is a poor UX.
 */
export function normalizeWalletAddress(raw: unknown): WalletAddress | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(trimmed)) return null;
  return trimmed as WalletAddress;
}
