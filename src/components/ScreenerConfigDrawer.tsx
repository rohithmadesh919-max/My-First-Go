import React, { useState } from 'react';
import { X, RotateCcw, Check, Sliders, Info } from 'lucide-react';
import { ScreenerFilterConfig } from '../types';

interface ScreenerConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: ScreenerFilterConfig;
  onApplyConfig: (config: ScreenerFilterConfig) => void;
}

const DEFAULT_CONFIG: ScreenerFilterConfig = {
  emaSpan: 100,
  min1YReturn: 6.5,
  maxDistFrom52WHigh: 20.0,
  minUpDaysPct: 45.0,
  weight6M: 1.0,
  weight3M: 1.0,
  weight1M: 1.0,
};

export const ScreenerConfigDrawer: React.FC<ScreenerConfigDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onApplyConfig,
}) => {
  const [formConfig, setFormConfig] = useState<ScreenerFilterConfig>(config);

  if (!isOpen) return null;

  const handleReset = () => {
    setFormConfig(DEFAULT_CONFIG);
  };

  const handleApply = () => {
    onApplyConfig(formConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Quantitative Model Criteria</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>
              These 4 criteria mirror the exact Python conditions in your Google Colab notebook. Modifying them will recalibrate the qualification hurdles and rank calculations.
            </span>
          </div>

          {/* 1. EMA Span */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-800">1. Trend Filter: EMA Span</label>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {formConfig.emaSpan} Days
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Stock price must be above its exponential moving average.</p>
            <input
              type="range"
              min={20}
              max={200}
              step={10}
              value={formConfig.emaSpan}
              onChange={(e) => setFormConfig({ ...formConfig, emaSpan: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* 2. Min 1-Year Return */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-800">2. Min 1-Year Return</label>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                +{formConfig.min1YReturn}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Filters out cyclical laggards (default 6.5% beats base risk-free rate).</p>
            <input
              type="range"
              min={0}
              max={30}
              step={0.5}
              value={formConfig.min1YReturn}
              onChange={(e) => setFormConfig({ ...formConfig, min1YReturn: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* 3. 52-Week High Proximity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-800">3. 52-Week High Proximity</label>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Within {formConfig.maxDistFrom52WHigh}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Requires price ≥ 80% of 52-week high (`price &gt;= high_52_week * 0.8`).</p>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={formConfig.maxDistFrom52WHigh}
              onChange={(e) => setFormConfig({ ...formConfig, maxDistFrom52WHigh: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* 4. Min 6M Up Days % */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-800">4. Consistency: 6M Up-Days %</label>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                &gt; {formConfig.minUpDaysPct}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Requires steady accumulation rather than sporadic single-day spikes.</p>
            <input
              type="range"
              min={35}
              max={60}
              step={1}
              value={formConfig.minUpDaysPct}
              onChange={(e) => setFormConfig({ ...formConfig, minUpDaysPct: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Timeframe Rank Weights */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Ranking Weights (Final Rank Formula)
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Final_Rank = (w6M × Rank_6M) + (w3M × Rank_3M) + (w1M × Rank_1M)
            </p>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">6M Weight</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formConfig.weight6M}
                  onChange={(e) => setFormConfig({ ...formConfig, weight6M: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">3M Weight</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formConfig.weight3M}
                  onChange={(e) => setFormConfig({ ...formConfig, weight3M: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">1M Weight</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formConfig.weight1M}
                  onChange={(e) => setFormConfig({ ...formConfig, weight1M: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Apply & Recalculate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
