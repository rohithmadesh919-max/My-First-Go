import React from 'react';
import { StockAnalysis } from '../types';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface FailedStocksTableProps {
  stocks: StockAnalysis[];
  onSelectStock: (stock: StockAnalysis) => void;
}

export const FailedStocksTable: React.FC<FailedStocksTableProps> = ({ stocks, onSelectStock }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Screening Criteria Audit (Filtered Out Stocks)
          </span>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {stocks.length} equities failed 1 or more criteria
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-2.5 px-4">Ticker & Security</th>
              <th className="py-2.5 px-3 text-right">Price</th>
              <th className="py-2.5 px-3 text-center">EMA100 Hurdle</th>
              <th className="py-2.5 px-3 text-center">1Y Return (≥6.5%)</th>
              <th className="py-2.5 px-3 text-center">52W High (Within 20%)</th>
              <th className="py-2.5 px-3 text-center">Up Days (&gt;45%)</th>
              <th className="py-2.5 px-3 text-right">Failure Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stocks.map((stock) => {
              const failures: string[] = [];
              if (!stock.passEMA) failures.push('Below EMA100');
              if (!stock.pass1Y) failures.push('1Y Ret < 6.5%');
              if (!stock.pass52W) failures.push('>20% off 52W High');
              if (!stock.passUpDays) failures.push('Up Days ≤ 45%');

              return (
                <tr
                  key={stock.ticker}
                  onClick={() => onSelectStock(stock)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-4">
                    <span className="font-bold font-mono text-slate-900">{stock.ticker}</span>
                    <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
                      {stock.name} • {stock.sector}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    ₹{stock.price}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1 font-mono text-[11px]">
                      {stock.passEMA ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>₹{stock.ema100}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1 font-mono text-[11px]">
                      {stock.pass1Y ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>{stock.return1Y >= 0 ? `+${stock.return1Y}%` : `${stock.return1Y}%`}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1 font-mono text-[11px]">
                      {stock.pass52W ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>{stock.distFrom52WHigh}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1 font-mono text-[11px]">
                      {stock.passUpDays ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>{stock.upDaysPct}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      {failures[0] || 'Disqualified'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
