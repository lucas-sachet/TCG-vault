'use client';

import type { LandingAuthModalProps } from './landingTypes';

export function LandingAuthModalSsoFooter({
    authMode,
    changeAuthMode,
    isAuthLoading,
    isGoogleLoading,
    recoverySuccess,
    handleGoogleSignIn,
}: LandingAuthModalProps) {
    return (
        <>
                                        {/* Authentication Divider (External / Google SSO support) */}
                                        {!recoverySuccess &&
                                            authMode !== 'forgot' && (
                                                <div className="space-y-3">
                                                    <div className="relative flex py-2 items-center">
                                                        <div className="flex-grow border-t border-slate-850/60"></div>
                                                        <span className="flex-shrink mx-3 text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                                                            OR CONTINUE WITH SSO
                                                        </span>
                                                        <div className="flex-grow border-t border-slate-850/60"></div>
                                                    </div>

                                                    {/* Premium Google Auth Button */}
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleGoogleSignIn
                                                        }
                                                        disabled={
                                                            isAuthLoading ||
                                                            isGoogleLoading
                                                        }
                                                        className="w-full bg-[#151720] hover:bg-[#1E212A] border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl py-3.5 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer selection:bg-transparent"
                                                    >
                                                        <svg
                                                            className="w-4 h-4 shrink-0"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                                fill="#4285F4"
                                                            />
                                                            <path
                                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                                fill="#34A853"
                                                            />
                                                            <path
                                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                                                fill="#FBBC05"
                                                            />
                                                            <path
                                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                                                fill="#EA4335"
                                                            />
                                                        </svg>
                                                        <span className="font-mono text-[10px] tracking-wider uppercase font-extrabold text-slate-300">
                                                            Sign in with Google
                                                            Account
                                                        </span>
                                                    </button>
                                                </div>
                                            )}

                                        {/* Footer Nav Links */}
                                        <div className="text-center pt-1">
                                            {authMode === 'login' && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        changeAuthMode(
                                                            'register',
                                                        )
                                                    }
                                                    className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer block w-full select-none"
                                                >
                                                    New to PokéVault?{' '}
                                                    <span className="text-[#FFCB05] font-bold underline font-mono">
                                                        Create a free account
                                                    </span>
                                                </button>
                                            )}

                                            {authMode === 'register' && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        changeAuthMode('login')
                                                    }
                                                    className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer block w-full select-none"
                                                >
                                                    Already have an account?{' '}
                                                    <span className="text-[#FFCB05] font-bold underline font-mono">
                                                        Sign In
                                                    </span>
                                                </button>
                                            )}

                                            {authMode === 'forgot' && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        changeAuthMode('login')
                                                    }
                                                    className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer block w-full select-none"
                                                >
                                                    Remember your password?{' '}
                                                    <span className="text-[#FFCB05] font-bold underline font-mono">
                                                        Back to Sign In
                                                    </span>
                                                </button>
                                            )}
                                        </div>
        </>
    );
}
