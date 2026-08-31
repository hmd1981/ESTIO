"use client";

import { useCallback, useEffect, useState } from "react";
import { clearWalletSession, type WalletSession } from "./wallet-session";

export type LedgerRow = {
  id: string;
  delta: number;
  reason: string;
  refType: string;
  refId: string;
  balanceAfter: number;
  notes: string | null;
  createdAt: string;
};

/**
 * Fetches paginated credit ledger rows via the same-origin BFF
 * (`GET /api/credits/ledger`).
 */
export function useCreditLedger(session: WalletSession | null) {
  const [items, setItems] = useState<LedgerRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (cursor?: string | null) => {
      if (!session) return;
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams();
        qs.set("limit", "15");
        if (cursor) qs.set("cursor", cursor);
        const res = await fetch(`/api/credits/ledger?${qs}`, {
          headers: { authorization: `Bearer ${session.token}` },
          cache: "no-store",
        });
        if (res.status === 401) {
          clearWalletSession();
          setItems([]);
          setNextCursor(null);
          return;
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const body = (await res.json()) as {
          items: LedgerRow[];
          nextCursor: string | null;
        };
        if (cursor) {
          setItems((prev) => [...prev, ...body.items]);
        } else {
          setItems(body.items);
        }
        setNextCursor(body.nextCursor);
      } catch (e) {
        setError(e instanceof Error ? e.message : "ledger_fetch_failed");
      } finally {
        setLoading(false);
      }
    },
    [session],
  );

  const reset = useCallback(() => {
    setItems([]);
    setNextCursor(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!session) reset();
  }, [session, reset]);

  return { items, nextCursor, loading, error, load, reset };
}
