'use client';

import { motion } from 'motion/react';
import { ArrowLeft, Shield } from 'lucide-react';

interface LandingPrivacyViewProps {
    navigate: (to: string) => void;
}

export function LandingPrivacyView({ navigate }: LandingPrivacyViewProps) {
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
                                    <Shield className="w-3.5 h-3.5" />
                                    <span>REGULATORY COMPLIANCE</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-white font-mono uppercase tracking-tight">
                                    Privacy Policy & LGPD
                                </h1>
                                <p className="text-slate-500 text-xs font-mono">
                                    Last updated: June 2026
                                </p>
                            </div>

                            <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-sm leading-relaxed">
                                <p>
                                    At PokéVault, we respect your privacy and
                                    are committed to protecting your personal
                                    data in accordance with the Brazilian
                                    General Data Protection Law (LGPD - Lei
                                    Geral de Proteção de Dados, Lei nº
                                    13.709/2018).
                                </p>

                                <section className="space-y-3">
                                    <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                                        1. Data We Collect
                                    </h2>
                                    <p>
                                        We collect and process the following
                                        information to manage your digital
                                        vault:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>
                                            <strong>
                                                Account Credentials:
                                            </strong>{' '}
                                            Your email, display name, and
                                            optional nickname, stored securely
                                            via Supabase.
                                        </li>
                                        <li>
                                            <strong>TCG Holdings Data:</strong>{' '}
                                            Card quantities, purchase price,
                                            conditions, card cert numbers,
                                            custom binders, and wishlist chases.
                                        </li>
                                    </ul>
                                </section>

                                <section className="space-y-3">
                                    <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                                        2. Legal Grounds & Usage
                                    </h2>
                                    <p>
                                        We process your data strictly to run
                                        your personal dashboard, calculate
                                        portfolio ROI, and provide analytical
                                        tools. We do not sell, rent, or
                                        distribute your personal details to
                                        third parties or marketing brokers.
                                    </p>
                                </section>

                                <section className="space-y-3">
                                    <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                                        3. Cookies & Local Storage
                                    </h2>
                                    <p>
                                        We use essential cookie keys and browser
                                        local storage configurations to verify
                                        user sessions, secure connection routes,
                                        and remember your cookie banner settings
                                        (`pokevault_cookie_consent`).
                                    </p>
                                </section>

                                <section className="space-y-3">
                                    <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                                        4. Your LGPD Rights
                                    </h2>
                                    <p>
                                        Under LGPD articles, you retain full
                                        ownership of your data and can request
                                        access, corrections, transfers, or
                                        absolute deletion. You can permanently
                                        erase all account records instantly by
                                        using the <strong>Purge Account</strong>{' '}
                                        button found under the Settings Tab.
                                    </p>
                                </section>

                                <section className="space-y-3">
                                    <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                                        5. Security Measures
                                    </h2>
                                    <p>
                                        Our platform leverages Supabase
                                        authentication systems and database
                                        security rules to safeguard physical
                                        collection details against data leaks,
                                        unauthorized access, or manipulation.
                                    </p>
                                </section>
                            </div>

                            <div className="pt-6 border-t border-slate-850/60 flex justify-start">
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigate('/');
                                        window.scrollTo({
                                            top: 0,
                                            behavior: 'smooth',
                                        });
                                    }}
                                    className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-2xl py-3 px-6 text-xs font-mono cursor-pointer transition-all"
                                >
                                    RETURN TO HOME
                                </button>
                            </div>
                        </div>
        </motion.div>
    );
}
