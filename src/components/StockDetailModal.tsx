import React, { useEffect, useState } from 'react';
import { StockAnalysis } from '../types';
import { X, ExternalLink, CheckCircle2, XCircle, TrendingUp, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

interface StockDetailModalProps {
  stock: StockAnalysis | null;
  onClose: () => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stock) return;
    setLoading(true);
    setError(null);

    fetch(`/api/chart/${encodeURIComponent(stock.ticker)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Chart data unavailable');
        return res.json();
      })
      .then((res) => {
        if (res.success && res.series) {
          setChartData(res.series);
        } else {
          setError('Unable to load chart data');
        }
      })
      .catch((err) => {
        setError(err.message || 'Error fetching chart');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [stock?.ticker]);

  if (!stock) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold font-mono text-sm">
              {stock.ticker.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 font-mono">
                  {stock.ticker}
                </h2>
                {stock.position && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Rank #{stock.position}
                  </span>
                )}
                {stock.tier === 'top15' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Elite Tier
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{stock.name} • {stock.sector}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://in.tradingview.com/chart/?symbol=NSE%3A${stock.ticker.replace('.NS', '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <span>TradingView</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Latest Close</span>
              <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                ₹{stock.price.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                EMA100: <span className="font-mono text-slate-700">₹{stock.ema100}</span>
              </div>
            </div>

            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <span className="text-[11px] text-emerald-800 uppercase font-semibold">6M Return</span>
              <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                {stock.return6M >= 0 ? `+${stock.return6M}%` : `${stock.return6M}%`}
              </div>
              <div className="text-[11px] text-emerald-800/80 mt-0.5">
                Rank: #{stock.rank6M || '-'}
              </div>
            </div>

            <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-100">
              <span className="text-[11px] text-teal-800 uppercase font-semibold">3M Return</span>
              <div className="text-lg font-bold font-mono text-teal-700 mt-0.5">
                {stock.return3M >= 0 ? `+${stock.return3M}%` : `${stock.return3M}%`}
              </div>
              <div className="text-[11px] text-teal-800/80 mt-0.5">
                Rank: #{stock.rank3M || '-'}
              </div>
            </div>

            <div className="bg-cyan-50/50 p-3 rounded-xl border border-cyan-100">
              <span className="text-[11px] text-cyan-800 uppercase font-semibold">1M Return</span>
              <div className="text-lg font-bold font-mono text-cyan-700 mt-0.5">
                {stock.return1M >= 0 ? `+${stock.return1M}%` : `${stock.return1M}%`}
              </div>
              <div className="text-[11px] text-cyan-800/80 mt-0.5">
                Rank: #{stock.rank1M || '-'}
              </div>
            </div>
          </div>

          {/* Screening Audit Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Colab Quantitative Screening Rules Audit</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Check 1 */}
              <div className={`p-3 rounded-lg border ${stock.passEMA ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">1. Trend Filter</span>
                  {stock.passEMA ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-mono">Price ≥ EMA100</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  ₹{stock.price} vs ₹{stock.ema100}
                </div>
              </div>

              {/* Check 2 */}
              <div className={`p-3 rounded-lg border ${stock.pass1Y ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">2. 1-Year Return</span>
                  {stock.pass1Y ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-mono">Return ≥ +6.5%</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  Actual: {stock.return1Y >= 0 ? `+${stock.return1Y}%` : `${stock.return1Y}%`}
                </div>
              </div>

              {/* Check 3 */}
              <div className={`p-3 rounded-lg border ${stock.pass52W ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">3. 52-Week High</span>
                  {stock.pass52W ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-mono">Within 20% of High</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  {stock.distFrom52WHigh}% (52W: ₹{stock.high52W})
                </div>
              </div>

              {/* Check 4 */}
              <div className={`p-3 rounded-lg border ${stock.passUpDays ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">4. Consistency</span>
                  {stock.passUpDays ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-mono">Up Days (6M) &gt; 45%</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  Actual: {stock.upDaysPct}% up days
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Price Action vs. EMA100 & 52W High</h3>
                <p className="text-xs text-slate-500">1-year daily history with quantitative benchmark overlays</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-emerald-600"></span> Price
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-blue-600"></span> EMA 100
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-amber-500 stroke-dashed"></span> 52W High
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Loading historical quotes...
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center text-xs text-rose-500">
                  {error}
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickFormatter={(val) => val.slice(5)}
                      minTickGap={25}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      orientation="right"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '12px',
                        border: 'none'
                      }}
                      formatter={(value: any, name: string) => [
                        `₹${Number(value).toFixed(2)}`,
                        name === 'close' ? 'Price' : name === 'ema100' ? 'EMA100' : '52W High'
                      ]}
                    />
                    <ReferenceLine
                      y={stock.high52W}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{ value: '52W High', position: 'top', fill: '#d97706', fontSize: 10 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="ema100"
                      stroke="#2563eb"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No chart data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            Final Composite Rank: <span className="font-bold text-slate-900">{stock.finalRank || 'N/A'}</span> (Rank 6M + 3M + 1M)
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
