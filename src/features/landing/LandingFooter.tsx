'use client';

import { ArrowUpRight } from 'lucide-react';

interface LandingFooterProps {
    navigate: (to: string) => void;
}

export function LandingFooter({ navigate }: LandingFooterProps) {
    return (
        <footer className="relative w-full px-8 mt-20 pt-8 border-t border-slate-900/80 z-40 bg-[#07090e]/60 text-slate-500 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 items-start">
                <div className="md:col-span-6 space-y-4">
                    <div className="flex items-center gap-2 select-none">
                        <div className="p-1 rounded bg-slate-900 text-slate-400">
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1-15.5c2.48 0 4.5 2.02 4.5 4.5S15.48 15.5 13 15.5s-4.5-2.02-4.5-4.5 2.02-4.5 4.5-4.5zm-1 16c-3.87 0-7-3.13-7-7 0-.5.06-1 .17-1.47l4.31 4.31c1.1-.38 2.37.18 2.87 1.25.1.22.15.46.15.7l-.01.21h-.1c-.96 0-1.89-.39-2.58-1.08l-2.01-2.01c-.49-.49-1.28-.49-1.77 0-.49.49-.49 1.28 0 1.77l3.87 3.87C9.28 18.81 10.61 19 12 19c4.96 0 9-4.04 9-9h.5c0 4.96-4.04 9-9 9z" />
                            </svg>
                        </div>
                        <span className="font-bold tracking-widest text-slate-300 font-mono text-sm uppercase">
                            Poké
                            <span className="text-[#FFCB05]/80">Vault</span>
                        </span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-slate-500 max-w-md">
                        © 2026 PokéVault. All original content protected by
                        copyright.
                    </p>

                    <p className="text-[10px] leading-relaxed text-slate-600 font-semibold">
                        Pokémon TCG and its respective properties are copyrights
                        of and trademarks of © Pokémon / Nintendo / Creatures /
                        Game Freak. PokéVault is an independent fan site and is
                        not affiliated with, sponsored by, or endorsed by
                        Pokémon or Nintendo. Visit the{' '}
                        <a
                            href="https://www.pokemon.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white transition-colors underline inline-flex items-center gap-0.5"
                        >
                            official website{' '}
                            <ArrowUpRight className="w-2.5 h-2.5 inline" />
                        </a>
                        .
                    </p>
                </div>

                <div className="md:col-span-3 space-y-3">
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-bold">
                        Navigation
                    </span>
                    <ul className="space-y-2 text-[11px]">
                        <li>
                            <button
                                onClick={() => {
                                    navigate('/');
                                    window.scrollTo({
                                        top: 0,
                                        behavior: 'smooth',
                                    });
                                }}
                                className="hover:text-white transition-colors cursor-pointer block bg-transparent border-none p-0 text-slate-500 text-left"
                            >
                                Home / Vault Engine
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => {
                                    navigate('/features');
                                    window.scrollTo({
                                        top: 0,
                                        behavior: 'smooth',
                                    });
                                }}
                                className="hover:text-white transition-colors cursor-pointer block bg-transparent border-none p-0 text-slate-500 text-left"
                            >
                                Product Features
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => {
                                    navigate('/binders');
                                    window.scrollTo({
                                        top: 0,
                                        behavior: 'smooth',
                                    });
                                }}
                                className="hover:text-white transition-colors cursor-pointer block bg-transparent border-none p-0 text-slate-500 text-left"
                            >
                                Interactive Binder Demo
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => {
                                    navigate('/about');
                                    window.scrollTo({
                                        top: 0,
                                        behavior: 'smooth',
                                    });
                                }}
                                className="hover:text-white transition-colors cursor-pointer block bg-transparent border-none p-0 text-slate-500 text-left"
                            >
                                About PokéVault
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => {
                                    navigate('/privacy');
                                    window.scrollTo({
                                        top: 0,
                                        behavior: 'smooth',
                                    });
                                }}
                                className="hover:text-white transition-colors cursor-pointer block bg-transparent border-none p-0 text-slate-500 text-left"
                            >
                                Privacy Policy & LGPD
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="md:col-span-3 space-y-3">
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-bold">
                        System Status
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-green-500 font-mono bg-green-950/10 border border-green-900/20 px-3 py-1.5 rounded-xl w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                        <span>All Systems Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
