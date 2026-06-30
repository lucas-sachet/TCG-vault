'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import type { LandingViewCommonProps } from './landingTypes';

export function LandingHomeCtaSection({
    navigate,
    userEmail,
    onOpenRegister,
    onOpenLogin,
}: LandingViewCommonProps) {
    return (
        <section className="relative rounded-3xl p-8 md:p-14 bg-gradient-to-tr from-[#0b0e14] to-[#121622] border border-slate-850/60 overflow-hidden shadow-2xl flex flex-col items-center text-center space-y-6">
                            <div className="absolute inset-0 bg-[#FFCB05]/3 blur-[80px] pointer-events-none" />

                            <Sparkles className="w-8 h-8 text-[#FFCB05] animate-bounce" />

                            <h2 className="text-2xl md:text-4xl font-extrabold text-white max-w-2xl leading-none font-mono uppercase tracking-tight">
                                Start Tracking Your Pokémon Portfolio Today
                            </h2>

                            <p className="text-slate-400 text-xs md:text-sm max-w-lg leading-relaxed">
                                Join thousands of collectors who manage their
                                physical assets with data-driven insights.
                                Create your account in under 30 seconds.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md pt-2">
                                {userEmail ? (
                                    <button
                                        type="button"
                                        onClick={() => navigate('/app')}
                                        className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-3.5 px-8 text-xs font-mono w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <span>GO TO DASHBOARD</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onOpenRegister();
                                            }}
                                            className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-3.5 px-8 text-xs font-mono w-full sm:w-auto cursor-pointer"
                                        >
                                            BUILD YOUR FREE VAULT
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onOpenLogin();
                                            }}
                                            className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-2xl py-3.5 px-8 text-xs font-bold font-mono w-full sm:w-auto cursor-pointer"
                                        >
                                            SIGN IN
                                        </button>
                                    </>
                                )}
                            </div>
                        </section>
    );
}
