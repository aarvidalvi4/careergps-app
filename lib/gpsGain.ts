import type { MarketData } from './useMarketData';

/**
 * Per-skill GPS readiness gain.
 *
 * Formula (plain language):
 *   freq  = how many of the fetched postings mention this skill  (0–1)
 *   gain  = clamp( round(5 + freq × 15), 5, 20 )
 *
 * Examples with 20 total postings:
 *   Git in 14/20  → freq 0.70 → 5 + 10 = 15 %
 *   AWS in  8/20  → freq 0.40 → 5 +  6 = 11 %
 *   DSA in  3/20  → freq 0.15 → 5 +  2 =  7 %
 *
 * Skills not found in live postings fall back to 3 % (static estimate).
 * The gain shown here is ONLY the per-skill display badge — it does not
 * alter the overall readiness score, which uses its own separate formula.
 */
export function gpsGain(skill: string, market: MarketData | null): { gain: number; isLive: boolean } {
  if (!market || !market.skillCounts || !market.totalJobs) {
    return { gain: 3, isLive: false };
  }

  const count = market.skillCounts[skill];
  if (!count) {
    return { gain: 3, isLive: false };
  }

  const freq = count / market.totalJobs;
  const gain = Math.min(20, Math.max(5, Math.round(5 + freq * 15)));
  return { gain, isLive: true };
}
