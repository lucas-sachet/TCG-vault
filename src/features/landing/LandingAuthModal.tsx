'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { LandingAuthModalForm } from './LandingAuthModalForm';
import type { LandingAuthModalProps } from './landingTypes';

export function LandingAuthModal({
    showAuthModal,
    setShowAuthModal,
    isAuthLoading,
    isGoogleLoading,
    authMode,
    ...formProps
}: LandingAuthModalProps) {
    return (
        <AnimatePresence>
            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.65 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            if (!isAuthLoading && !isGoogleLoading) {
                                setShowAuthModal(false);
                            }
                        }}
                        className="fixed inset-0 bg-[#05070a]/95 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.95, y: 15, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 15, opacity: 0 }}
                        className="relative w-full max-w-md bg-[#0c0e14] border border-slate-850 rounded-3xl p-6 shadow-2xl overflow-hidden z-50 flex flex-col justify-between"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3B4CCA] via-[#FFCB05] to-indigo-500" />

                        <div className="space-y-5">
                            <div className="flex justify-between items-center pb-2">
                                <div className="flex items-center gap-1.5">
                                    <Lock className="w-4 h-4 text-slate-500" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest">
                                        {authMode === 'login' && 'WELCOME BACK'}
                                        {authMode === 'register' &&
                                            'CREATE YOUR VAULT'}
                                        {authMode === 'forgot' &&
                                            'RESET PASSWORD'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowAuthModal(false)}
                                    disabled={isAuthLoading || isGoogleLoading}
                                    className="p-1 px-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Close
                                </button>
                            </div>

                            <LandingAuthModalForm
                                showAuthModal={showAuthModal}
                                setShowAuthModal={setShowAuthModal}
                                authMode={authMode}
                                isAuthLoading={isAuthLoading}
                                isGoogleLoading={isGoogleLoading}
                                {...formProps}
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
