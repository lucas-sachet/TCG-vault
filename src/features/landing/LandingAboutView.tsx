'use client';

import { motion } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import type { LandingViewCommonProps } from './landingTypes';

export function LandingAboutView({
    navigate,
    userEmail,
    onOpenRegister,
}: LandingViewCommonProps) {
    return (
        <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12 max-w-4xl mx-auto pt-6"
                    >
                        {/* Breadcrumb / Back button */}
                        <button
                            onClick={() => {
                                navigate('/');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer group text-left border-none bg-transparent"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            <span>BACK TO PORTFOLIO VAULT</span>
                        </button>

                        <div className="bg-[#0c0e14]/90 border border-slate-850/80 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-8">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3B4CCA] via-[#FFCB05] to-indigo-500" />

                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/50 border border-indigo-500/20 text-[#FFCB05] rounded-full font-mono text-[9px] tracking-widest uppercase font-bold">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>BEHIND THE VAULT</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-white font-mono uppercase tracking-tight">
                                    About PokéVault
                                </h1>
                            </div>

                            <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-sm md:text-base leading-relaxed">
                                <section className="space-y-3">
                                    <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                                        Our Mission
                                    </h2>
                                    <p>
                                        We started PokéVault because we were
                                        tired of managing our card collections
                                        on clunky, manual spreadsheets. We
                                        wanted a tool that treated our cards
                                        like the valuable assets they are,
                                        without losing the fun of the chase.
                                        PokéVault is our answer: a
                                        professional-grade portfolio manager
                                        built to track live values, ROI, and
                                        virtual binders in real-time.
                                    </p>
                                </section>

                                <section className="space-y-3">
                                    <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                                        The Team
                                    </h2>
                                    <p>
                                        We are a team of passionate collectors
                                        and software engineers who live and
                                        breathe TCGs. We know the difference
                                        between a raw NM card and a PSA 10, and
                                        we built this tool with the features and
                                        accuracy that we ourselves demand.
                                    </p>
                                </section>

                                <section className="space-y-3">
                                    <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                                        How the Engine Works
                                    </h2>
                                    <p>
                                        PokéVault links your cards directly to
                                        verified official database APIs. By
                                        tracking live market trading data and
                                        recent sales, our valuation engine
                                        automatically calculates your cost
                                        basis, current portfolio value, and ROI
                                        margins.
                                    </p>
                                </section>
                            </div>

                            <div className="pt-6 border-t border-slate-850/60 flex justify-start">
                                {userEmail ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigate('/app');
                                        }}
                                        className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-3 px-6 text-xs font-mono cursor-pointer transition-all"
                                    >
                                        GO TO DASHBOARD
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onOpenRegister();
                                        }}
                                        className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-3 px-6 text-xs font-mono cursor-pointer transition-all"
                                    >
                                        START BUILDING YOUR VAULT
                                    </button>
                                )}
                            </div>
                        </div>
        </motion.div>
    );
}
