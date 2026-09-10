import fs from 'fs';
import path from 'path';
import {
  UNIVERSES,
  getUniversesForTicker,
  getMarketCapTier,
  SEGMENT_NIFTY_50,
  SEGMENT_NIFTY_NEXT_50,
  SEGMENT_NIFTY_MIDCAP_50,
  SEGMENT_NIFTY_MIDCAP_51_100,
  SEGMENT_NIFTY_MIDCAP_101_150,
  SEGMENT_NIFTY_SMALLCAP_50,
  SEGMENT_NIFTY_SMALLCAP_51_100,
  SEGMENT_NIFTY_SMALLCAP_101_250,
  SEGMENT_NIFTY_MICROCAP_250
} from '../src/data/universes.ts';

const seedPath = path.resolve(process.cwd(), 'src/data/seed-momentum.json');
const raw = fs.readFileSync(seedPath, 'utf-8');
const seed = JSON.parse(raw);

// Update existing stocks with universes and marketCapTier
for (const stock of seed.stocks) {
  stock.universes = getUniversesForTicker(stock.ticker);
  stock.marketCapTier = getMarketCapTier(stock.ticker);
}

// Ensure every single universe has active stocks!
// Let's check representation across all 15 universes
console.log('Universe coverage before enrichment:');
for (const u of UNIVERSES) {
  const count = seed.stocks.filter(s => s.universes?.includes(u.id)).length;
  const passed = seed.stocks.filter(s => s.universes?.includes(u.id) && s.passed).length;
  console.log(`- ${u.name}: ${count} stocks (${passed} passed)`);
}

// Save back enriched seed
fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf-8');
console.log('Updated seed-momentum.json with universes metadata successfully.');
