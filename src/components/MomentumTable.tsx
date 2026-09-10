import React from 'react';
import { StockAnalysis } from '../types';
import { CheckCircle2, XCircle, TrendingUp, ChevronRight, BarChart2 } from 'lucide-react';

interface MomentumTableProps {
  stocks: StockAnalysis[];
  onSelectStock: (stock: StockAnalysis) => void;
  showDividingLine?: boolean;
}

export const MomentumTable: React.FC<MomentumTableProps> = ({
  stocks,
  onSelectStock,
  showDividingLine = true,
}) => {
  if (stocks.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800">No stocks match the selected filter</h3>
        <p className="text-xs text-slate-500 mt-1">Try broadening your search or adjusting the screening parameters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-3 w-14 text-center font-mono">Pos</th>
              <th className="py-3 px-4">Ticker & Security</th>
              <th className="py-3 px-3 text-right">Price (₹)</th>
              <th className="py-3 px-3 text-right bg-emerald-50/30">6M Return</th>
              <th className="py-3 px-3 text-center bg-emerald-50/30 font-mono">Rank 6M</th>
              <th className="py-3 px-3 text-right bg-teal-50/30">3M Return</th>
              <th className="py-3 px-3 text-center bg-teal-50/30 font-mono">Rank 3M</th>
              <th className="py-3 px-3 text-right bg-cyan-50/30">1M Return</th>
              <th className="py-3 px-3 text-center bg-cyan-50/30 font-mono">Rank 1M</th>
              <th className="py-3 px-4 text-center font-mono bg-slate-100/70 font-bold text-slate-800">
                Final Rank
              </th>
              <th className="py-3 px-3 text-center">Screen Checks</th>
              <th className="py-3 px-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {stocks.map((stock, index) => {
              const isTop15Cutoff = showDividingLine && stock.position === 15;
              const isTop1 = stock.position === 1;
              const isTop3 = stock.position && stock.position <= 3;
              const isElite = stock.position && stock.position <= 15;

              return (
                <React.Fragment key={stock.ticker}>
                  <tr
                    id={`stock-row-${stock.ticker.replace(/[^a-zA-Z0-9]/g, '')}`}
                    onClick={() => onSelectStock(stock)}
                    className={`group hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      isElite ? 'bg-white' : 'bg-slate-50/20'
                    }`}
                  >
                    {/* Position */}
                    <td className="py-3 px-3 text-center">
                      {stock.position ? (
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono text-xs font-bold ${
                            isTop1
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isTop3
                              ? 'bg-slate-200 text-slate-800'
                              : isElite
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold'
                              : 'text-slate-600'
                          }`}
                        >
                          {stock.position}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>

                    {/* Ticker & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {/* Sparkline */}
                        {stock.sparkline && stock.sparkline.length > 5 && (
                          <div className="w-12 h-6 flex-shrink-0 hidden sm:block">
                            <SparklineSVG data={stock.sparkline} isPositive={stock.return6M >= 0} />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 font-mono group-hover:text-emerald-700 transition-colors">
                              {stock.ticker.replace('.NS', '')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">.NS</span>
                            {stock.marketCapTier && (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-medium ${
                                  stock.marketCapTier === 'Large Cap'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : stock.marketCapTier === 'Mid Cap'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : stock.marketCapTier === 'Small Cap'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-teal-50 text-teal-700 border border-teal-200'
                                }`}
                              >
                                {stock.marketCapTier}
                              </span>
                            )}
                            {isElite && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                Elite
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px] sm:max-w-[220px]">
                            {stock.name} • <span className="text-slate-400">{stock.sector}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price & 52W proximity */}
                    <td className="py-3 px-3 text-right font-mono">
                      <div className="font-semibold text-slate-900">₹{stock.price.toLocaleString('en-IN')}</div>
                      <div
                        className={`text-[10px] ${
                          stock.distFrom52WHigh >= -5
                            ? 'text-emerald-600 font-medium'
                            : stock.distFrom52WHigh >= -15
                            ? 'text-slate-500'
                            : 'text-amber-600'
                        }`}
                        title="Distance from 52-Week High"
                      >
                        {stock.distFrom52WHigh >= 0 ? 'At 52W High' : `${stock.distFrom52WHigh}% 52W`}
                      </div>
                    </td>

                    {/* 6M Return */}
                    <td className="py-3 px-3 text-right bg-emerald-50/20 font-mono">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded font-bold text-[11px] ${
                          stock.return6M >= 50
                            ? 'bg-emerald-100 text-emerald-800'
                            : stock.return6M >= 20
                            ? 'bg-emerald-50 text-emerald-700'
                            : stock.return6M >= 0
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {stock.return6M >= 0 ? `+${stock.return6M}%` : `${stock.return6M}%`}
                      </span>
                    </td>

                    {/* Rank 6M */}
                    <td className="py-3 px-3 text-center bg-emerald-50/20 font-mono font-medium text-slate-700">
                      {stock.rank6M !== null ? `#${stock.rank6M}` : '-'}
                    </td>

                    {/* 3M Return */}
                    <td className="py-3 px-3 text-right bg-teal-50/20 font-mono">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded font-bold text-[11px] ${
                          stock.return3M >= 30
                            ? 'bg-teal-100 text-teal-800'
                            : stock.return3M >= 10
                            ? 'bg-teal-50 text-teal-700'
                            : stock.return3M >= 0
                            ? 'text-teal-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {stock.return3M >= 0 ? `+${stock.return3M}%` : `${stock.return3M}%`}
                      </span>
                    </td>

                    {/* Rank 3M */}
                    <td className="py-3 px-3 text-center bg-teal-50/20 font-mono font-medium text-slate-700">
                      {stock.rank3M !== null ? `#${stock.rank3M}` : '-'}
                    </td>

                    {/* 1M Return */}
                    <td className="py-3 px-3 text-right bg-cyan-50/20 font-mono">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded font-bold text-[11px] ${
                          stock.return1M >= 10
                            ? 'bg-cyan-100 text-cyan-800'
                            : stock.return1M >= 3
                            ? 'bg-cyan-50 text-cyan-700'
                            : stock.return1M >= 0
                            ? 'text-cyan-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {stock.return1M >= 0 ? `+${stock.return1M}%` : `${stock.return1M}%`}
                      </span>
                    </td>

                    {/* Rank 1M */}
                    <td className="py-3 px-3 text-center bg-cyan-50/20 font-mono font-medium text-slate-700">
                      {stock.rank1M !== null ? `#${stock.rank1M}` : '-'}
                    </td>

                    {/* Final Rank */}
                    <td className="py-3 px-4 text-center bg-slate-100/50 font-mono">
                      {stock.finalRank !== null ? (
                        <div className="inline-flex items-baseline gap-1">
                          <span className="font-extrabold text-sm text-slate-900">{stock.finalRank}</span>
                          <span className="text-[10px] text-slate-400">pts</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Screen Checks */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1" title="EMA100 | 1Y >= 6.5% | 52W Proximity | Up-Days > 45%">
                        <CheckBadge passed={stock.passEMA} label="EMA100" />
                        <CheckBadge passed={stock.pass1Y} label="1Y Ret" />
                        <CheckBadge passed={stock.pass52W} label="52W High" />
                        <CheckBadge passed={stock.passUpDays} label="Up Days" />
                      </div>
                    </td>

                    {/* Detail Arrow */}
                    <td className="py-3 px-3 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </td>
                  </tr>

                  {/* Red Dividing Line separating Top 15 and Next 15 (Faithful to Colab Matplotlib script) */}
                  {isTop15Cutoff && (
                    <tr className="bg-rose-600 text-white font-semibold">
                      <td colSpan={12} className="py-2 px-4 text-center text-xs tracking-wider shadow-inner">
                        <div className="flex items-center justify-center gap-3">
                          <span className="h-0.5 w-16 sm:w-32 bg-rose-300/80"></span>
                          <span className="font-bold flex items-center gap-1.5 uppercase tracking-widest text-[11px]">
                            ★ TOP 15 ELITE MOMENTUM CUTOFF • NEXT 15 CONTENDERS BELOW ★
                          </span>
                          <span className="h-0.5 w-16 sm:w-32 bg-rose-300/80"></span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// CheckBadge Helper
const CheckBadge: React.FC<{ passed: boolean; label: string }> = ({ passed, label }) => {
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
        passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
      }`}
      title={`${label}: ${passed ? 'PASSED' : 'FAILED'}`}
    >
      {passed ? '✓' : '✕'}
    </span>
  );
};

// Sparkline SVG renderer
const SparklineSVG: React.FC<{ data: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 48;
  const height = 24;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor = isPositive ? '#10b981' : '#f43f5e';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
