import { base, baseSepolia } from 'viem/chains';
import type { Chain } from 'viem';

/**
 * Phase 2 chain configuration — single source of truth for which chain we
 * accept payments on, which USDC contract address represents that chain's
 * USDC, and what RPC URL the watcher polls.
 *
 * All driven by env so a fresh deploy defaults to **Base Sepolia** and the
 * operator must explicitly opt-in to mainnet via `PHASE2_CHAIN=base`. See
 * `deploy/PHASE2_DECISIONS.md` for the full list of knobs.
 */

export type Phase2ChainName = 'base' | 'baseSepolia';

export interface ChainConfig {
  name: Phase2ChainName;
  id: number;
  chain: Chain;
  rpcUrl: string;
  /** USDC contract address on this chain (lowercased). */
  usdcAddress: `0x${string}`;
  /** USDC has 6 decimals on every chain Circle supports; codified here so
   * downstream code never assumes 18. */
  usdcDecimals: 6;
}

const BASE_USDC: `0x${string}` = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const BASE_SEPOLIA_USDC: `0x${string}` = '0x036cbd53842c5426634e7929541ec2318f3dcf7e';

let cached: ChainConfig | null = null;

export function resolveChainConfig(): ChainConfig {
  if (cached) return cached;
  const raw = (process.env.PHASE2_CHAIN ?? 'baseSepolia').trim() as Phase2ChainName;
  const isMainnet = raw === 'base';
  const chain = isMainnet ? base : baseSepolia;
  const rpcUrl =
    process.env.PHASE2_RPC_URL?.trim() || chain.rpcUrls.default.http[0];
  cached = {
    name: isMainnet ? 'base' : 'baseSepolia',
    id: chain.id,
    chain,
    rpcUrl,
    usdcAddress: isMainnet ? BASE_USDC : BASE_SEPOLIA_USDC,
    usdcDecimals: 6,
  };
  return cached;
}

/** Test seam — call from spec setup to force a re-read of env. */
export function _resetChainConfigCacheForTests(): void {
  cached = null;
}
