import React, { useRef } from 'react';
import { StockAnalysis } from '../types';
import { Download, Copy, Check, FileText } from 'lucide-react';

interface MatplotlibViewProps {
  stocks: StockAnalysis[];
  onSelectStock: (stock: StockAnalysis) => void;
  universeName?: string;
}

export const MatplotlibView: React.FC<MatplotlibViewProps> = ({
  stocks,
  onSelectStock,
  universeName = 'All Markets',
}) => {
  const [copied, setCopied] = React.useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Take top 30-40 passed stocks, as the Colab notebook did:
  // df_summary_sorted = df_summary.sort_values('Final_Rank').head(40)
  const sorted = stocks.filter((s) => s.passed && s.position !== null).slice(0, 40);

  const handleCopyTSV = () => {
    const headers = ['Ticker', 'Return_6M', 'Rank_6M', 'Return_3M', 'Rank_3M', 'Return_1M', 'Rank_1M', 'Final_Rank', 'Position'];
    const rows = sorted.map((s) => [
      s.ticker,
      s.return6M,
      s.rank6M,
      s.return3M,
      s.rank3M,
      s.return1M,
      s.rank1M,
      s.finalRank,
      s.position
    ]);
    const text = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-sm">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-900 font-mono">
              Top Stocks Momentum Ranking ({universeName})
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Rendered with exact cell centering, red line separation for Top 15, and pandas rank sums.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyTSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors border border-slate-300"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Table TSV'}</span>
          </button>
        </div>
      </div>

      {/* Matplotlib Clean Centered Table Canvas */}
      <div ref={tableRef} className="overflow-x-auto border-2 border-slate-800 rounded-sm bg-white p-2">
        <table className="w-full text-center border-collapse font-mono text-[13px]">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold border-b-2 border-slate-800">
              <th className="py-2.5 px-3 border border-slate-400">Ticker</th>
              <th className="py-2.5 px-3 border border-slate-400">Return_6M</th>
              <th className="py-2.5 px-3 border border-slate-400">Rank_6M</th>
              <th className="py-2.5 px-3 border border-slate-400">Return_3M</th>
              <th className="py-2.5 px-3 border border-slate-400">Rank_3M</th>
              <th className="py-2.5 px-3 border border-slate-400">Return_1M</th>
              <th className="py-2.5 px-3 border border-slate-400">Rank_1M</th>
              <th className="py-2.5 px-3 border border-slate-400 bg-slate-300">Final_Rank</th>
              <th className="py-2.5 px-3 border border-slate-400 font-extrabold">Position</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((stock, idx) => {
              // Exact Colab notebook line:
              // for i in range(len(col_labels)): cell = table[(15, i)]; cell.set_edgecolor('red'); cell.set_linewidth(3)
              // (Note: in Python notebook index 15 is row 15, the boundary)
              const isBoundaryRow = stock.position === 15;

              return (
                <tr
                  key={stock.ticker}
                  onClick={() => onSelectStock(stock)}
                  className={`hover:bg-slate-100 cursor-pointer transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  } ${isBoundaryRow ? 'border-b-[3.5px] border-b-red-600' : 'border-b border-slate-300'}`}
                >
                  <td className="py-2 px-3 border border-slate-300 font-bold text-slate-900">
                    {stock.ticker}
                  </td>
                  <td className="py-2 px-3 border border-slate-300">
                    {stock.return6M.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 border border-slate-300">
                    {stock.rank6M}
                  </td>
                  <td className="py-2 px-3 border border-slate-300">
                    {stock.return3M.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 border border-slate-300">
                    {stock.rank3M}
                  </td>
                  <td className="py-2 px-3 border border-slate-300">
                    {stock.return1M.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 border border-slate-300">
                    {stock.rank1M}
                  </td>
                  <td className="py-2 px-3 border border-slate-300 font-bold bg-slate-100/70">
                    {stock.finalRank}
                  </td>
                  <td className="py-2 px-3 border border-slate-300 font-bold text-slate-900">
                    {stock.position}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono px-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-1 bg-red-600 inline-block"></span>
            <span>Red boundary marks Top 15 Elite separation from Next 15 Contenders</span>
          </div>
          <span>Total Qualified: {sorted.length}</span>
        </div>
      </div>
    </div>
  );
};
