'use client';

import { ArrowRight } from 'lucide-react';
import type { LandingHeaderProps } from './landingTypes';

export function LandingHeader({
    activeView,
    navigate,
    userEmail,
    onOpenLogin,
    onOpenRegister,
}: LandingHeaderProps) {
    return (
        <nav className="sticky w-full mx-auto px-8 h-20 flex items-center justify-evenly border-b border-slate-900/80 z-40 bg-[#07090e]/60 backdrop-blur-md top-0">
            <button
                onClick={() => {
                    navigate('/');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 cursor-pointer select-none border-none bg-transparent focus:outline-none text-left"
            >
                <div className="p-1.5 rounded-lg bg-gradient-to-tr from-[#3B4CCA] to-[#FFCB05] text-white">
                    <svg
                        className="w-5.5 h-5.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1-15.5c2.48 0 4.5 2.02 4.5 4.5S15.48 15.5 13 15.5s-4.5-2.02-4.5-4.5 2.02-4.5 4.5-4.5zm-1 16c-3.87 0-7-3.13-7-7 0-.5.06-1 .17-1.47l4.31 4.31c1.1-.38 2.37.18 2.87 1.25.1.22.15.46.15.7l-.01.21h-.1c-.96 0-1.89-.39-2.58-1.08l-2.01-2.01c-.49-.49-1.28-.49-1.77 0-.49.49-.49 1.28 0 1.77l3.87 3.87C9.28 18.81 10.61 19 12 19c4.96 0 9-4.04 9-9h.5c0 4.96-4.04 9-9 9z" />
                    </svg>
                </div>
                <span className="text-lg font-black tracking-widest text-white font-mono uppercase">
                    Poké<span className="text-[#FFCB05]">Vault</span>
                </span>
            </button>

            <div className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider font-bold">
                <button
                    onClick={() => {
                        navigate('/features');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 ${activeView === 'features' ? 'text-[#FFCB05]' : 'text-slate-400 hover:text-white'}`}
                >
                    FEATURES
                </button>
                <button
                    onClick={() => {
                        navigate('/binders');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 ${activeView === 'binders' ? 'text-[#FFCB05]' : 'text-slate-400 hover:text-white'}`}
                >
                    BINDER DEMO
                </button>
                <button
                    onClick={() => {
                        navigate('/about');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 ${activeView === 'about' ? 'text-[#FFCB05]' : 'text-slate-400 hover:text-white'}`}
                >
                    ABOUT
                </button>
            </div>

            <div className="flex items-center gap-4">
                {userEmail ? (
                    <button
                        type="button"
                        onClick={() => navigate('/app')}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black px-5 py-2.5 shadow-lg shadow-indigo-600/20 border border-indigo-500/40 transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
                    >
                        <span>GO TO DASHBOARD</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={onOpenLogin}
                            className="text-slate-300 hover:text-white text-xs font-bold font-mono tracking-wider px-4 py-2 transition-colors cursor-pointer"
                        >
                            SIGN IN
                        </button>

                        <button
                            type="button"
                            onClick={onOpenRegister}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black px-5 py-2.5 shadow-lg shadow-indigo-600/20 border border-indigo-500/40 transition-all active:scale-[0.98] cursor-pointer"
                        >
                            BUILD YOUR FREE VAULT
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
