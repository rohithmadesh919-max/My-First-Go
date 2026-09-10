import React, { useState, useEffect, useMemo } from 'react';
import initialSeedData from './data/seed-momentum.json';
import { StockAnalysis, ScreenerFilterConfig, UniverseId } from './types';
import { UNIVERSES, getUniverseById } from './data/universes';
import { rankUniverseStocks } from './utils/momentum';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { UniverseSelector } from './components/UniverseSelector';
import { FilterControls } from './components/FilterControls';
import { MomentumTable } from './components/MomentumTable';
import { MatplotlibView } from './components/MatplotlibView';
import { FailedStocksTable } from './components/FailedStocksTable';
import { StockDetailModal } from './components/StockDetailModal';
import { ColabCodeModal } from './components/ColabCodeModal';
import { AddTickerModal } from './components/AddTickerModal';
import { ScreenerConfigDrawer } from './components/ScreenerConfigDrawer';

export default function App() {
  const [stocks, setStocks] = useState<StockAnalysis[]>(initialSeedData.stocks as StockAnalysis[]);
  const [totalAnalyzed, setTotalAnalyzed] = useState<number>(initialSeedData.totalAnalyzed);
  const [passedCount, setPassedCount] = useState<number>(initialSeedData.passedCount);
  const [lastUpdated, setLastUpdated] = useState<string | null>(initialSeedData.generatedAt);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0);
  const [selectedUniverseId, setSelectedUniverseId] = useState<UniverseId>('nifty-500');

  // View state
  const [viewMode, setViewMode] = useState<'interactive' | 'matplotlib'>('interactive');
  const [activeTab, setActiveTab] = useState<'top15' | 'next15' | 'all-passed' | 'failed'>('all-passed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [sortBy, setSortBy] = useState('finalRank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [selectedStock, setSelectedStock] = useState<StockAnalysis | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAddTickerOpen, setIsAddTickerOpen] = useState(false);

  // Config parameters
  const [config, setConfig] = useState<ScreenerFilterConfig>({
    emaSpan: 100,
    min1YReturn: 6.5,
    maxDistFrom52WHigh: 20.0,
    minUpDaysPct: 45.0,
    weight6M: 1.0,
    weight3M: 1.0,
    weight1M: 1.0,
  });

  // Fetch updated data from backend on mount if available
  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setStocks(json.data.stocks);
          setTotalAnalyzed(json.data.totalAnalyzed);
          setPassedCount(json.data.passedCount);
          setLastUpdated(json.data.generatedAt);
        }
      })
      .catch((err) => console.log('Using seeded data:', err));
  }, []);

  // Periodic Auto-refresh during market hours
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const intervalMs = autoRefreshInterval * 60 * 1000;
    const intervalId = setInterval(() => {
      handleLiveRescan();
    }, intervalMs);
    return () => clearInterval(intervalId);
  }, [autoRefreshInterval, config]);

  // Trigger live rescan across NSE universe
  const handleLiveRescan = async (customConfig?: ScreenerFilterConfig) => {
    setIsScanning(true);
    const activeCfg = customConfig || config;
    try {
      const res = await fetch('/api/rescan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeCfg),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setStocks(json.data.stocks);
        setTotalAnalyzed(json.data.totalAnalyzed);
        setPassedCount(json.data.passedCount);
        setLastUpdated(json.data.generatedAt);
      }
    } catch (e) {
      console.error('Error during rescan:', e);
    } finally {
      setIsScanning(false);
    }
  };

  // Add stock to universe
  const handleAddStock = (newStock: StockAnalysis) => {
    setStocks((prev) => {
      const exists = prev.some((s) => s.ticker === newStock.ticker);
      if (exists) {
        return prev.map((s) => (s.ticker === newStock.ticker ? newStock : s));
      }
      return [newStock, ...prev];
    });
    // Trigger recalculation
    handleLiveRescan();
  };

  // Rank and filter stocks localized to the selected universe
  const universeAnalysis = useMemo(() => {
    return rankUniverseStocks(stocks, selectedUniverseId, config);
  }, [stocks, selectedUniverseId, config]);

  const currentUniverse = useMemo(() => getUniverseById(selectedUniverseId), [selectedUniverseId]);
  const activeStocks = universeAnalysis.filteredStocks;

  // Sector options in active universe
  const sectors = useMemo(() => {
    const set = new Set<string>();
    activeStocks.forEach((s) => {
      if (s.sector) set.add(s.sector);
    });
    return Array.from(set).sort();
  }, [activeStocks]);

  // Counts
  const passedStocks = useMemo(() => activeStocks.filter((s) => s.passed), [activeStocks]);
  const failedStocks = useMemo(() => activeStocks.filter((s) => !s.passed), [activeStocks]);
  const top15Stocks = useMemo(() => passedStocks.filter((s) => s.position && s.position <= 15), [passedStocks]);
  const next15Stocks = useMemo(() => passedStocks.filter((s) => s.position && s.position > 15 && s.position <= 30), [passedStocks]);

  // Filtered and Sorted list for display
  const displayedStocks = useMemo(() => {
    let list = activeTab === 'failed' ? [...failedStocks] : [...passedStocks];

    if (activeTab === 'top15') {
      list = list.filter((s) => s.position && s.position <= 15);
    } else if (activeTab === 'next15') {
      list = list.filter((s) => s.position && s.position > 15 && s.position <= 30);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
    }

    // Sector filter
    if (selectedSector !== 'ALL') {
      list = list.filter((s) => s.sector === selectedSector);
    }

    // Sorting
    list.sort((a, b) => {
      let valA: any = (a as any)[sortBy];
      let valB: any = (b as any)[sortBy];

      if (valA === null || valA === undefined) valA = sortOrder === 'asc' ? Infinity : -Infinity;
      if (valB === null || valB === undefined) valB = sortOrder === 'asc' ? Infinity : -Infinity;

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return list;
  }, [activeStocks, activeTab, searchQuery, selectedSector, sortBy, sortOrder, passedStocks, failedStocks]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Position',
      'Ticker',
      'Company Name',
      'Universe',
      'Market Cap Tier',
      'Sector',
      'Price',
      'Return_6M',
      'Rank_6M',
      'Return_3M',
      'Rank_3M',
      'Return_1M',
      'Rank_1M',
      'Final_Rank',
      'Return_1Y',
      'EMA100',
      'Dist_From_52W_High',
      'Up_Days_Pct',
      'Passed'
    ];

    const rows = activeStocks.map((s) => [
      s.position || '',
      `"${s.ticker}"`,
      `"${s.name}"`,
      `"${currentUniverse.name}"`,
      `"${s.marketCapTier || ''}"`,
      `"${s.sector}"`,
      s.price,
      s.return6M,
      s.rank6M || '',
      s.return3M,
      s.rank3M || '',
      s.return1M,
      s.rank1M || '',
      s.finalRank || '',
      s.return1Y,
      s.ema100,
      s.distFrom52WHigh,
      s.upDaysPct,
      s.passed ? 'YES' : 'NO'
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `NSE_${currentUniverse.name.replace(/[^a-zA-Z0-9]/g, '_')}_Momentum_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* App Header */}
      <Header
        onRefresh={() => handleLiveRescan()}
        isScanning={isScanning}
        onOpenCode={() => setIsCodeModalOpen(true)}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenAddTicker={() => setIsAddTickerOpen(true)}
        onExportCSV={handleExportCSV}
        lastUpdated={lastUpdated}
        viewMode={viewMode}
        setViewMode={setViewMode}
        autoRefreshInterval={autoRefreshInterval}
        setAutoRefreshInterval={setAutoRefreshInterval}
        activeUniverseName={currentUniverse.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Universe Selector (Nifty 50, Next 50, 100, 200, 500, Midcaps, Smallcaps, Microcaps, Total Market) */}
        <UniverseSelector
          selectedUniverseId={selectedUniverseId}
          onSelectUniverse={setSelectedUniverseId}
          universeStockCount={universeAnalysis.totalInUniverse}
          universePassedCount={universeAnalysis.passedCount}
        />

        {/* KPI Overview Cards for the Active Universe */}
        <StatsCards
          stocks={activeStocks}
          totalAnalyzed={universeAnalysis.totalInUniverse}
          passedCount={universeAnalysis.passedCount}
          universeName={currentUniverse.name}
        />

        {/* View Switcher: Interactive Dashboard vs Classic Colab/Matplotlib Table */}
        {viewMode === 'matplotlib' ? (
          <MatplotlibView
            stocks={activeStocks}
            onSelectStock={(stock) => setSelectedStock(stock)}
            universeName={currentUniverse.name}
          />
        ) : (
          <>
            {/* Filter, Search & Tab Controls */}
            <FilterControls
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedSector={selectedSector}
              setSelectedSector={setSelectedSector}
              sectors={sectors}
              passedCount={passedStocks.length}
              failedCount={failedStocks.length}
              top15Count={top15Stocks.length}
              next15Count={next15Stocks.length}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />

            {/* Content Table based on Active Tab */}
            {activeTab === 'failed' ? (
              <FailedStocksTable
                stocks={displayedStocks}
                onSelectStock={(stock) => setSelectedStock(stock)}
              />
            ) : (
              <MomentumTable
                stocks={displayedStocks}
                onSelectStock={(stock) => setSelectedStock(stock)}
                showDividingLine={activeTab === 'all-passed'}
              />
            )}
          </>
        )}
      </main>

      {/* Modals and Drawers */}
      <StockDetailModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
      />

      <ColabCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      <AddTickerModal
        isOpen={isAddTickerOpen}
        onClose={() => setIsAddTickerOpen(false)}
        onAddStock={handleAddStock}
      />

      <ScreenerConfigDrawer
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onApplyConfig={(newCfg) => {
          setConfig(newCfg);
          handleLiveRescan(newCfg);
        }}
      />
    </div>
  );
}
