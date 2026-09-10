import React from 'react';
import { Search, Filter, ShieldCheck, AlertCircle, ArrowUpDown } from 'lucide-react';

interface FilterControlsProps {
  activeTab: 'all-passed' | 'top15' | 'next15' | 'failed';
  setActiveTab: (tab: 'all-passed' | 'top15' | 'next15' | 'failed') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  sectors: string[];
  passedCount: number;
  failedCount: number;
  top15Count: number;
  next15Count: number;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedSector,
  setSelectedSector,
  sectors,
  passedCount,
  failedCount,
  top15Count,
  next15Count,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs mb-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Tier Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b lg:border-b-0 pb-2 lg:pb-0 border-slate-100">
          <button
            id="tab-top15"
            onClick={() => setActiveTab('top15')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'top15'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
            <span>Top 15 Elite</span>
            <span className="px-1.5 py-0.2 bg-white rounded-md text-[10px] text-rose-800 border border-rose-200">
              {top15Count}
            </span>
          </button>

          <button
            id="tab-next15"
            onClick={() => setActiveTab('next15')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'next15'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Next 15 Contenders</span>
            <span className="px-1.5 py-0.2 bg-white rounded-md text-[10px] text-blue-800 border border-blue-200">
              {next15Count}
            </span>
          </button>

          <button
            id="tab-all-passed"
            onClick={() => setActiveTab('all-passed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'all-passed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>All Qualified</span>
            <span className="px-1.5 py-0.2 bg-white rounded-md text-[10px] text-emerald-800 border border-emerald-200">
              {passedCount}
            </span>
          </button>

          <button
            id="tab-failed"
            onClick={() => setActiveTab('failed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'failed'
                ? 'bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtered Out</span>
            <span className="px-1.5 py-0.2 bg-white rounded-md text-[10px] text-slate-600 border border-slate-200">
              {failedCount}
            </span>
          </button>
        </div>

        {/* Search, Sector, and Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="stock-search-input"
              type="text"
              placeholder="Search ticker, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Sector Filter */}
          <div className="flex items-center">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1.5 hidden sm:inline" />
            <select
              id="sector-filter-select"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Sectors</option>
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1">
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="finalRank">Sort: Final Rank</option>
              <option value="return6M">Sort: 6M Return</option>
              <option value="return3M">Sort: 3M Return</option>
              <option value="return1M">Sort: 1M Return</option>
              <option value="return1Y">Sort: 1Y Return</option>
              <option value="price">Sort: Price</option>
            </select>
            <button
              id="sort-order-toggle-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-lg"
              title={`Toggle sort order (${sortOrder.toUpperCase()})`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
