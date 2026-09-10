import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { TICKERS, COMPANY_INFO } from './src/data/tickers.ts';
import { getUniversesForTicker, getMarketCapTier, UNIVERSES } from './src/data/universes.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache loaded from seed file
let cachedData: any = null;
const seedPath = path.resolve(process.cwd(), 'src/data/seed-momentum.json');

try {
  if (fs.existsSync(seedPath)) {
    const raw = fs.readFileSync(seedPath, 'utf-8');
    cachedData = JSON.parse(raw);
  }
} catch (e) {
  console.error('Error loading initial seed data:', e);
}

function calculateEMA(values: number[], span: number): number[] {
  const k = 2 / (span + 1);
  const ema: number[] = [];
  let prev = values[0];
  ema.push(prev);
  for (let i = 1; i < values.length; i++) {
    const curr = values[i] * k + prev * (1 - k);
    ema.push(curr);
    prev = curr;
  }
  return ema;
}

function calculateRanks(arr: any[], key: string, weight: number = 1): number[] {
  const items = arr.map((item, idx) => ({ val: item[key], idx }));
  items.sort((a, b) => b.val - a.val);

  const ranks = new Array(arr.length);
  let i = 0;
  while (i < items.length) {
    let j = i;
    while (j < items.length && items[j].val === items[i].val) {
      j++;
    }
    const avgRank = ((i + 1 + j) / 2) * weight;
    for (let k = i; k < j; k++) {
      ranks[items[k].idx] = Math.round(avgRank * 10) / 10;
    }
    i = j;
  }
  return ranks;
}

