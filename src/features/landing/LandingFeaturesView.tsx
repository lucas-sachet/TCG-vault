'use client';

import { motion } from 'motion/react';
import {
    ArrowLeft,
    CheckCircle2,
    Coins,
    Database,
    Layers,
} from 'lucide-react';
import type { LandingViewCommonProps } from './landingTypes';

export function LandingFeaturesView({
    navigate,
    userEmail,
    onOpenRegister,
}: LandingViewCommonProps) {
    return (
        <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12 max-w-5xl mx-auto pt-6"
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

                        <div className="bg-[#0c0e14]/90 border border-slate-850/80 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-12">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3B4CCA] via-[#FFCB05] to-indigo-500" />

                            <div className="space-y-3 text-center md:text-left">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/50 border border-indigo-500/20 text-[#FFCB05] rounded-full font-mono text-[9px] tracking-widest uppercase font-bold">
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>PLATFORM CAPABILITIES</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-white font-mono uppercase tracking-tight">
                                    PokéVault Features
                                </h1>
                                <p className="text-slate-400 text-sm max-w-xl">
                                    Explore the full array of high-precision
                                    inventory and analytical tools designed for
                                    modern collector workflows.
                                </p>
                            </div>

                            {/* Pillars Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Pillar 1: Automation */}
                                <div className="space-y-6 bg-slate-950/50 border border-slate-850/50 p-6 rounded-2xl hover:border-blue-500/20 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                                        <Database className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                                        Automation & API
                                    </h3>
                                    <ul className="space-y-4 text-xs text-slate-400 font-sans leading-relaxed">
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                            <span>
                                                <strong>
                                                    Instant Card Lookup:
                                                </strong>{' '}
                                                Search by name, card number, or
                                                expansion set to pull official
                                                high-resolution artwork and meta
                                                data.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                            <span>
                                                <strong>
                                                    Live Market Pricing:
                                                </strong>{' '}
                                                Connected to live indexes for
                                                real-time market value
                                                assessment of raw and graded
                                                cards.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                            <span>
                                                <strong>
                                                    Auto Expansion Sync:
                                                </strong>{' '}
                                                Keeps your binders perfectly
                                                categorized by sets with
                                                completion rate metrics.
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Pillar 2: Financials */}
                                <div className="space-y-6 bg-slate-950/50 border border-slate-850/50 p-6 rounded-2xl hover:border-yellow-500/20 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center border border-yellow-500/20">
                                        <Coins className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                                        Financial Analytics
                                    </h3>
                                    <ul className="space-y-4 text-xs text-slate-400 font-sans leading-relaxed">
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                            <span>
                                                <strong>Cost-Basis Log:</strong>{' '}
                                                Capture your exact acquisition
                                                costs, grading fees, and custom
                                                collector notes.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                            <span>
                                                <strong>Real-Time ROI:</strong>{' '}
                                                Dynamically monitor your net
                                                gain/loss, profit margins, and
                                                annualized percentage yields.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                            <span>
                                                <strong>
                                                    Multi-Currency Support:
                                                </strong>{' '}
                                                Toggle currency display options
                                                dynamically between USD, EUR,
                                                BRL, and JPY.
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Pillar 3: Visuals */}
                                <div className="space-y-6 bg-slate-950/50 border border-slate-850/50 p-6 rounded-2xl hover:border-indigo-500/20 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                                        Asset Management
                                    </h3>
                                    <ul className="space-y-4 text-xs text-slate-400 font-sans leading-relaxed">
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                            <span>
                                                <strong>
                                                    Interactive Binders:
                                                </strong>{' '}
                                                Group, drag, and display your
                                                card entries inside simulated
                                                3x3 pocket sheets.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                            <span>
                                                <strong>
                                                    Graded Certification:
                                                </strong>{' '}
                                                Log specific serial numbers and
                                                grading companies (PSA, CGC,
                                                BGS) for graded holdings.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                            <span>
                                                <strong>
                                                    Wishlist Chase Alerts:
                                                </strong>{' '}
                                                Monitor desired items, set price
                                                thresholds, and get alerts when
                                                targets are met.
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Bottom Call to Action */}
                            <div className="pt-8 border-t border-slate-850/60 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-white font-mono uppercase">
                                        Ready to start cataloging?
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        Sign up and log your first 10 cards in
                                        less than 2 minutes.
                                    </p>
                                </div>
                                {userEmail ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigate('/app');
                                        }}
                                        className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-3 px-8 text-xs font-mono cursor-pointer transition-all"
                                    >
                                        GO TO DASHBOARD
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onOpenRegister();
                                        }}
                                        className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-3 px-8 text-xs font-mono cursor-pointer transition-all"
                                    >
                                        BUILD YOUR FREE VAULT
                                    </button>
                                )}
                            </div>
                        </div>
        </motion.div>
    );
}
