'use client';

import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import {
    showcasePortfolioCards,
    totalShowcaseCost,
    totalShowcaseRoi,
    totalShowcaseValue,
} from './showcaseData';
import type { LandingViewCommonProps } from './landingTypes';

export function LandingHomeHeroSection({
    navigate,
    userEmail,
    onOpenRegister,
}: LandingViewCommonProps) {
    return (
                        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            <div className="lg:col-span-6 space-y-6">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/50 border border-indigo-500/20 text-indigo-400 rounded-full font-mono text-[10px] tracking-widest uppercase font-bold">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>
                                        THE PORTFOLIO PLATFORM FOR SERIOUS
                                        COLLECTORS
                                    </span>
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] font-mono">
                                    The Intelligent{' '}
                                    <br className="hidden md:inline" />
                                    Portfolio Vault{' '}
                                    <br className="hidden md:inline" />
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFCB05] via-[#3B4CCA] to-indigo-400">
                                        for Pokémon Collectors
                                    </span>
                                </h1>

                                <p className="text-slate-400 text-base md:text-lg max-w-xl leading-relaxed">
                                    Track real-time valuations, monitor ROI, and
                                    organize virtual binders. Stop guessing what
                                    your collection is worth—start tracking it
                                    like an asset.
                                </p>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                                    {userEmail ? (
                                        <button
                                            type="button"
                                            onClick={() => navigate('/app')}
                                            className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-4 px-8 text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FFCB05]/10 font-mono"
                                        >
                                            <span>GO TO DASHBOARD</span>
                                            <ArrowRight className="w-4 h-4 shrink-0 stroke-[3px]" />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onOpenRegister();
                                            }}
                                            className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-4 px-8 text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FFCB05]/10 font-mono"
                                        >
                                            <span>BUILD YOUR FREE VAULT</span>
                                            <ArrowRight className="w-4 h-4 shrink-0 stroke-[3px]" />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            navigate('/features');
                                            window.scrollTo({
                                                top: 0,
                                                behavior: 'smooth',
                                            });
                                        }}
                                        className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-2xl py-4 px-8 text-sm font-semibold hover:text-white transition-all text-center flex items-center justify-center gap-2 cursor-pointer font-mono"
                                    >
                                        <span>EXPLORE FEATURES</span>
                                    </button>
                                </div>

                                {/* Micro stats banner for elite feel */}
                                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-900/60 max-w-md">
                                    <div>
                                        <span className="text-[10px] text-slate-500 font-mono uppercase block">
                                            Verified Expansions
                                        </span>
                                        <span className="text-lg font-bold text-white mt-0.5">
                                            150+ Sets
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 font-mono uppercase block">
                                            Active Collectors
                                        </span>
                                        <span className="text-lg font-bold text-white mt-0.5">
                                            12,000+
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 font-mono uppercase block">
                                            Value Managed
                                        </span>
                                        <span className="text-lg font-bold text-white mt-0.5">
                                            $42.5M+
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Hero Premium Interactive Visual mockup mockup */}
                            <div className="lg:col-span-6 relative w-full flex justify-center">
                                <div className="absolute inset-0 bg-[#3B4CCA]/5 blur-[70px] rounded-full pointer-events-none" />

                                {/* Visual Glassmorphic Grid Layout of Live Tracker */}
                                <div className="relative w-full max-w-lg bg-[#0c0e14]/90 border border-slate-850/80 rounded-3xl p-6 shadow-2xl overflow-hidden backdrop-blur-xl">
                                    {/* Fake UI Header controls */}
                                    <div className="flex items-center justify-between pb-5 border-b border-slate-850/60 mb-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                        </div>
                                        <div className="bg-slate-900 border border-slate-850 text-[9px] font-mono font-bold text-slate-400 px-3 py-1 rounded-lg">
                                            POKEVAULT PORTFOLIO ENGINE V2.4
                                        </div>
                                    </div>

                                    {/* Total Balance mockup card value with green mini trend line */}
                                    <div className="grid grid-cols-2 gap-4 pb-5 border-b border-slate-850/40">
                                        <div>
                                            <span className="text-[9px] text-slate-500 font-mono uppercase block tracking-wider">
                                                TOTAL PORTFOLIO VALUE
                                            </span>
                                            <span className="text-2xl font-black text-white tracking-tight mt-1 leading-none font-mono">
                                                $
                                                {totalShowcaseValue.toLocaleString(
                                                    'en-US',
                                                    {
                                                        minimumFractionDigits: 2,
                                                    },
                                                )}
                                            </span>
                                            <span className="text-[10px] inline-flex items-center gap-1 font-mono font-bold text-green-500 mt-2 bg-green-950/15 border border-green-900/30 px-2 py-0.5 rounded-md leading-none">
                                                <TrendingUp className="w-3 h-3" />
                                                <span>
                                                    +
                                                    {totalShowcaseRoi.toFixed(
                                                        1,
                                                    )}
                                                    % (
                                                    {totalShowcaseValue -
                                                        totalShowcaseCost >
                                                    0
                                                        ? '+'
                                                        : ''}
                                                    $
                                                    {totalShowcaseValue -
                                                        totalShowcaseCost}
                                                    )
                                                </span>
                                            </span>
                                        </div>

                                        {/* Simulated Sparkline chart drawing */}
                                        <div className="flex items-end justify-end h-16 w-full pr-1">
                                            <svg
                                                className="w-full max-w-[140px] h-full text-green-400"
                                                viewBox="0 0 100 30"
                                                fill="none"
                                            >
                                                <path
                                                    d="M0,25 Q15,22 30,14 T60,18 T90,3 T100,2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                />
                                                <path
                                                    d="M0,25 Q15,22 30,14 T60,18 T90,3 T100,2 L100,30 L0,30 Z"
                                                    fill="url(#greenGradient)"
                                                    opacity="0.12"
                                                />
                                                <defs>
                                                    <linearGradient
                                                        id="greenGradient"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="0%"
                                                            stopColor="#22c55e"
                                                        />
                                                        <stop
                                                            offset="100%"
                                                            stopColor="#22c55e"
                                                            stopOpacity="0"
                                                        />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Stacked Showcase of specimen cards */}
                                    <div className="space-y-3.5 mt-5">
                                        <span className="text-[9px] text-slate-500 font-mono uppercase block tracking-wider">
                                            LIVE VAULT SPECIMENS
                                        </span>

                                        {showcasePortfolioCards.map(
                                            (card, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-850 rounded-2xl hover:border-slate-800 transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={card.image}
                                                            alt={card.name}
                                                            referrerPolicy="no-referrer"
                                                            className="w-8 h-11 object-contain rounded bg-slate-950 border border-slate-850 shadow"
                                                        />
                                                        <div>
                                                            <span className="font-bold text-xs text-white block truncate max-w-[150px]">
                                                                {card.name}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                                                {card.set} •{' '}
                                                                {card.number}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className="text-[11px] font-bold text-white block font-mono">
                                                            ${card.currentValue}
                                                        </span>
                                                        <span className="text-[9px] text-green-400 font-bold font-mono mt-0.5 block">
                                                            +
                                                            {(
                                                                ((card.currentValue -
                                                                    card.purchasePrice) /
                                                                    card.purchasePrice) *
                                                                100
                                                            ).toFixed(0)}
                                                            % ROI
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
    );
}
