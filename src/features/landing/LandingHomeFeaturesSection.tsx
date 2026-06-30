'use client';

import {
    Coins,
    Database,
    Heart,
    Layers,
    LineChart,
    PieChart,
} from 'lucide-react';

export function LandingHomeFeaturesSection() {
    return (
        <section id="features" className="space-y-12">
                            <div className="text-center max-w-2xl mx-auto space-y-4">
                                <span className="text-[10px] text-[#FFCB05] font-mono tracking-widest block uppercase font-bold">
                                    VAULT ARCHITECTURE
                                </span>
                                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono uppercase">
                                    Engineered for Serious Collectors
                                </h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Every feature is designed with the precision
                                    demanded by high-value TCG investors and
                                    grading enthusiasts.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Feature 1: Collection Management */}
                                <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
                                    <div className="w-10 h-10 rounded-xl bg-[#3B4CCA]/10 text-[#3B4CCA] flex items-center justify-center border border-[#3B4CCA]/20 select-none">
                                        <Database className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="font-bold text-base text-slate-100 font-mono uppercase">
                                        Seamless Cataloging
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Log your cards in seconds. Search by
                                        set, name, or card number to link your
                                        physical holdings with live database
                                        records.
                                    </p>
                                </div>

                                {/* Feature 2: Portfolio Tracking */}
                                <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
                                    <div className="w-10 h-10 rounded-xl bg-[#FFCB05]/15 text-[#FFCB05] flex items-center justify-center border border-[#FFCB05]/30 select-none">
                                        <LineChart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="font-bold text-base text-slate-100 font-mono uppercase">
                                        Real-Time Valuations
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Automatically calculate cost basis, net
                                        value, and ROI. Watch your portfolio's
                                        appreciation adjust instantly to live
                                        market trends.
                                    </p>
                                </div>

                                {/* Feature 3: Price History */}
                                <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/25 select-none">
                                        <Coins className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="font-bold text-base text-slate-100 font-mono uppercase">
                                        Historical Market Charts
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Access historical price charts for raw
                                        and graded cards. Track market trends to
                                        buy the dip and sell at the peak.
                                    </p>
                                </div>

                                {/* Feature 4: Wishlist Management */}
                                <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
                                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/25 select-none">
                                        <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="font-bold text-base text-slate-100 font-mono uppercase">
                                        Target Price Alerts
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Add high-priority chases to your
                                        wishlist, set target prices, and get
                                        notified immediately when market values
                                        meet your budget.
                                    </p>
                                </div>

                                {/* Feature 5: Binder Organization */}
                                <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/25 select-none">
                                        <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="font-bold text-base text-slate-100 font-mono uppercase">
                                        Custom Virtual Binders
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Organize your collection your way. Group
                                        your singles by expansion set, theme, or
                                        investment priority inside customizable
                                        digital binders.
                                    </p>
                                </div>

                                {/* Feature 6: Collection Analytics */}
                                <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
                                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/25 select-none">
                                        <PieChart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="font-bold text-base text-slate-100 font-mono uppercase">
                                        Advanced TCG Analytics
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Visualize your collection stats. Track
                                        set completion progress, rarity
                                        distributions, and graded vs. raw
                                        ratios.
                                    </p>
                                </div>
                            </div>
                        </section>
    );
}
