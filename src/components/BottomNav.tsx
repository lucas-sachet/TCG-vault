/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Wallet, Compass, Heart, BarChart3, Settings, PlusCircle, Sparkles } from 'lucide-react';

export type TabId = 'dashboard' | 'collection' | 'journey' | 'wishlist' | 'lab' | 'analytics' | 'settings';

interface BottomNavProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  onOpenAddModal: () => void;
  notificationCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddModal,
  notificationCount
}) => {
  const tabs = [
    { id: 'dashboard' as TabId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'collection' as TabId, label: 'Collection', icon: Wallet },
    { id: 'journey' as TabId, label: 'Journey', icon: Compass },
    { id: 'wishlist' as TabId, label: 'Wishlist', icon: Heart },
    { id: 'lab' as TabId, label: 'Trainer Lab', icon: Sparkles },
    { id: 'analytics' as TabId, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as TabId, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation (Visible below md) */}
      <nav id="mobile-nav" className="md:hidden fixed bottom-5 left-4 right-4 z-50 bg-[#161920]/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-around items-center h-16 relative">
          
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => onChangeTab(tab.id)}
                className={`flex-1 h-full flex flex-col items-center justify-center transition-all duration-200 relative ${
                  isActive 
                    ? 'text-[#FFCB05] bg-slate-900/40 font-bold' 
                    : 'text-slate-400 active:scale-95'
                }`}
              >
                <IconComponent className={`w-5 h-5 mb-0.5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[9px] font-medium tracking-wide">
                  {tab.label}
                </span>

                {tab.id === 'settings' && notificationCount > 0 && (
                  <span className="absolute top-3 right-3 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar-like floating bar (Visible on md and up) */}
      <aside id="desktop-sidebar" className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-[#14161f] border-r border-slate-800 p-6 z-50">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#3B4CCA] to-[#FFCB05] shadow-lg shadow-blue-950/20">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1-15.5c2.48 0 4.5 2.02 4.5 4.5S15.48 15.5 13 15.5s-4.5-2.02-4.5-4.5 2.02-4.5 4.5-4.5zm-1 16c-3.87 0-7-3.13-7-7 0-.5.06-1 .17-1.47l4.31 4.31c1.1-.38 2.37.18 2.87 1.25.1.22.15.46.15.7l-.01.21h-.1c-.96 0-1.89-.39-2.58-1.08l-2.01-2.01c-.49-.49-1.28-.49-1.77 0-.49.49-.49 1.28 0 1.77l3.87 3.87C9.28 18.81 10.61 19 12 19c4.96 0 9-4.04 9-9h.5c0 4.96-4.04 9-9 9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white flex items-center gap-1">
              TCG<span className="text-[#FFCB05]">Vault</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">TCG COLLECTION VAULT</p>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`sidebar-btn-${tab.id}`}
                onClick={() => onChangeTab(tab.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-800/60 text-[#FFCB05] border-l-4 border-[#FFCB05] pl-3'
                    : 'text-slate-300 hover:bg-slate-800/30 hover:text-white'
                }`}
              >
                <IconComponent className="w-5 h-5 shrink-0" />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.id === 'settings' && notificationCount > 0 && (
                  <span className="flex items-center justify-center bg-red-500 text-white font-mono text-[10px] px-2 py-0.5 rounded-full">
                    {notificationCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Floating Add Card Button in desktop sidebar */}
        <div className="mt-auto">
          <button
            id="desktop-add-card-btn"
            onClick={onOpenAddModal}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#3B4CCA] to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-950/40 hover:shadow-indigo-900/30 active:scale-95 transition-all text-sm group"
          >
            <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>Add New Card</span>
          </button>
        </div>
      </aside>
    </>
  );
};
