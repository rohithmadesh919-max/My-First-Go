import React from 'react';
import { StockAnalysis } from '../types';
import { Award, Target, Flame, Activity } from 'lucide-react';

interface StatsCardsProps {
  stocks: StockAnalysis[];
  totalAnalyzed: number;
  passedCount: number;
  universeName?: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stocks,
  totalAnalyzed,
  passedCount,
  universeName = 'Selected Universe',
}) => {
  const passedStocks = stocks.filter((s) => s.passed);
  const top15 = passedStocks.slice(0, 15);

  const avg6MTop15 = top15.length > 0
    ? (top15.reduce((sum, s) => sum + s.return6M, 0) / top15.length).toFixed(1)
    : '0';

  const avg3MTop15 = top15.length > 0
    ? (top15.reduce((sum, s) => sum + s.return3M, 0) / top15.length).toFixed(1)
    : '0';

  // Sector breakdown among Top 15
  const sectorCounts: Record<string, number> = {};
  top15.forEach((s) => {
    sectorCounts[s.sector] = (sectorCounts[s.sector] || 0) + 1;
  });
  const topSector = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1])[0];

  const passRate = totalAnalyzed > 0 ? ((passedCount / totalAnalyzed) * 100).toFixed(1) : '0';

  // Number #1 rank pick
  const leader = top15[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Momentum Leader */}
      <div id="stat-leader-card" className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">#1 Momentum Leader</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          {leader ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-900 font-mono">{leader.ticker.replace('.NS', '')}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                  +{leader.return6M}% (6M)
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">{leader.name} • {leader.sector}</p>
            </div>
          ) : (
            <span className="text-sm text-slate-400">No qualified stocks</span>
          )}
        </div>
      </div>

      {/* 2. Top 15 Performance */}
      <div id="stat-top15-card" className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top 15 Basket Avg</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">+{avg6MTop15}%</span>
            <span className="text-xs text-slate-500">6M Return</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            3M Avg: <span className="text-emerald-700 font-semibold">+{avg3MTop15}%</span>
          </p>
        </div>
      </div>

      {/* 3. Leading Sector */}
      <div id="stat-sector-card" className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leading Momentum Sector</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-base font-bold text-slate-900 truncate">
            {topSector ? topSector[0] : 'Various'}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {topSector ? `${topSector[1]} stocks in Top 15 basket` : 'Broad-based participation'}
          </p>
        </div>
      </div>

      {/* 4. Screener Pass Rate */}
      <div id="stat-rate-card" className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Screener Pass Rate</span>
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{passRate}%</span>
            <span className="text-xs text-slate-500">({passedCount} / {totalAnalyzed})</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cleared all 4 quantitative hurdles
          </p>
        </div>
      </div>
    </div>
  );
};
