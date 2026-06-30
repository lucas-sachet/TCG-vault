/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { Clock, Film, Sparkles } from 'lucide-react';
import type { JourneyViewMode } from './types';

export interface JourneyHeaderProps {
  activeViewMode: JourneyViewMode;
  onViewModeChange: (mode: JourneyViewMode) => void;
}

export function JourneyHeader({ activeViewMode, onViewModeChange }: JourneyHeaderProps) {
  return (
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950/30 via-[#10121a] to-slate-950 px-6 py-6 rounded-3xl border border-slate-800 shadow-2xl text-left flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#FFCB05]/5 rounded-full blur-3xl animate-pulse" />
        
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-[#FFCB05] font-mono tracking-wider uppercase bg-yellow-950/60 border border-yellow-800/40 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COLLECTOR ODYSSEY Log</span>
            </span>
            <span className="text-[9px] text-indigo-400 font-mono tracking-wider uppercase bg-indigo-950/60 border border-indigo-900/40 px-2 rounded-md font-bold">
              Premium V2
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1.5">
            Jornada do Colecionador
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
            Sua odisseia PokéVault retratada sob medida. Alterne entre a <strong className="text-slate-300">Linha de Arquivo completa</strong> com relatórios em ordem cronológica ou o <strong className="text-[#FFCB05]">Álbum Cinemático Interativo</strong> para reviver marcos, conquistas lendárias e diários de bordo com visual imersivo.
          </p>
        </div>

        {/* View Mode Switcher Pill Slider */}
        <div className="bg-slate-950/90 border border-slate-800/80 p-1.5 rounded-2xl flex items-center self-start lg:self-center w-full sm:w-auto shrink-0 relative">
          <button
            onClick={() => onViewModeChange('timeline')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeViewMode === 'timeline' 
                ? 'bg-slate-900 border border-slate-800 text-[#FFCB05] shadow-[0_0_20px_rgba(255,203,5,0.08)]' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Linha de Arquivo</span>
          </button>
          
          <button
            onClick={() => onViewModeChange('cinema')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeViewMode === 'cinema' 
                ? 'bg-slate-900 border border-slate-800 text-[#FFCB05] shadow-[0_0_20px_rgba(255,203,5,0.08)]' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5 animate-pulse text-[#FFCB05]" />
            <span>Álbum Cinema</span>
          </button>
        </div>
      </div>
  );
}
