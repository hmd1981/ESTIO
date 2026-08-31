"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Lightweight client-side wallet session — no wagmi/web3modal, no extra MB
 * of dependencies. Talks directly to `window.ethereum` (any EIP-1193
 * provider works: MetaMask, Coinbase Wallet, Rabby, Rainbow injected, …)
 * and to our same-origin BFF for nonce + verify.
 *
 * Storage:
 *   - `localStorage["estio.walletToken"]` = signed JWT from /auth/wallet/verify
 *   - `localStorage["estio.walletAddress"]` = lowercased 0x address (cosmetic)
 *
 * Token format and lifecycle are owned by the API; the client doesn't
 * inspect/decode it. On 401 from any guarded route, callers should call
 * {@link clearWalletSession} and re-prompt login.
 */

const TOKEN_KEY = "estio.walletToken";
const ADDR_KEY = "estio.walletAddress";

export type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export interface WalletSession {
  address: `0x${string}`;
  token: string;
}

export function getWalletSession(): WalletSession | null {
  if (typeof window === "undefined") return null;
  try {
    const token = window.localStorage.getItem(TOKEN_KEY);
    const address = window.localStorage.getItem(ADDR_KEY);
    if (!token || !address) return null;
    if (!/^0x[0-9a-f]{40}$/.test(address)) return null;
    return { token, address: address as `0x${string}` };
  } catch {
    return null;
  }
}

export function clearWalletSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(ADDR_KEY);
    window.dispatchEvent(new CustomEvent("estio:wallet-session-changed"));
  } catch {
    /* ignore */
  }
}

function persistSession(s: WalletSession): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, s.token);
    window.localStorage.setItem(ADDR_KEY, s.address);
    window.dispatchEvent(new CustomEvent("estio:wallet-session-changed"));
  } catch {
    /* ignore */
  }
}

/**
 * Top-level login flow:
 *   1. Ask the wallet for accounts.
 *   2. Call BFF /api/auth/wallet/nonce?address=… → server returns the SIWE
 *      message text + nonce.
 *   3. personal_sign the message text via the wallet.
 *   4. POST {address, message, signature} to /api/auth/wallet/verify → JWT.
 *   5. Persist the JWT + address; downstream code reads it via getWalletSession().
 */
export async function loginWithWallet(): Promise<WalletSession> {
  const provider = typeof window !== "undefined" ? window.ethereum : undefined;
  if (!provider) {
    throw new Error("No wallet detected. Install MetaMask or another Web3 wallet to continue.");
  }
  const accountsRaw = (await provider.request({
    method: "eth_requestAccounts",
  })) as unknown;
  if (!Array.isArray(accountsRaw) || accountsRaw.length === 0) {
    throw new Error("Wallet returned no accounts.");
  }
  const address = String(accountsRaw[0]).trim().toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(address)) {
    throw new Error("Wallet returned an unexpected address format.");
  }

  const nonceRes = await fetch(
    `/api/auth/wallet/nonce?address=${encodeURIComponent(address)}`,
    { cache: "no-store" },
  );
  if (!nonceRes.ok) {
    throw new Error(`Failed to issue login nonce (HTTP ${nonceRes.status}).`);
  }
  const { message } = (await nonceRes.json()) as { message: string };
  if (typeof message !== "string" || !message.includes("Nonce: ")) {
    throw new Error("Server returned an unexpected nonce payload.");
  }

  const signature = (await provider.request({
    method: "personal_sign",
    params: [message, address],
  })) as string;
  if (typeof signature !== "string" || !signature.startsWith("0x")) {
    throw new Error("Wallet signature was rejected or malformed.");
  }

  const verifyRes = await fetch("/api/auth/wallet/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address, message, signature }),
  });
  if (!verifyRes.ok) {
    const errBody = await verifyRes.text();
    throw new Error(
      errBody?.slice(0, 240) ||
        `Login verification failed (HTTP ${verifyRes.status}).`,
    );
  }
  const verifyBody = (await verifyRes.json()) as {
    accessToken: string;
    user: { walletAddress: string };
  };
  if (!verifyBody.accessToken) {
    throw new Error("Server returned no access token.");
  }
  const session: WalletSession = {
    token: verifyBody.accessToken,
    address: address as `0x${string}`,
  };
  persistSession(session);
  return session;
}

/** React hook — returns the current session and reactively updates on
 * login/logout (any tab). */
export function useWalletSession(): WalletSession | null {
  const [session, setSession] = useState<WalletSession | null>(() =>
    getWalletSession(),
  );
  useEffect(() => {
    function refresh() {
      setSession(getWalletSession());
    }
    window.addEventListener("estio:wallet-session-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("estio:wallet-session-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  /** Re-validate JWT against `/auth/wallet/me` — clears storage if revoked. */
  useEffect(() => {
    const token = session?.token;
    if (!token) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/wallet/me", {
          headers: { authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.status === 401) clearWalletSession();
      } catch {
        /* offline — keep session until next successful call */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.token]);

  return session;
}

/** Hook for the user's credit balance. Refetches on login/logout and on
 * `estio:credits-changed` (which the studio panels dispatch after a job
 * submit). */
export function useCreditBalance(): {
  balance: number | null;
  loading: boolean;
  refresh: () => void;
} {
  const session = useWalletSession();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchOnce = useCallback(async () => {
    if (!session) {
      setBalance(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/credits/balance", {
        headers: { authorization: `Bearer ${session.token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const body = (await res.json()) as { balance?: number };
        setBalance(typeof body.balance === "number" ? body.balance : 0);
      } else if (res.status === 401) {
        clearWalletSession();
        setBalance(null);
      }
    } catch {
      /* swallow — UI will show "—" */
    } finally {
      setLoading(false);
    }
  }, [session]);
  useEffect(() => {
    void fetchOnce();
    function onChange() {
      void fetchOnce();
    }
    window.addEventListener("estio:credits-changed", onChange);
    return () => window.removeEventListener("estio:credits-changed", onChange);
  }, [fetchOnce]);
  return { balance, loading, refresh: fetchOnce };
}
