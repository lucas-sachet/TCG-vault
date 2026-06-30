/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState } from 'react';
import { BookOpen, LogOut, PlusCircle, Settings } from 'lucide-react';
import type { AppHeaderProps } from './types';

export function AppHeader({
  activeTab,
  onChangeTab,
  onOpenAddModal,
  profileName,
  userEmail,
  onSignOut,
  renderAvatar,
}: AppHeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#12141c]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <button
            type="button"
            onClick={() => onChangeTab('collection')}
            className="flex items-center gap-2.5 shrink-0"
            aria-label="PokéVault home"
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-[#3B4CCA] to-[#FFCB05]">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1-15.5c2.48 0 4.5 2.02 4.5 4.5S15.48 15.5 13 15.5s-4.5-2.02-4.5-4.5 2.02-4.5 4.5-4.5zm-1 16c-3.87 0-7-3.13-7-7 0-.5.06-1 .17-1.47l4.31 4.31c1.1-.38 2.37.18 2.87 1.25.1.22.15.46.15.7l-.01.21h-.1c-.96 0-1.89-.39-2.58-1.08l-2.01-2.01c-.49-.49-1.28-.49-1.77 0-.49.49-.49 1.28 0 1.77l3.87 3.87C9.28 18.81 10.61 19 12 19c4.96 0 9-4.04 9-9h.5c0 4.96-4.04 9-9 9z" />
              </svg>
            </div>
            <span className="text-base font-black tracking-widest text-white hidden sm:block">
              TCG<span className="text-[#FFCB05]">VAULT</span>
            </span>
          </button>

          <nav className="flex items-center gap-1" aria-label="Primary">
            <button
              type="button"
              onClick={() => onChangeTab('collection')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition ${
                activeTab === 'collection'
                  ? 'bg-slate-800/80 text-[#FFCB05] border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Binders</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeTab('settings')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition ${
                activeTab === 'settings'
                  ? 'bg-slate-800/80 text-[#FFCB05] border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-[#3B4CCA] to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-bold py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm shadow-lg active:scale-95 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Card</span>
            <span className="sm:hidden">Add</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/60 transition"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
            >
              {renderAvatar('w-8 h-8 text-base')}
            </button>
            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-[#171A21] border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-850 mb-2">
                    <span className="text-xs font-black text-slate-100 block truncate">{profileName}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{userEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onChangeTab('settings');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-300 hover:text-[#FFCB05] hover:bg-slate-900 rounded-xl"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSignOut();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-950/20 rounded-xl mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
