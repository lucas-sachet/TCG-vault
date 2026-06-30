'use client';

import {
    CheckCircle2,
    Lock,
    Mail,
    ShieldCheck,
    Sparkles,
    User,
} from 'lucide-react';
import type { LandingAuthModalProps } from './landingTypes';

export function LandingAuthModalFields({
    authMode,
    changeAuthMode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    name,
    setName,
    nickname,
    setNickname,
    authError,
    setAuthError,
    recoverySuccess,
    registrationPendingConfirmation,
    handleSubmittedAuth,
}: LandingAuthModalProps) {
    return (
        <>
                                {/* Main Titles */}
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
                                        {authMode === 'login' && 'Unlock Vault'}
                                        {authMode === 'register' &&
                                            'Create Vault Account'}
                                        {authMode === 'forgot' &&
                                            'Reset Password'}
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                                        {authMode === 'login' &&
                                            'Sign in to access your digital vault and collection dashboard.'}
                                        {authMode === 'register' &&
                                            'Start tracking, valuing, and organizing your TCG assets today.'}
                                        {authMode === 'forgot' &&
                                            'Enter your registered email address to receive password reset instructions.'}
                                    </p>
                                </div>

                                {/* Error Banner state */}
                                {authError && (
                                    <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-xs flex items-start gap-2 animate-feed-in font-semibold">
                                        <span className="shrink-0 block text-sm mt-0.5">
                                            ⚠️
                                        </span>
                                        <span>{authError}</span>
                                    </div>
                                )}

                                {/* Success Banner (for recovery) */}
                                {recoverySuccess && authMode === 'forgot' && (
                                    <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl text-emerald-400 text-xs space-y-3">
                                        <div className="flex items-center gap-2 font-bold font-mono">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span>RESET LINK SENT</span>
                                        </div>
                                        <p className="leading-relaxed">
                                            A password reset link has been sent
                                            to{' '}
                                            <span className="font-bold underline text-white">
                                                {email}
                                            </span>
                                            . Click the link within the next 15
                                            minutes to set a new password.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeAuthMode('login')
                                            }
                                            className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-300 font-mono transition-all uppercase cursor-pointer"
                                        >
                                            Return to Sign In
                                        </button>
                                    </div>
                                )}

                                {registrationPendingConfirmation &&
                                    authMode === 'register' && (
                                        <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl text-emerald-400 text-xs space-y-3">
                                            <div className="flex items-center gap-2 font-bold font-mono">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                                <span>CONFIRM YOUR EMAIL</span>
                                            </div>
                                            <p className="leading-relaxed">
                                                Your vault account was created.
                                                We sent a confirmation link to{' '}
                                                <span className="font-bold underline text-white">
                                                    {email}
                                                </span>
                                                . Open that email and click the
                                                link to activate your account,
                                                then sign in.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    changeAuthMode('login')
                                                }
                                                className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-300 font-mono transition-all uppercase cursor-pointer"
                                            >
                                                Go to Sign In
                                            </button>
                                        </div>
                                    )}
            {!recoverySuccess && !registrationPendingConfirmation && (
                                            <form
                                                onSubmit={handleSubmittedAuth}
                                                className="space-y-4"
                                            >
                                                {/* 1. DISPLAY NAME - Only for Register */}
                                                {authMode === 'register' && (
                                                    <div className="space-y-3">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">
                                                                Display Name
                                                            </label>
                                                            <div className="relative">
                                                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Professor Oak"
                                                                    value={name}
                                                                    onChange={e => {
                                                                        setName(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                        if (
                                                                            authError
                                                                        )
                                                                            setAuthError(
                                                                                null,
                                                                            );
                                                                    }}
                                                                    className="w-full bg-[#151720] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">
                                                                Nickname
                                                                (Optional)
                                                            </label>
                                                            <div className="relative">
                                                                <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Oaky (used for personal greetings)"
                                                                    value={
                                                                        nickname
                                                                    }
                                                                    onChange={e => {
                                                                        setNickname(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                        if (
                                                                            authError
                                                                        )
                                                                            setAuthError(
                                                                                null,
                                                                            );
                                                                    }}
                                                                    className="w-full bg-[#151720] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 2. EMAIL ADDRESS - All Views */}
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">
                                                        Email Address
                                                    </label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                        <input
                                                            type="email"
                                                            placeholder="collector@pokevault.com"
                                                            value={email}
                                                            onChange={e => {
                                                                setEmail(
                                                                    e.target
                                                                        .value,
                                                                );
                                                                if (authError)
                                                                    setAuthError(
                                                                        null,
                                                                    );
                                                            }}
                                                            className="w-full bg-[#151720] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* 3. PASSWORD - Login and Register */}
                                                {authMode !== 'forgot' && (
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between items-center">
                                                            <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold font-medium">
                                                                Password
                                                            </label>
                                                            {authMode ===
                                                                'login' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        changeAuthMode(
                                                                            'forgot',
                                                                        )
                                                                    }
                                                                    className="text-[9px] text-indigo-400 hover:text-indigo-300 font-mono uppercase underline cursor-pointer"
                                                                >
                                                                    Forgot
                                                                    Password?
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                            <input
                                                                type="password"
                                                                placeholder="••••••••"
                                                                value={password}
                                                                onChange={e => {
                                                                    setPassword(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                    if (
                                                                        authError
                                                                    )
                                                                        setAuthError(
                                                                            null,
                                                                        );
                                                                }}
                                                                className="w-full bg-[#151720] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20 font-mono"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 4. CONFIRM PASSWORD - Register Only */}
                                                {authMode === 'register' && (
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold font-medium">
                                                            Confirm Password
                                                        </label>
                                                        <div className="relative">
                                                            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                            <input
                                                                type="password"
                                                                placeholder="••••••••"
                                                                value={
                                                                    confirmPassword
                                                                }
                                                                onChange={e => {
                                                                    setConfirmPassword(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                    if (
                                                                        authError
                                                                    )
                                                                        setAuthError(
                                                                            null,
                                                                        );
                                                                }}
                                                                className="w-full bg-[#151720] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20 font-mono"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Main Submission Action Button */}
                                                <button
                                                    type="submit"
                                                    className="w-full bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 hover:shadow-lg hover:shadow-yellow-500/10 rounded-xl py-3 text-xs font-black font-mono tracking-wider transition-all select-none cursor-pointer mt-2"
                                                >
                                                    {authMode === 'login' &&
                                                        'OPEN DIGITAL VAULT'}
                                                    {authMode === 'register' &&
                                                        'CREATE VAULT ACCOUNT'}
                                                    {authMode === 'forgot' &&
                                                        'SEND RESET LINK'}
                                                </button>
                                            </form>
            )}
        </>
    );
}
