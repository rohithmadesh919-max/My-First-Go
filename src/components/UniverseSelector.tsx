import React, { useState } from 'react';
import { UniverseDef, UniverseId } from '../types';
import { UNIVERSES, getUniverseById } from '../data/universes';
import { Layers, ChevronDown, Check, Info, Sparkles } from 'lucide-react';

interface UniverseSelectorProps {
  selectedUniverseId: UniverseId;
  onSelectUniverse: (id: UniverseId) => void;
  universeStockCount: number;
  universePassedCount: number;
}

export const UniverseSelector: React.FC<UniverseSelectorProps> = ({
  selectedUniverseId,
  onSelectUniverse,
  universeStockCount,
  universePassedCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentUniverse = getUniverseById(selectedUniverseId);

  // Group universes by category
  const categories: ('Large Cap' | 'Mid Cap' | 'Small Cap' | 'Micro Cap' | 'Broad Market')[] = [
    'Broad Market',
    'Large Cap',
    'Mid Cap',
    'Small Cap',
    'Micro Cap',
  ];

  const popularUniverses: UniverseId[] = [
    'nifty-50',
    'nifty-100',
    'nifty-midcap-100',
    'nifty-smallcap-100',
    'nifty-500',
    'nifty-total-market',
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs mb-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left: Active Universe Dropdown & Details */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Active Universe:</span>
          </div>

          {/* Universe Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <span>{currentUniverse.name}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-700 text-slate-200 font-normal">
                {currentUniverse.category}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-40 max-h-[75vh] overflow-y-auto p-2">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Select NSE Universe (15 Available)</span>
                    <span className="text-[10px] text-slate-400">Official Indices</span>
                  </div>

                  {categories.map((cat) => {
                    const list = UNIVERSES.filter((u) => u.category === cat);
                    if (list.length === 0) return null;
                    return (
                      <div key={cat} className="mt-2">
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 rounded">
                          {cat}
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {list.map((u) => {
                            const isSelected = u.id === selectedUniverseId;
                            return (
                              <button
                                key={u.id}
                                onClick={() => {
                                  onSelectUniverse(u.id);
                                  setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                  isSelected
                                    ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                                    : 'hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      (~{u.stockCount})
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-normal line-clamp-1">
                                    {u.description}
                                  </div>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Quick Stats on Active Universe */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">In Universe:</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {universeStockCount} stocks
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 font-medium">Qualified:</span>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {universePassedCount}
            </span>
          </div>
        </div>

        {/* Right: Quick Switch Pills for Popular Universes */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-[11px] text-slate-400 font-medium mr-1 hidden xl:inline">Quick:</span>
          {popularUniverses.map((id) => {
            const u = getUniverseById(id);
            const isActive = u.id === selectedUniverseId;
            return (
              <button
                key={u.id}
                onClick={() => onSelectUniverse(u.id)}
                className={`whitespace-nowrap px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {u.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Universe Description Banner */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 truncate">
          <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{currentUniverse.description}</span>
        </div>
        <div className="font-mono text-slate-400 ml-2 flex-shrink-0">
          Rankings Localized to {currentUniverse.name}
        </div>
      </div>
    </div>
  );
};
