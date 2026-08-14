import { useEffect, useState } from 'react'

export interface MarketSeries {
  symbol: string
  /** Close price at each sample, oldest first. */
  prices: number[]
  /** Unix milliseconds for each sample. */
  times: number[]
}

/** Shape of the slice of the CoinGecko response this uses. */
interface MarketChartResponse {
  prices: [number, number][]
}

const SYMBOL = 'BTC'
// CoinGecko's public endpoint: no key, and it sends CORS headers, so it can be
// called straight from a static page. A day at this range comes back roughly
// five minutely, which is about 288 samples.
const ENDPOINT =
  'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1'
const REFRESH = 60_000

let inflight: Promise<MarketSeries> | null = null
let fetchedAt = 0

/**
 * One request shared by every caller. Both division panels read the same
 * series, and the endpoint is rate limited, so the result is cached at module
 * scope and only refetched once it is a minute stale.
 */
const load = (): Promise<MarketSeries> => {
  if (!inflight || Date.now() - fetchedAt > REFRESH) {
    fetchedAt = Date.now()
    inflight = fetch(ENDPOINT)
      .then((res) => {
        if (!res.ok) throw new Error(`market data ${res.status}`)
        return res.json() as Promise<MarketChartResponse>
      })
      .then(({ prices }) => ({
        symbol: SYMBOL,
        times: prices.map(([t]) => t),
        prices: prices.map(([, p]) => p),
      }))
      .catch((err: unknown) => {
        // Let the next caller retry rather than caching the failure.
        inflight = null
        throw err
      })
  }
  return inflight
}

/**
 * Live price history, or null until it arrives. Callers are expected to have a
 * synthetic fallback: this is a third party endpoint on a static site, so it
 * can rate limit or fail outright and the page still has to render.
 */
export function useMarketData(): MarketSeries | null {
  const [series, setSeries] = useState<MarketSeries | null>(null)

  useEffect(() => {
    let alive = true
    const pull = () => {
      load().then(
        (next) => {
          if (alive) setSeries(next)
        },
        () => undefined,
      )
    }

    pull()
    const timer = setInterval(pull, REFRESH)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [])

  return series
}
