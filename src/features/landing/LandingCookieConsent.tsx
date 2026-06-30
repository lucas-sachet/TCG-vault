'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Shield } from 'lucide-react';

interface LandingCookieConsentProps {
    showConsentBanner: boolean;
    navigate: (to: string) => void;
    onAcceptCookies: () => void;
}

export function LandingCookieConsent({
    showConsentBanner,
    navigate,
    onAcceptCookies,
}: LandingCookieConsentProps) {
    return (
        <AnimatePresence>
            {showConsentBanner && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 bg-[#0c0e14]/95 border border-slate-850 shadow-2xl p-5 rounded-2xl backdrop-blur-xl flex flex-col gap-3"
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 shrink-0 w-9 h-9 flex items-center justify-center">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                                Cookie & Privacy Notice
                            </h4>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                                We use essential cookies to manage authentication
                                and preserve configuration parameters. Read our
                                details in the{' '}
                                <button
                                    onClick={() => {
                                        navigate('/privacy');
                                        window.scrollTo({
                                            top: 0,
                                            behavior: 'smooth',
                                        });
                                    }}
                                    className="text-[#FFCB05] underline font-bold hover:text-yellow-400 cursor-pointer bg-transparent border-none p-0 inline font-sans text-[11px]"
                                >
                                    Privacy & LGPD Policy
                                </button>
                                .
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-1">
                        <button
                            type="button"
                            onClick={() => {
                                navigate('/privacy');
                                window.scrollTo({
                                    top: 0,
                                    behavior: 'smooth',
                                });
                            }}
                            className="px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:text-white font-mono uppercase cursor-pointer border-none bg-transparent"
                        >
                            Review Policy
                        </button>
                        <button
                            type="button"
                            onClick={onAcceptCookies}
                            className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black px-4 py-1.5 rounded-lg text-[10px] font-mono tracking-wide cursor-pointer transition-all border-none"
                        >
                            Accept Cookies
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