async function fetchTickerRaw(symbol: string) {
  const cleanSymbol = symbol.trim().toUpperCase().endsWith('.NS') || symbol.trim().toUpperCase().endsWith('.BO')
    ? symbol.trim().toUpperCase()
    : `${symbol.trim().toUpperCase()}.NS`;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${cleanSymbol}?range=2y&interval=1d`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: '*/*'
    }
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error('No quote data found');

  const timestamps: number[] = result.timestamp || [];
  const adjCloses: (number | null)[] = result.indicators?.adjclose?.[0]?.adjclose;
  const rawCloses: (number | null)[] = result.indicators?.quote?.[0]?.close;
  const closesArr = adjCloses || rawCloses;
  if (!closesArr || closesArr.length < 252) throw new Error('Insufficient historical data (< 252 days)');

  const validPairs: { t: number; p: number }[] = [];
  for (let i = 0; i < closesArr.length; i++) {
    const p = closesArr[i];
    if (typeof p === 'number' && !isNaN(p) && p > 0) {
      validPairs.push({ t: timestamps[i] || 0, p });
    }
  }
  if (validPairs.length < 252) throw new Error('Insufficient valid trade points (< 252)');

  return { cleanSymbol, validPairs };
}

// 1. API: Get Current Screener Data
app.get('/api/data', (req, res) => {
  if (cachedData) {
    return res.json({ success: true, data: cachedData });
  }
  res.status(503).json({ success: false, error: 'Data is initializing' });
});

// 2. API: Trigger Live Screener Rescan with optional customized parameters
app.post('/api/rescan', async (req, res) => {
  try {
    const config = req.body || {};
    const emaSpan = Number(config.emaSpan) || 100;
    const min1YReturn = typeof config.min1YReturn === 'number' ? config.min1YReturn : 6.5;
    const maxDistFrom52WHigh = typeof config.maxDistFrom52WHigh === 'number' ? config.maxDistFrom52WHigh : 20.0;
    const minUpDaysPct = typeof config.minUpDaysPct === 'number' ? config.minUpDaysPct : 45.0;
    const weight6M = Number(config.weight6M) || 1.0;
    const weight3M = Number(config.weight3M) || 1.0;
    const weight1M = Number(config.weight1M) || 1.0;

    // Use current ticker list plus any custom added ones
    const tickersToScan = [...new Set([...TICKERS, ...(cachedData?.stocks?.map((s: any) => s.ticker) || [])])];
    const results: any[] = [];
    const concurrency = 10;

    for (let i = 0; i < tickersToScan.length; i += concurrency) {
      const chunk = tickersToScan.slice(i, i + concurrency);
      const chunkPromises = chunk.map(async (ticker) => {
        try {
          const raw = await fetchTickerRaw(ticker);
          const closes = raw.validPairs.map((v) => v.p);
          const n = closes.length;

          const emaSeries = calculateEMA(closes, emaSpan);
          const latestPrice = closes[n - 1];
          const latestEMA = emaSeries[n - 1];

          const price1Y = closes[n - 252];
          const return1Y = ((latestPrice / price1Y) - 1) * 100;

          const last252 = closes.slice(-252);
          const high52W = Math.max(...last252);
          const distFrom52WHigh = ((latestPrice - high52W) / high52W) * 100;
          const withinHighPct = distFrom52WHigh >= -maxDistFrom52WHigh;

          const last126 = closes.slice(-126);
          let upDays = 0;
          for (let k = 1; k < last126.length; k++) {
            if (last126[k] > last126[k - 1]) upDays++;
          }
          const upDaysPct = (upDays / (last126.length - 1)) * 100;

          const passEMA = latestPrice >= latestEMA;
          const pass1Y = return1Y >= min1YReturn;
          const pass52W = withinHighPct;
          const passUpDays = upDaysPct > minUpDaysPct;
          const passed = passEMA && pass1Y && pass52W && passUpDays;

          const price6M = closes[n - 126];
          const price3M = closes[n - 63];
          const price1M = closes[n - 21];

          const return6M = ((latestPrice / price6M) - 1) * 100;
          const return3M = ((latestPrice / price3M) - 1) * 100;
          const return1M = ((latestPrice / price1M) - 1) * 100;

          const step = Math.floor(closes.length / 25);
          const sparkline: number[] = [];
          for (let k = 0; k < closes.length; k += step) {
            sparkline.push(Math.round(closes[k] * 10) / 10);
          }
          if (sparkline[sparkline.length - 1] !== Math.round(latestPrice * 10) / 10) {
            sparkline.push(Math.round(latestPrice * 10) / 10);
          }

          const info = COMPANY_INFO[ticker] || {
            name: ticker.replace(/\.(NS|BO)/, ''),
            sector: 'NSE Equities'
          };

          return {
            ticker,
            name: info.name,
            sector: info.sector,
            price: Math.round(latestPrice * 100) / 100,
            ema100: Math.round(latestEMA * 100) / 100,
            return1Y: Math.round(return1Y * 10) / 10,
            high52W: Math.round(high52W * 100) / 100,
            distFrom52WHigh: Math.round(distFrom52WHigh * 10) / 10,
            upDaysPct: Math.round(upDaysPct * 10) / 10,
            passEMA,
            pass1Y,
            pass52W,
            passUpDays,
            passed,
            return6M: Math.round(return6M * 10) / 10,
            return3M: Math.round(return3M * 10) / 10,
            return1M: Math.round(return1M * 10) / 10,
            sparkline,
            universes: getUniversesForTicker(ticker),
            marketCapTier: getMarketCapTier(ticker)
          };
        } catch {
          return null;
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      for (const r of chunkResults) {
        if (r) results.push(r);
      }
    }

    const passedStocks = results.filter((s) => s.passed);
    const ranks6M = calculateRanks(passedStocks, 'return6M', weight6M);
    const ranks3M = calculateRanks(passedStocks, 'return3M', weight3M);
    const ranks1M = calculateRanks(passedStocks, 'return1M', weight1M);

    for (let i = 0; i < passedStocks.length; i++) {
      passedStocks[i].rank6M = ranks6M[i];
      passedStocks[i].rank3M = ranks3M[i];
      passedStocks[i].rank1M = ranks1M[i];
      passedStocks[i].finalRank = Math.round((ranks6M[i] + ranks3M[i] + ranks1M[i]) * 10) / 10;
    }

    passedStocks.sort((a, b) => a.finalRank - b.finalRank);

    passedStocks.forEach((stock, idx) => {
      stock.position = idx + 1;
      if (stock.position <= 15) {
        stock.tier = 'top15';
      } else if (stock.position <= 30) {
        stock.tier = 'next15';
      } else {
        stock.tier = 'other_passed';
      }
    });

    const failedStocks = results.filter((s) => !s.passed);
    failedStocks.forEach((s) => {
      s.rank6M = null;
      s.rank3M = null;
      s.rank1M = null;
      s.finalRank = null;
      s.position = null;
      s.tier = 'unfiltered';
    });

    cachedData = {
      generatedAt: new Date().toISOString(),
      totalAnalyzed: results.length,
      passedCount: passedStocks.length,
      top15Count: Math.min(15, passedStocks.length),
      next15Count: Math.max(0, Math.min(15, passedStocks.length - 15)),
      stocks: [...passedStocks, ...failedStocks]
    };

    res.json({ success: true, data: cachedData });
  } catch (err: any) {
    console.error('Error during rescan:', err);
    res.status(500).json({ success: false, error: err.message || 'Rescan failed' });
  }
});

// 3. API: Analyze Single Ticker (custom addition or on-demand check)
app.get('/api/analyze-ticker', async (req, res) => {
  const tickerQuery = req.query.ticker as string;
  if (!tickerQuery) {
    return res.status(400).json({ success: false, error: 'Ticker is required' });
  }

  try {
    const raw = await fetchTickerRaw(tickerQuery);
    const closes = raw.validPairs.map((v) => v.p);
    const n = closes.length;

    const ema100 = calculateEMA(closes, 100);
    const latestPrice = closes[n - 1];
    const latestEMA100 = ema100[n - 1];

    const price1Y = closes[n - 252];
    const return1Y = ((latestPrice / price1Y) - 1) * 100;

    const last252 = closes.slice(-252);
    const high52W = Math.max(...last252);
    const distFrom52WHigh = ((latestPrice - high52W) / high52W) * 100;
    const within20PctHigh = distFrom52WHigh >= -20.0;

    const last126 = closes.slice(-126);
    let upDays = 0;
    for (let k = 1; k < last126.length; k++) {
      if (last126[k] > last126[k - 1]) upDays++;
    }
    const upDaysPct = (upDays / (last126.length - 1)) * 100;

    const passEMA = latestPrice >= latestEMA100;
    const pass1Y = return1Y >= 6.5;
    const pass52W = within20PctHigh;
    const passUpDays = upDaysPct > 45;
    const passed = passEMA && pass1Y && pass52W && passUpDays;

    const price6M = closes[n - 126];
    const price3M = closes[n - 63];
    const price1M = closes[n - 21];

    const return6M = ((latestPrice / price6M) - 1) * 100;
    const return3M = ((latestPrice / price3M) - 1) * 100;
    const return1M = ((latestPrice / price1M) - 1) * 100;

    const info = COMPANY_INFO[raw.cleanSymbol] || {
      name: raw.cleanSymbol.replace(/\.(NS|BO)/, ''),
      sector: 'NSE Equities'
    };

    const singleStock = {
      ticker: raw.cleanSymbol,
      name: info.name,
      sector: info.sector,
      price: Math.round(latestPrice * 100) / 100,
      ema100: Math.round(latestEMA100 * 100) / 100,
      return1Y: Math.round(return1Y * 10) / 10,
      high52W: Math.round(high52W * 100) / 100,
      distFrom52WHigh: Math.round(distFrom52WHigh * 10) / 10,
      upDaysPct: Math.round(upDaysPct * 10) / 10,
      passEMA,
      pass1Y,
      pass52W,
      passUpDays,
      passed,
      return6M: Math.round(return6M * 10) / 10,
      return3M: Math.round(return3M * 10) / 10,
      return1M: Math.round(return1M * 10) / 10,
      universes: getUniversesForTicker(raw.cleanSymbol),
      marketCapTier: getMarketCapTier(raw.cleanSymbol)
    };

    res.json({ success: true, data: singleStock });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message || 'Failed to fetch ticker' });
  }
});

// 4. API: Get Historical Time Series for Interactive Chart
app.get('/api/chart/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  try {
    const raw = await fetchTickerRaw(ticker);
    const closes = raw.validPairs.map((v) => v.p);
    const timestamps = raw.validPairs.map((v) => v.t);
    const emaSeries = calculateEMA(closes, 100);

    // Calculate rolling 52-week high for the last 252 days
    const resultSeries: any[] = [];
    // Only return the last 252 trading days (~1 year) for clean chart display
    const startIdx = Math.max(0, closes.length - 252);
    const high52WOverall = Math.max(...closes.slice(-252));

    for (let i = startIdx; i < closes.length; i++) {
      const dateStr = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
      resultSeries.push({
        date: dateStr,
        timestamp: timestamps[i],
        close: Math.round(closes[i] * 100) / 100,
        ema100: Math.round(emaSeries[i] * 100) / 100,
        high52W: Math.round(high52WOverall * 100) / 100
      });
    }

    res.json({
      success: true,
      ticker: raw.cleanSymbol,
      high52W: high52WOverall,
      series: resultSeries
    });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// Start Express Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Momentum Screener server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
