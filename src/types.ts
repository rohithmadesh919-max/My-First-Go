export type UniverseId =
  | 'nifty-50'
  | 'nifty-next-50'
  | 'nifty-100'
  | 'nifty-200'
  | 'nifty-500'
  | 'nifty-midcap-50'
  | 'nifty-midcap-100'
  | 'nifty-midcap-150'
  | 'nifty-smallcap-50'
  | 'nifty-smallcap-100'
  | 'nifty-smallcap-250'
  | 'nifty-midsmallcap-400'
  | 'nifty-largemidcap-250'
  | 'nifty-microcap-250'
  | 'nifty-total-market';

export interface UniverseDef {
  id: UniverseId;
  name: string;
  shortName: string;
  category: 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Micro Cap' | 'Broad Market';
  description: string;
  stockCount: number;
  badgeColor: string;
}

export interface StockAnalysis {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  ema100: number;
  return1Y: number;
  high52W: number;
  distFrom52WHigh: number;
  upDaysPct: number;
  passEMA: boolean;
  pass1Y: boolean;
  pass52W: boolean;
  passUpDays: boolean;
  passed: boolean;
  return6M: number;
  return3M: number;
  return1M: number;
  rank6M: number | null;
  rank3M: number | null;
  rank1M: number | null;
  finalRank: number | null;
  position: number | null;
  tier: 'top15' | 'next15' | 'other_passed' | 'unfiltered';
  sparkline?: number[];
  universes: UniverseId[];
  marketCapTier: 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Micro Cap';
}

export interface ScreenerFilterConfig {
  emaSpan: number;
  min1YReturn: number;
  maxDistFrom52WHigh: number;
  minUpDaysPct: number;
  weight6M: number;
  weight3M: number;
  weight1M: number;
}

export interface ScreenerPayload {
  generatedAt: string;
  totalAnalyzed: number;
  passedCount: number;
  top15Count: number;
  next15Count: number;
  activeUniverse?: UniverseId;
  stocks: StockAnalysis[];
}

export interface TickerHistoryPoint {
  date: string;
  timestamp: number;
  close: number;
  ema: number;
  high52W: number;
}
