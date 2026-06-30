import React from 'react';
import { Bell } from 'lucide-react';

interface CardDetailsPriceAlertsProps {
  currencySymbol: string;
  alertEnabled: boolean;
  alertThreshold: number;
  onToggleAlert: (enabled: boolean) => void;
  onThresholdChange: (value: number) => void;
}

export const CardDetailsPriceAlerts: React.FC<CardDetailsPriceAlertsProps> = ({
  currencySymbol,
  alertEnabled,
  alertThreshold,
  onToggleAlert,
  onThresholdChange
}) => (
  <div className="bg-[#171921] p-4 border border-slate-800 rounded-2xl space-y-3">
    <span className="text-[10px] text-slate-550 font-mono tracking-wider block uppercase font-bold flex items-center gap-1.5">
      <Bell className="w-3.5 h-3.5 text-amber-500" />
      <span>Card Price Alert Tracking</span>
    </span>

    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <label className="text-[10px] text-slate-400 font-mono block">Price Alert Notification</label>
        <span className="text-[9px] text-slate-500">Notify when target threshold is hit</span>
      </div>
      <button
        onClick={() => onToggleAlert(!alertEnabled)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${alertEnabled ? 'bg-amber-500' : 'bg-slate-800'}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${alertEnabled ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
    </div>

    {alertEnabled && (
      <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800/80">
        <span className="text-xs font-mono text-slate-400">{currencySymbol}</span>
        <input
          type="number"
          value={alertThreshold}
          onChange={(e) => onThresholdChange(Number(e.target.value) || 0)}
          className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-550 focus:outline-none font-mono"
          placeholder="e.g., 250"
        />
        <span className="text-[9px] text-slate-500 font-mono">Target</span>
      </div>
    )}
  </div>
);
