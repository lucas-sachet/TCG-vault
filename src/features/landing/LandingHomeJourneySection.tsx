'use client';

import {
    CheckCircle2,
    Layers,
    Search,
    TrendingUp,
} from 'lucide-react';

export function LandingHomeJourneySection() {
    return (
        <section className="space-y-12">
                            <div className="text-center max-w-2xl mx-auto space-y-4">
                                <span className="text-[10px] text-[#FFCB05] font-mono tracking-widest block uppercase font-bold">
                                    WORKFLOW TIMELINE
                                </span>
                                <h2 className="text-3xl font-extrabold tracking-tight text-white font-mono uppercase">
                                    Four Steps to Total Control
                                </h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Taking control of your card collection is
                                    simple and secure.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                                {/* Connection decorative dashed line */}
                                <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-px border-t border-dashed border-slate-800 pointer-events-none z-0" />

                                {/* Journey Step 1: Search */}
                                <div className="space-y-4 relative z-10 text-center sm:text-left">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-blue-500/20 text-[#FFCB05] flex items-center justify-center font-mono font-black text-sm mx-auto sm:mx-0">
                                        01
                                    </div>
                                    <h3 className="font-bold text-sm text-white font-mono uppercase flex items-center justify-center sm:justify-start gap-1.5">
                                        <Search className="w-4 h-4 text-blue-500" />
                                        <span>Search Card Database</span>
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto sm:mx-0">
                                        Type any keyword or card number to
                                        instantly retrieve official metadata,
                                        images, and live prices.
                                    </p>
                                </div>

                                {/* Journey Step 2: Add Holdings */}
                                <div className="space-y-4 relative z-10 text-center sm:text-left">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-blue-500/20 text-[#FFCB05] flex items-center justify-center font-mono font-black text-sm mx-auto sm:mx-0">
                                        02
                                    </div>
                                    <h3 className="font-bold text-sm text-white font-mono uppercase flex items-center justify-center sm:justify-start gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span>Log Your Purchase</span>
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto sm:mx-0">
                                        Enter your purchase price, acquisition
                                        date, card condition, and grading cert
                                        number to establish your baseline.
                                    </p>
                                </div>

                                {/* Journey Step 3: Monitor Growth */}
                                <div className="space-y-4 relative z-10 text-center sm:text-left">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-blue-500/20 text-[#FFCB05] flex items-center justify-center font-mono font-black text-sm mx-auto sm:mx-0">
                                        03
                                    </div>
                                    <h3 className="font-bold text-sm text-white font-mono uppercase flex items-center justify-center sm:justify-start gap-1.5">
                                        <TrendingUp className="w-4 h-4 text-pink-500" />
                                        <span>Track Performance</span>
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto sm:mx-0">
                                        Monitor your dashboard to watch your
                                        total net worth grow, analyze trends,
                                        and view ROI.
                                    </p>
                                </div>

                                {/* Journey Step 4: Organize Binders */}
                                <div className="space-y-4 relative z-10 text-center sm:text-left">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-blue-500/20 text-[#FFCB05] flex items-center justify-center font-mono font-black text-sm mx-auto sm:mx-0">
                                        04
                                    </div>
                                    <h3 className="font-bold text-sm text-white font-mono uppercase flex items-center justify-center sm:justify-start gap-1.5">
                                        <Layers className="w-4 h-4 text-purple-500" />
                                        <span>Organize in Binders</span>
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto sm:mx-0">
                                        Sort cards into custom virtual binders
                                        that replicate physical slot
                                        configurations for easy viewing.
                                    </p>
                                </div>
                            </div>
                        </section>
    );
}
