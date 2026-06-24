'use client';
import { useState, useEffect } from 'react';

export interface MarketData {
  count: number;        // total live postings found
  topSkills: string[];  // most-mentioned skills in those postings
  role: string;
  fetchedAt: number;    // unix ms — used to check cache freshness
}

// Cache lives for 24 hours — avoids hammering the API on every page visit
const TTL_MS = 24 * 60 * 60 * 1000;

function storageKey(role: string) {
  return `ccp_market_${role.replace(/[\s/]+/g, '_')}`;
}

export function useMarketData(role: string) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!role) return;

    // 1. Try localStorage cache first
    try {
      const raw = localStorage.getItem(storageKey(role));
      if (raw) {
        const cached: MarketData = JSON.parse(raw);
        if (Date.now() - cached.fetchedAt < TTL_MS) {
          setData(cached);
          return; // cache hit — skip network call
        }
      }
    } catch { /* localStorage unavailable (SSR / private mode) */ }

    // 2. Cache miss or stale — fetch from our API route
    setLoading(true);
    fetch(`/api/jobs/market?role=${encodeURIComponent(role)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(json => {
        if (json && !json.error) {
          try { localStorage.setItem(storageKey(role), JSON.stringify(json)); } catch { }
          setData(json);
        }
        // If fetch fails or API is down, data stays null → UI falls back to static list
      })
      .catch(() => { /* silent fail — static fallback still works */ })
      .finally(() => setLoading(false));
  }, [role]);

  return { data, loading };
}
