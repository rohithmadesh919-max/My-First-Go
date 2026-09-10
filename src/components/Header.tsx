import React from 'react';
import { RefreshCw, Code2, SlidersHorizontal, Plus, Download, TrendingUp, Sparkles } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isScanning: boolean;
  onOpenCode: () => void;
  onOpenConfig: () => void;
  onOpenAddTicker: () => void;
  onExportCSV: () => void;
  lastUpdated: string | null;
  viewMode: 'interactive' | 'matplotlib';
  setViewMode: (mode: 'interactive' | 'matplotlib') => void;
  autoRefreshInterval: number; // 0 for off, minutes
  setAutoRefreshInterval: (interval: number) => void;
  activeUniverseName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isScanning,
  onOpenCode,
  onOpenConfig,
  onOpenAddTicker,
  onExportCSV,
  lastUpdated,
  viewMode,
  setViewMode,
  autoRefreshInterval,
  setAutoRefreshInterval,
  activeUniverseName = 'Nifty Total Market',
}) => {
  const [istTime, setIstTime] = React.useState('');
  const [isMarketOpen, setIsMarketOpen] = React.useState(false);

  React.useEffect(() => {
    const updateMarketStatus = () => {
      const now = new Date();
      // IST is UTC + 5 hours 30 minutes
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const istDate = new Date(utc + 3600000 * 5.5);

      const day = istDate.getDay(); // 0 = Sun, 6 = Sat
      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      const timeInMins = hours * 60 + minutes;

      // NSE trading hours: Mon-Fri 09:15 to 15:30 IST
      const isWeekday = day >= 1 && day <= 5;
      const isOpen = isWeekday && timeInMins >= 9 * 60 + 15 && timeInMins <= 15 * 60 + 30;

      setIsMarketOpen(isOpen);
      setIstTime(
        istDate.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };

    updateMarketStatus();
    const timer = setInterval(updateMarketStatus, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: 'numeric',
        month: 'short',
      })
    : 'Loaded';

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display">
                  NSE Momentum Screener & Ranking
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {activeUniverseName}
                </span>
                {/* Live Market Status Badge */}
                <div
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isMarketOpen
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                  title="NSE Trading Hours: Monday-Friday 09:15 AM to 03:30 PM IST"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isMarketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  ></span>
                  <span>{isMarketOpen ? 'NSE LIVE' : 'NSE CLOSED'}</span>
                  <span className="text-[10px] opacity-75 font-mono">({istTime} IST)</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>Multi-timeframe returns (6M + 3M + 1M) • EMA100 Trend • 52W Proximity</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-mono">Data: {formattedTime}</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Auto Refresh selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <span className="px-2 text-slate-500 font-medium hidden sm:inline">Auto:</span>
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-slate-700 font-medium px-1.5 py-1 focus:outline-none cursor-pointer text-xs"
                title="Automatically refresh market quotes"
              >
                <option value={0}>Manual</option>
                <option value={5}>Every 5m</option>
                <option value={15}>Every 15m</option>
              </select>
            </div>

            {/* View switcher */}
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200 text-xs font-medium">
              <button
                id="view-interactive-btn"
                onClick={() => setViewMode('interactive')}
                className={`px-2.5 py-1.5 rounded-md transition-colors ${
                  viewMode === 'interactive'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dashboard
              </button>
              <button
                id="view-matplotlib-btn"
                onClick={() => setViewMode('matplotlib')}
                className={`px-2.5 py-1.5 rounded-md transition-colors ${
                  viewMode === 'matplotlib'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Colab Table
              </button>
            </div>

            {/* Customizer */}
            <button
              id="screener-config-btn"
              onClick={onOpenConfig}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
              title="Tune EMA span, return filters, and ranking weights"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Criteria</span>
            </button>

            {/* Add Custom Ticker */}
            <button
              id="add-ticker-btn"
              onClick={onOpenAddTicker}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
              title="Test any NSE/BSE stock against the momentum model"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Add Ticker</span>
            </button>

            {/* Colab Notebook Code */}
            <button
              id="view-colab-code-btn"
              onClick={onOpenCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              title="View & copy original Google Colab Python script"
            >
              <Code2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Python / Colab</span>
            </button>

            {/* Export CSV */}
            <button
              id="export-csv-btn"
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
              title="Download CSV table"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>

            {/* Rescan Button */}
            <button
              id="refresh-scan-btn"
              onClick={onRefresh}
              disabled={isScanning}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors shadow-xs ${
                isScanning
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning NSE...' : 'Live Scan'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
