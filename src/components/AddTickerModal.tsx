import React, { useState } from 'react';
import { X, Search, CheckCircle2, XCircle, Plus, Loader2 } from 'lucide-react';
import { StockAnalysis } from '../types';

interface AddTickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStock: (stock: StockAnalysis) => void;
}

export const AddTickerModal: React.FC<AddTickerModalProps> = ({ isOpen, onClose, onAddStock }) => {
  const [tickerInput, setTickerInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StockAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tickerInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const symbol = tickerInput.trim().toUpperCase().endsWith('.NS')
      ? tickerInput.trim().toUpperCase()
      : `${tickerInput.trim().toUpperCase()}.NS`;

    try {
      const res = await fetch(`/api/analyze-ticker?ticker=${encodeURIComponent(symbol)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch quote data from Yahoo Finance');
      }
      setResult(data.data);
    } catch (err: any) {
      setError(err.message || 'Error evaluating ticker');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (result) {
      onAddStock(result);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add & Evaluate NSE Ticker</h2>
            <p className="text-xs text-slate-500">Run the 4 momentum filters on any Indian equity</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. SUZLON, TRENT, KPITTECH, IRCTC"
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value)}
              className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !tickerInput.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:bg-slate-300"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Evaluate</span>
            </button>
          </form>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-mono text-slate-900">{result.ticker}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${result.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {result.passed ? 'PASSED CRITERIA' : 'FAILED FILTER'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">{result.name}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-base font-bold text-slate-900">₹{result.price}</div>
                  <div className="text-[11px] text-slate-500">EMA100: ₹{result.ema100}</div>
                </div>
              </div>

              {/* Checks */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2 rounded-lg border flex items-center justify-between ${result.passEMA ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                  <span>Price ≥ EMA100</span>
                  {result.passEMA ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                </div>
                <div className={`p-2 rounded-lg border flex items-center justify-between ${result.pass1Y ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                  <span>1Y Ret: {result.return1Y}% (≥ 6.5%)</span>
                  {result.pass1Y ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                </div>
                <div className={`p-2 rounded-lg border flex items-center justify-between ${result.pass52W ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                  <span>Within 20% of 52W</span>
                  {result.pass52W ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                </div>
                <div className={`p-2 rounded-lg border flex items-center justify-between ${result.passUpDays ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                  <span>Up Days: {result.upDaysPct}% (&gt; 45%)</span>
                  {result.passUpDays ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                </div>
              </div>

              {/* Multi-timeframe Returns */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-mono">
                <div>6M: <span className="font-bold text-slate-800">{result.return6M}%</span></div>
                <div>3M: <span className="font-bold text-slate-800">{result.return3M}%</span></div>
                <div>1M: <span className="font-bold text-slate-800">{result.return1M}%</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          {result && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Universe & Rescan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
