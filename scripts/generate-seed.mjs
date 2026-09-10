import fs from 'fs';
import path from 'path';
import { TICKERS, COMPANY_INFO } from '../src/data/tickers.ts';

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

// Custom ranking function matching pandas .rank(ascending=False, method='average')
function calculateRanks(arr, key) {
  const items = arr.map((item, idx) => ({ val: item[key], idx }));
  // Sort descending
  items.sort((a, b) => b.val - a.val);

  const ranks = new Array(arr.length);
  let i = 0;
  while (i < items.length) {
    let j = i;
    while (j < items.length && items[j].val === items[i].val) {
      j++;
    }
    // Average rank for ties (1-based)
    const avgRank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) {
      ranks[items[k].idx] = avgRank;
    }
    i = j;
  }
  return ranks;
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
    if (!closesArr || closesArr.length < 252) return null;

    // Filter out nulls/NaNs while keeping alignment
    const validPairs = [];
    for (let i = 0; i < closesArr.length; i++) {
      const p = closesArr[i];
      if (typeof p === 'number' && !isNaN(p) && p > 0) {
        validPairs.push({ t: timestamps[i] || 0, p });
      }
    }
    if (validPairs.length < 252) return null;

    const closes = validPairs.map(v => v.p);
    const n = closes.length;

    // 1. Calculate EMA100
    const ema100Series = calculateEMA(closes, 100);
    const latestPrice = closes[n - 1];
    const latestEMA100 = ema100Series[n - 1];

    // 2. 1-year return (252 trading days back)
    const price1Y = closes[n - 252];
    const return1Y = ((latestPrice / price1Y) - 1) * 100;

    // 3. 52-week high
    const last252 = closes.slice(-252);
    const high52W = Math.max(...last252);
    const within20PctHigh = latestPrice >= high52W * 0.8;
    const distFrom52WHigh = ((latestPrice - high52W) / high52W) * 100;

    // 4. Up days % in last 6 months (126 trading days)
    const last126 = closes.slice(-126);
    let upDays = 0;
    for (let i = 1; i < last126.length; i++) {
      if (last126[i] > last126[i - 1]) upDays++;
    }
    const upDaysPct = (upDays / (last126.length - 1)) * 100;

    // Filtering criteria
    const passEMA = latestPrice >= latestEMA100;
    const pass1Y = return1Y >= 6.5;
    const pass52W = within20PctHigh;
    const passUpDays = upDaysPct > 45;
    const passed = passEMA && pass1Y && pass52W && passUpDays;

    // Multi-timeframe returns
    const price6M = closes[n - 126];
    const price3M = closes[n - 63];
    const price1M = closes[n - 21];

    const return6M = ((latestPrice / price6M) - 1) * 100;
    const return3M = ((latestPrice / price3M) - 1) * 100;
    const return1M = ((latestPrice / price1M) - 1) * 100;

    // Sample 25 sparkline points
    const step = Math.floor(closes.length / 25);
    const sparkline = [];
    for (let i = 0; i < closes.length; i += step) {
      sparkline.push(Math.round(closes[i] * 10) / 10);
    }
    if (sparkline[sparkline.length - 1] !== Math.round(latestPrice * 10) / 10) {
      sparkline.push(Math.round(latestPrice * 10) / 10);
    }

    const info = COMPANY_INFO[ticker] || {
      name: ticker.replace('.NS', ''),
      sector: 'NSE Equities'
    };

    return {
      ticker,
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
      sparkline
    };
  } catch (err) {
    console.error(`Error processing ${ticker}:`, err.message);
    return null;
  }
}

async function run() {
  console.log(`Starting scan of ${TICKERS.length} tickers...`);
  const concurrency = 10;
  const results = [];

  for (let i = 0; i < TICKERS.length; i += concurrency) {
    const chunk = TICKERS.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map(t => fetchTicker(t)));
    for (const r of chunkResults) {
      if (r) results.push(r);
    }
    process.stdout.write(`\rProcessed ${Math.min(i + concurrency, TICKERS.length)}/${TICKERS.length} tickers...`);
  }
  console.log(`\nCompleted fetching ${results.length} valid stocks.`);

  // Separate passed stocks
  const passedStocks = results.filter(s => s.passed);
  console.log(`Passed screening criteria: ${passedStocks.length} stocks.`);

  // Compute ranks for passed stocks
  const ranks6M = calculateRanks(passedStocks, 'return6M');
  const ranks3M = calculateRanks(passedStocks, 'return3M');
  const ranks1M = calculateRanks(passedStocks, 'return1M');

  for (let i = 0; i < passedStocks.length; i++) {
    passedStocks[i].rank6M = ranks6M[i];
    passedStocks[i].rank3M = ranks3M[i];
    passedStocks[i].rank1M = ranks1M[i];
    passedStocks[i].finalRank = Math.round((ranks6M[i] + ranks3M[i] + ranks1M[i]) * 10) / 10;
  }

  // Sort by Final_Rank ascending
  passedStocks.sort((a, b) => a.finalRank - b.finalRank);

  // Assign position and tiers
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

  // For non-passed stocks, assign position null
  const failedStocks = results.filter(s => !s.passed);
  failedStocks.forEach(s => {
    s.rank6M = null;
    s.rank3M = null;
    s.rank1M = null;
    s.finalRank = null;
    s.position = null;
    s.tier = 'unfiltered';
  });

  const allProcessed = [...passedStocks, ...failedStocks];

  const payload = {
    generatedAt: new Date().toISOString(),
    totalAnalyzed: results.length,
    passedCount: passedStocks.length,
    top15Count: Math.min(15, passedStocks.length),
    next15Count: Math.max(0, Math.min(15, passedStocks.length - 15)),
    stocks: allProcessed
  };

  const outputPath = path.resolve('src/data/seed-momentum.json');
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
  console.log(`Successfully wrote ${allProcessed.length} stocks to ${outputPath}`);
}

run();
