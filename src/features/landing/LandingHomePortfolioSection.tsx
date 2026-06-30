'use client';

import { showcasePortfolioCards, totalShowcaseValue } from './showcaseData';

export function LandingHomePortfolioSection() {
    return (
        <section className="space-y-12 bg-slate-950/40 p-8 rounded-3xl border border-slate-900 backdrop-blur">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                                <div className="space-y-3 max-w-xl">
                                    <span className="text-[10px] text-[#FFCB05] font-mono tracking-widest block uppercase font-bold">
                                        PORTFOLIO DEEP DIVE
                                    </span>
                                    <h2 className="text-3xl font-extrabold tracking-tight text-white font-mono uppercase">
                                        Live Valuation Engine
                                    </h2>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        See how PokéVault automatically updates
                                        purchase entries against live market
                                        sales to display your true returns.
                                    </p>
                                </div>

                                {/* Mock Header indicators */}
                                <div className="flex items-center gap-6 font-mono bg-[#0c0e14] p-4 rounded-2xl border border-slate-850 shadow shrink-0">
                                    <div>
                                        <span className="text-[9px] text-slate-500 block uppercase">
                                            PORTFOLIO VALUE
                                        </span>
                                        <span className="text-sm font-bold text-[#FFCB05]">
                                            ${totalShowcaseValue}
                                        </span>
                                    </div>
                                    <div className="w-px h-8 bg-slate-900" />
                                    <div>
                                        <span className="text-[9px] text-slate-500 block uppercase">
                                            AVG. CARD VALUE
                                        </span>
                                        <span className="text-sm font-bold text-white">
                                            $
                                            {Math.round(
                                                totalShowcaseValue /
                                                    showcasePortfolioCards.length,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-3">
                                {showcasePortfolioCards.map((card, idx) => {
                                    const profit =
                                        card.currentValue - card.purchasePrice;
                                    const roi =
                                        (profit / card.purchasePrice) * 100;

                                    return (
                                        <div
                                            key={idx}
                                            className="bg-[#0c0e14] border border-slate-850 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-850 hover:bg-[#0f1118]/80 transition-all shadow-inner group"
                                        >
                                            <div className="relative aspect-[3/4.2] bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden mb-5 flex items-center justify-center p-2 group-hover:scale-[1.01] transition-transform">
                                                <img
                                                    src={card.image}
                                                    alt={card.name}
                                                    referrerPolicy="no-referrer"
                                                    className="w-full h-full object-contain"
                                                />

                                                <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 border border-slate-850 px-3 py-2 rounded-xl backdrop-blur-md flex justify-between items-center text-[10px]">
                                                    <span className="text-[#FFCB05] font-black font-mono">
                                                        {card.condition}
                                                    </span>
                                                    <span className="text-slate-400 font-mono truncate max-w-[80px]">
                                                        {card.number}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <span className="text-[9px] text-indigo-400 font-bold tracking-wider font-mono uppercase">
                                                        {card.set}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-white block truncate leading-tight mt-0.5">
                                                        {card.name}
                                                    </h4>
                                                </div>

                                                <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-3 rounded-2xl border border-slate-900 text-center font-mono">
                                                    <div>
                                                        <span className="text-[8px] text-slate-500 block">
                                                            COST
                                                        </span>
                                                        <span className="text-[11px] font-bold text-slate-300 block mt-1">
                                                            $
                                                            {card.purchasePrice}
                                                        </span>
                                                    </div>
                                                    <div className="border-x border-slate-900">
                                                        <span className="text-[8px] text-slate-500 block">
                                                            VALUE
                                                        </span>
                                                        <span className="text-[11px] font-bold text-white block mt-1">
                                                            ${card.currentValue}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[8px] text-slate-500 block">
                                                            ROI
                                                        </span>
                                                        <span className="text-[11px] font-bold text-green-400 block mt-1">
                                                            +{roi.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
    );
}
