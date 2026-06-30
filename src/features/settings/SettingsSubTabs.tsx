/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Sliders, Lock } from 'lucide-react';
import type { SettingsSubTabId } from './types';

interface SettingsSubTabsProps {
  activeSubTab: SettingsSubTabId;
  onSelectSubTab: (subTab: SettingsSubTabId) => void;
}

export function SettingsSubTabs({ activeSubTab, onSelectSubTab }: SettingsSubTabsProps) {
  const tabs: Array<{ id: SettingsSubTabId; label: string; icon: typeof User }> = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Collection Preferences', icon: Sliders },
    { id: 'account', label: 'Account Controls', icon: Lock },
  ];

  return (
    <div className="flex border-b border-slate-800 bg-[#12151C] p-1.5 rounded-2xl border gap-1.5 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeSubTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider transition-all uppercase cursor-pointer shrink-0 ${
              isActive
                ? 'bg-[#3B4CCA] text-white shadow-lg shadow-indigo-600/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
