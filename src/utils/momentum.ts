import { StockAnalysis, UniverseId, ScreenerFilterConfig } from '../types';

export function calculateRanks(arr: any[], key: string, weight: number = 1): number[] {
  const items = arr.map((item, idx) => ({ val: item[key], idx }));
  items.sort((a, b) => b.val - a.val); // descending

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

/**
 * Filter stocks by universe, re-evaluate criteria if config provided,
 * and calculate localized 6M, 3M, 1M ranks, Final Rank, and Positions.
 */
export function rankUniverseStocks(
  allStocks: StockAnalysis[],
  universeId: UniverseId,
  config?: ScreenerFilterConfig
): {
  filteredStocks: StockAnalysis[];
  totalInUniverse: number;
  passedCount: number;
  top15Count: number;
  next15Count: number;
} {
  // 1. Filter to stocks belonging to this universe
  const universeMembers = allStocks.filter((s) => {
    if (!s.universes || s.universes.length === 0) return true;
    return s.universes.includes(universeId);
  });

  const w6M = config?.weight6M ?? 1.0;
  const w3M = config?.weight3M ?? 1.0;
  const w1M = config?.weight1M ?? 1.0;

  // 2. Separate into passed and failed
  const passedGroup: StockAnalysis[] = [];
  const failedGroup: StockAnalysis[] = [];

  for (const item of universeMembers) {
    // Clone
    const s: StockAnalysis = { ...item };

    // If custom config provided, recalculate pass flags
    if (config) {
      s.passEMA = s.price >= s.ema100;
      s.pass1Y = s.return1Y >= config.min1YReturn;
      s.pass52W = s.distFrom52WHigh >= -config.maxDistFrom52WHigh;
      s.passUpDays = s.upDaysPct > config.minUpDaysPct;
      s.passed = s.passEMA && s.pass1Y && s.pass52W && s.passUpDays;
    }

    if (s.passed) {
      passedGroup.push(s);
    } else {
      s.rank6M = null;
      s.rank3M = null;
      s.rank1M = null;
      s.finalRank = null;
      s.position = null;
      s.tier = 'unfiltered';
      failedGroup.push(s);
    }
  }

  // 3. Rank passed group
  if (passedGroup.length > 0) {
    const ranks6M = calculateRanks(passedGroup, 'return6M', w6M);
    const ranks3M = calculateRanks(passedGroup, 'return3M', w3M);
    const ranks1M = calculateRanks(passedGroup, 'return1M', w1M);

    for (let i = 0; i < passedGroup.length; i++) {
      passedGroup[i].rank6M = ranks6M[i];
      passedGroup[i].rank3M = ranks3M[i];
      passedGroup[i].rank1M = ranks1M[i];
      passedGroup[i].finalRank =
        Math.round((ranks6M[i] + ranks3M[i] + ranks1M[i]) * 10) / 10;
    }

    // Sort by finalRank ascending
    passedGroup.sort((a, b) => (a.finalRank || 0) - (b.finalRank || 0));

    // Assign positions and tiers
    for (let i = 0; i < passedGroup.length; i++) {
      const pos = i + 1;
      passedGroup[i].position = pos;
      if (pos <= 15) {
        passedGroup[i].tier = 'top15';
      } else if (pos <= 30) {
        passedGroup[i].tier = 'next15';
      } else {
        passedGroup[i].tier = 'other_passed';
      }
    }
  }

  const top15Count = Math.min(15, passedGroup.length);
  const next15Count = Math.max(0, Math.min(15, passedGroup.length - 15));

  return {
    filteredStocks: [...passedGroup, ...failedGroup],
    totalInUniverse: universeMembers.length,
    passedCount: passedGroup.length,
    top15Count,
    next15Count,
  };
}
