/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookMarked, Grid, Sliders, TrendingUp } from 'lucide-react';
import type { TrainerLabToolId } from './types';

interface TrainerLabToolNavProps {
  activeTool: TrainerLabToolId;
  onSelectTool: (tool: TrainerLabToolId) => void;
}

export function TrainerLabToolNav({ activeTool, onSelectTool }: TrainerLabToolNavProps) {
  const tools: Array<{ id: TrainerLabToolId; label: string; icon: typeof BookMarked; iconClass: string }> = [
    { id: 'checklist', label: 'Completismo (Master Sets)', icon: BookMarked, iconClass: 'text-[#FFCB05]' },
    { id: 'binder', label: 'Pasta Virtual (Binder)', icon: Grid, iconClass: 'text-sky-400' },
    { id: 'grading', label: 'Grading Lab (Notas)', icon: Sliders, iconClass: 'text-purple-400' },
    { id: 'sniper', label: 'Sniper de Preços', icon: TrendingUp, iconClass: 'text-emerald-400' },
  ];

  return (
    <div id="trainer-lab-tabs-nav" className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/60 p-2 border border-slate-850 rounded-2xl">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition cursor-pointer ${
              isActive
                ? 'bg-[#181A24] border border-slate-800 text-[#FFCB05] shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-4 h-4 ${tool.iconClass}`} />
            <span>{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
}
