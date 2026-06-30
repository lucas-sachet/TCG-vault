/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sliders, Languages, FolderHeart, Check, Sparkles } from 'lucide-react';
import type { Binder } from '../../types';
import { COLLECTOR_STYLES } from './settingsConstants';

interface SettingsPreferencesPanelProps {
  binders: Binder[];
  selectedLanguages: string[];
  defaultCollectionId: string;
  setDefaultCollectionId: (value: string) => void;
  showPurchasePrices: boolean;
  setShowPurchasePrices: (value: boolean) => void;
  showROI: boolean;
  setShowROI: (value: boolean) => void;
  showCollectionValue: boolean;
  setShowCollectionValue: (value: boolean) => void;
  collectorProfile: string;
  setCollectorProfile: (value: string) => void;
  onToggleLanguage: (language: string) => void;
  onSavePreferences: () => void;
}

export function SettingsPreferencesPanel({
  binders,
  selectedLanguages,
  defaultCollectionId,
  setDefaultCollectionId,
  showPurchasePrices,
  setShowPurchasePrices,
  showROI,
  setShowROI,
  showCollectionValue,
  setShowCollectionValue,
  collectorProfile,
  setCollectorProfile,
  onToggleLanguage,
  onSavePreferences,
}: SettingsPreferencesPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl space-y-5">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
            <h3 className="font-bold text-slate-100 text-sm uppercase font-mono tracking-wide flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Display & Filter Parameters</span>
            </h3>
            <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded leading-none uppercase font-bold">
              Preferences
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-indigo-400" />
              <span>Preferred Card Languages</span>
            </label>
            <p className="text-[10px] text-slate-400 leading-normal font-semibold">
              Set cards lang editions that display natively in search and filters. (Multiple choices allowed).
            </p>
            <div className="grid grid-cols-3 gap-2.5 pt-1.5">
              {['English', 'Japanese', 'Portuguese'].map((language) => {
                const isActive = selectedLanguages.includes(language);
                return (
                  <button
                    key={language}
                    type="button"
                    onClick={() => onToggleLanguage(language)}
                    className={`py-3.5 border text-xs font-bold font-mono tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'border-[#FFCB05] bg-[#3B4CCA]/5 text-[#FFCB05] font-black'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                        isActive ? 'border-[#FFCB05] bg-yellow-400/20' : 'border-slate-700 bg-slate-950'
                      }`}
                    >
                      {isActive && <Check className="w-2.5 h-2.5 text-[#FFCB05]" />}
                    </div>
                    <span>{language}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold flex items-center gap-1">
              <FolderHeart className="w-3.5 h-3.5 text-[#FFCB05]" />
              <span>Default Initial Collection / Binder</span>
            </label>
            <p className="text-[10px] text-slate-400 leading-normal font-semibold">
              Select the fallback drawer to present active cards, stats, and filters immediately when dashboard logs boot.
            </p>
            <select
              value={defaultCollectionId}
              onChange={(event) => setDefaultCollectionId(event.target.value)}
              className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 rounded-xl p-3.5 focus:outline-none focus:border-[#FFCB05]/40 transition-all font-mono appearance-none"
            >
              {binders.map((binder) => (
                <option key={binder.id} value={binder.id} className="bg-slate-900 text-slate-200">
                  {binder.name} ({binder.id === 'binder-all' ? 'All Binders Combined' : 'Custom Binder'})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">
              Telemetry Display Preferences
            </label>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Show Card Purchase Prices</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 leading-normal">
                    Exposes historical personal cost basis allocations inside binders logs.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPurchasePrices(!showPurchasePrices)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${showPurchasePrices ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <div
                    className={`absolute top-1.5 w-3 h-3 bg-white rounded-full transition-all duration-200 ${showPurchasePrices ? 'translate-x-5' : 'translate-x-0'}`}
                    style={{ left: '0.375rem' }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Show Return On Investment (ROI)</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 leading-normal">
                    Displays financial return ratios and value multipliers against cost basis.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowROI(!showROI)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${showROI ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <div
                    className={`absolute top-1.5 w-3 h-3 bg-white rounded-full transition-all duration-200 ${showROI ? 'translate-x-5' : 'translate-x-0'}`}
                    style={{ left: '0.375rem' }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Show Total Collection Valuation</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 leading-normal">
                    Presents overall combined monetary coordinates at the top headers.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCollectionValue(!showCollectionValue)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${showCollectionValue ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <div
                    className={`absolute top-1.5 w-3 h-3 bg-white rounded-full transition-all duration-200 ${showCollectionValue ? 'translate-x-5' : 'translate-x-0'}`}
                    style={{ left: '0.375rem' }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
              <h3 className="font-bold text-slate-100 text-sm uppercase font-mono tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFCB05]" />
                <span>Collector Style Persona</span>
              </h3>
              <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded leading-none uppercase font-bold">
                Archetypes
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Select your primary collection archetype. Changing your style adapts the dashboard layout highlight tones, tips, and target goals metrics naturally.
            </p>

            <div className="space-y-3 pt-1">
              {COLLECTOR_STYLES.map((style) => {
                const isActive = collectorProfile === style.id;
                return (
                  <div
                    key={style.id}
                    onClick={() => setCollectorProfile(style.id)}
                    className={`p-3 border rounded-xl cursor-pointer transition-all flex items-start gap-3 text-left ${
                      isActive
                        ? `${style.color} ring-1 ring-white/10 shadow-md`
                        : 'border-slate-850 hover:border-slate-800 bg-slate-900/40 hover:bg-slate-900'
                    }`}
                  >
                    <span className="text-2xl pt-0.5 shrink-0 select-none">{style.glyph}</span>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${isActive ? 'text-[#FFCB05]' : 'text-slate-100'}`}>
                          {style.name}
                        </span>
                        {isActive && (
                          <span className="text-[8px] bg-[#FFCB05]/10 text-[#FFCB05] font-mono px-1.5 py-0.5 rounded uppercase font-bold leading-none">
                            PRIMARY OPTION
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 leading-relaxed block mt-1">{style.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onSavePreferences}
            className="w-full mt-6 py-3 bg-[#3B4CCA] hover:bg-indigo-600 text-white rounded-xl text-xs font-black font-mono tracking-wider transition-all select-none cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15"
          >
            <Check className="w-4 h-4" />
            <span>APPLY DASHBOARD PREFERENCES</span>
          </button>
        </div>
      </div>
    </div>
  );
}
