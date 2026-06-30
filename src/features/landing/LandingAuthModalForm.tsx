'use client';

import type { LandingAuthModalProps } from './landingTypes';
import { LandingAuthModalFields } from './LandingAuthModalFields';
import { LandingAuthModalSsoFooter } from './LandingAuthModalSsoFooter';

export function LandingAuthModalForm(props: LandingAuthModalProps) {
    const { isAuthLoading, isGoogleLoading } = props;

    if (isAuthLoading || isGoogleLoading) {
        return (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                    <div className="absolute inset-0 rounded-full border-4 border-[#FFCB05] border-t-transparent animate-spin" />
                </div>
                <div className="text-center">
                    <p className="text-xs text-white font-bold font-mono tracking-wider animate-pulse uppercase">
                        {isGoogleLoading
                            ? 'Authenticating with Google...'
                            : 'Signing you in...'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                        Please wait while we establish secure connections...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <LandingAuthModalFields {...props} />
            <LandingAuthModalSsoFooter {...props} />
        </>
    );
}
