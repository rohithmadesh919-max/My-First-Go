import fs from 'fs';
import path from 'path';
import {
  UNIVERSES,
  getUniversesForTicker,
  getMarketCapTier,
  SEGMENT_NIFTY_SMALLCAP_50,
  SEGMENT_NIFTY_SMALLCAP_51_100,
  SEGMENT_NIFTY_SMALLCAP_101_250,
  SEGMENT_NIFTY_MICROCAP_250
} from '../src/data/universes.ts';

const seedPath = path.resolve(process.cwd(), 'src/data/seed-momentum.json');
const raw = fs.readFileSync(seedPath, 'utf-8');
const seed = JSON.parse(raw);
const existingTickers = new Set(seed.stocks.map(s => s.ticker));

// Tickers to fetch
const targetTickers = [
  ...Array.from(SEGMENT_NIFTY_SMALLCAP_50),
  ...Array.from(SEGMENT_NIFTY_SMALLCAP_51_100).slice(0, 30),
  ...Array.from(SEGMENT_NIFTY_SMALLCAP_101_250).slice(0, 30),
  ...Array.from(SEGMENT_NIFTY_MICROCAP_250).slice(0, 45)
].filter(t => !existingTickers.has(t));

console.log(`Need to fetch ${targetTickers.length} new smallcap & microcap stocks...`);

function calculateEMA(values, span) {
  const k = 2 / (span + 1);
  const ema = [];
  let prev = values[0];
  ema.push(prev);
  for (let i = 1; i < values.length; i++) {
    const curr = values[i] * k + prev * (1 - k);
    ema.push(curr);
    prev = curr;
  }
  return ema;
}

async function fetchTicker(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=2y&interval=1d`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*"
      }
    });
    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const timestamps = result.timestamp || [];
    const adjCloses = result.indicators?.adjclose?.[0]?.adjclose;
    const rawCloses = result.indicators?.quote?.[0]?.close;
    const closesArr = adjCloses || rawCloses;
    if (!closesArr || closesArr.length < 126) return null;

    // Filter valid
    const validPairs = [];
    for (let i = 0; i < closesArr.length; i++) {
      const p = closesArr[i];
      if (typeof p === 'number' && !isNaN(p) && p > 0) {
        validPairs.push({ t: timestamps[i] || 0, p });
      }
    }
    if (validPairs.length < 126) return null;

    const closes = validPairs.map(v => v.p);
    const n = closes.length;

    const ema100Series = calculateEMA(closes, 100);
    const latestPrice = closes[n - 1];
    const latestEMA100 = ema100Series[n - 1];

    const idx1Y = Math.max(0, n - 252);
    const price1Y = closes[idx1Y];
    const return1Y = ((latestPrice / price1Y) - 1) * 100;

    const last252 = closes.slice(-252);
    const high52W = Math.max(...last252);
    const within20PctHigh = latestPrice >= high52W * 0.8;
    const distFrom52WHigh = ((latestPrice - high52W) / high52W) * 100;

    const last126 = closes.slice(-126);
    let upDays = 0;
    for (let i = 1; i < last126.length; i++) {
      if (last126[i] > last126[i - 1]) upDays++;
    }
    const upDaysPct = (upDays / (last126.length - 1)) * 100;

    const passEMA = latestPrice >= latestEMA100;
    const pass1Y = return1Y >= 6.5;
    const pass52W = within20PctHigh;
    const passUpDays = upDaysPct > 45;
    const passed = passEMA && pass1Y && pass52W && passUpDays;

    const price6M = closes[Math.max(0, n - 126)];
    const price3M = closes[Math.max(0, n - 63)];
    const price1M = closes[Math.max(0, n - 21)];

    const return6M = ((latestPrice / price6M) - 1) * 100;
    const return3M = ((latestPrice / price3M) - 1) * 100;
    const return1M = ((latestPrice / price1M) - 1) * 100;

    // Clean name
    const cleanSym = ticker.replace('.NS', '');
    const cleanName = cleanSym
      .replace(/([A-Z])/g, ' $1')
      .trim();

    // Sparkline
    const step = Math.max(1, Math.floor(closes.length / 25));
    const sparkline = [];
    for (let i = 0; i < closes.length; i += step) {
      sparkline.push(Math.round(closes[i] * 10) / 10);
    }

    const universes = getUniversesForTicker(ticker);
    const marketCapTier = getMarketCapTier(ticker);

    return {
      ticker,
      name: cleanName,
      sector: marketCapTier === 'Micro Cap' ? 'Emerging Microcap' : 'Small Cap Growth',
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
      rank6M: null,
      rank3M: null,
      rank1M: null,
      finalRank: null,
      position: null,
      tier: 'unfiltered',
      sparkline,
      universes,
      marketCapTier
    };
  } catch (err) {
    return null;
  }
}

// Fetch with concurrency 8
async function run() {
  const newStocks = [];
  const BATCH_SIZE = 8;
  for (let i = 0; i < targetTickers.length; i += BATCH_SIZE) {
    const chunk = targetTickers.slice(i, i + BATCH_SIZE);
    console.log(`Fetching batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(targetTickers.length / BATCH_SIZE)}...`);
    const results = await Promise.all(chunk.map(t => fetchTicker(t)));
    for (const r of results) {
      if (r) newStocks.push(r);
    }
  }

  console.log(`Successfully fetched ${newStocks.length} additional stocks.`);
  seed.stocks.push(...newStocks);
  seed.totalAnalyzed = seed.stocks.length;

  fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf-8');
  console.log('Saved updated seed-momentum.json.');
}

run();
