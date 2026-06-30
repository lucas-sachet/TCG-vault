'use client';

import { motion } from 'motion/react';
import { ArrowLeft, Compass, Plus } from 'lucide-react';
import { TiltCard } from './TiltCard';
import { binderDemoCards } from './showcaseData';
import type { LandingViewCommonProps } from './landingTypes';

export function LandingBindersView({
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

                        <div className="bg-[#0c0e14]/90 border border-slate-850/80 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-10">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3B4CCA] via-[#FFCB05] to-indigo-500" />

                            <div className="space-y-3 text-center md:text-left">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/50 border border-indigo-500/20 text-[#FFCB05] rounded-full font-mono text-[9px] tracking-widest uppercase font-bold">
                                    <Compass className="w-3.5 h-3.5" />
                                    <span>INTERACTIVE PLAYGROUND</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-white font-mono uppercase tracking-tight">
                                    Kanto Chase Binders V1
                                </h1>
                                <p className="text-slate-400 text-sm max-w-2xl">
                                    Tactile binder visualization simulating
                                    pocket page sheets. Hover and move your
                                    cursor over cards to view holographic sheens
                                    and live ROI analytics.
                                </p>
                            </div>

                            {/* Binder Stats Summary Banner */}
                            <div className="bg-slate-950/80 rounded-2xl border border-slate-850 p-5 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                {/* Stats 1: Progress */}
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                        <span>SHEET COMPLETION</span>
                                        <span className="text-[#FFCB05] font-bold">
                                            7 / 9 SLOTS (77.8%)
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
                                            style={{ width: '77.8%' }}
                                        />
                                    </div>
                                </div>

                                <div className="w-px h-10 bg-slate-850 hidden md:block" />

                                {/* Stats 2: Financial Aggregates */}
                                <div className="grid grid-cols-3 gap-2 col-span-1 md:col-span-2 text-center md:text-left font-mono">
                                    <div>
                                        <span className="text-[8px] text-slate-500 block">
                                            TOTAL VALUE
                                        </span>
                                        <span className="text-sm font-extrabold text-white block mt-1">
                                            $2,515.00
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] text-slate-500 block">
                                            COST BASIS
                                        </span>
                                        <span className="text-sm font-extrabold text-slate-400 block mt-1">
                                            $1,200.00
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] text-slate-500 block">
                                            NET ROI
                                        </span>
                                        <span className="text-sm font-black text-green-400 block mt-1">
                                            +109.6%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 3x3 Binder Layout Wrapper */}
                            <div className="flex justify-center pt-2">
                                <div className="relative flex bg-[#161a22] border border-slate-800/80 rounded-2xl p-4 md:p-8 shadow-2xl max-w-4xl w-full">
                                    {/* Binder ring hole sidebar */}
                                    <div className="hidden md:flex flex-col justify-around items-center pr-6 border-r border-slate-850 w-8">
                                        <div className="w-4.5 h-4.5 rounded-full bg-[#0c0e14] border border-slate-800/80 shadow-inner flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-black/40" />
                                        </div>
                                        <div className="w-4.5 h-4.5 rounded-full bg-[#0c0e14] border border-slate-800/80 shadow-inner flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-black/40" />
                                        </div>
                                        <div className="w-4.5 h-4.5 rounded-full bg-[#0c0e14] border border-slate-800/80 shadow-inner flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-black/40" />
                                        </div>
                                    </div>

                                    {/* 3x3 grid */}
                                    <div className="grid grid-cols-3 gap-3 md:gap-6 flex-grow md:pl-6">
                                        {binderDemoCards.map((card, index) => {
                                            if (card.isEmpty) {
                                                return (
                                                    <motion.div
                                                        key={index}
                                                        whileHover={{
                                                            scale: 1.015,
                                                        }}
                                                        onClick={() => {
                                                            if (userEmail) {
                                                                navigate('/app');
                                                            } else {
                                                                onOpenRegister();
                                                            }
                                                        }}
                                                        className="relative aspect-[3/4.2] rounded-2xl border-2 border-dashed border-slate-800 bg-[#0c0e14]/50 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:border-indigo-500/30 hover:bg-[#0c0e14]/70 transition-all select-none group"
                                                    >
                                                        <div className="w-12 h-16 rounded border border-dashed border-slate-850/60 flex items-center justify-center text-slate-700 bg-slate-950/20 group-hover:text-indigo-400/50 group-hover:border-indigo-500/20 transition-colors">
                                                            <svg
                                                                className="w-6 h-6"
                                                                fill="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                                            </svg>
                                                        </div>

                                                        <span className="text-[8px] text-slate-600 font-mono font-bold tracking-wider mt-4 block group-hover:text-indigo-400 transition-colors uppercase">
                                                            Awaiting Chase
                                                        </span>

                                                        <div className="mt-3 w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-[#FFCB05] group-hover:border-[#FFCB05] group-hover:shadow-lg group-hover:shadow-[#FFCB05]/10 transition-all">
                                                            <Plus className="w-4 h-4" />
                                                        </div>
                                                    </motion.div>
                                                );
                                            }

                                            return (
                                                <TiltCard
                                                    key={index}
                                                    name={card.name!}
                                                    set={card.set!}
                                                    number={card.number!}
                                                    purchasePrice={card.purchasePrice!}
                                                    currentValue={card.currentValue!}
                                                    image={card.image!}
                                                    condition={card.condition!}
                                                    roi={card.roi!}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            {/* Bottom Action Footer inside binder demo */}
                            <div className="pt-8 border-t border-slate-850/60 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-1 text-center md:text-left">
                                    <h4 className="text-sm font-bold text-white font-mono uppercase">
                                        Track your own binders online
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        Create multiple sheets, customize layout
                                        options, and see aggregate stats
                                        instantly.
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
                                        START YOUR COLLECTION
                                    </button>
                                )}
                            </div>
                        </div>
        </motion.div>
    );
}
