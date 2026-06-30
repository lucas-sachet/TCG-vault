'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type {
    LandingPageProps,
    LandingView,
} from '@/src/features/landing/landingTypes';
import { useLandingAuth } from '@/src/features/landing/useLandingAuth';
import { LandingHeader } from '@/src/features/landing/LandingHeader';
import { LandingFooter } from '@/src/features/landing/LandingFooter';
import { LandingHomeView } from '@/src/features/landing/LandingHomeView';
import { LandingAboutView } from '@/src/features/landing/LandingAboutView';
import { LandingPrivacyView } from '@/src/features/landing/LandingPrivacyView';
import { LandingFeaturesView } from '@/src/features/landing/LandingFeaturesView';
import { LandingBindersView } from '@/src/features/landing/LandingBindersView';
import { LandingCookieConsent } from '@/src/features/landing/LandingCookieConsent';
import { LandingAuthModal } from '@/src/features/landing/LandingAuthModal';

function resolveActiveView(currentPath: string): LandingView {
    if (currentPath === '/about') return 'about';
    if (currentPath === '/privacy') return 'privacy';
    if (currentPath === '/features') return 'features';
    if (currentPath === '/binders') return 'binders';
    return 'home';
}

export const LandingPage: React.FC<LandingPageProps> = ({
    onAuthSuccess,
    currentPath,
    navigate,
    initialShowAuthModal,
    clearInitialShowAuthModal,
    userEmail,
}) => {
    const auth = useLandingAuth({
        onAuthSuccess,
        initialShowAuthModal,
        clearInitialShowAuthModal,
    });

    const activeView = resolveActiveView(currentPath);
    const viewProps = {
        navigate,
        userEmail,
        onOpenRegister: auth.openRegister,
        onOpenLogin: auth.openLogin,
        changeAuthMode: auth.changeAuthMode,
        setShowAuthModal: auth.setShowAuthModal,
    };

    return (
        <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans relative overflow-hidden selection:bg-[#FFCB05] selection:text-slate-900">
            <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full bg-linear-to-br from-indigo-900/20 to-blue-900/10 blur-[120px] pointer-events-none" />
            <div className="absolute top-[30%] right-[-10%] w-[50%] h-[45%] rounded-full bg-linear-to-br from-[#3B4CCA]/10 to-[#FFCB05]/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[0%] left-[10%] w-[60%] h-[35%] rounded-full bg-linear-to-br from-purple-900/10 to-indigo-950/20 blur-[130px] pointer-events-none" />

            <LandingHeader
                activeView={activeView}
                navigate={navigate}
                userEmail={userEmail}
                onOpenLogin={auth.openLogin}
                onOpenRegister={auth.openRegister}
            />

            <main className="relative max-w-7xl mx-auto px-6 pt-12 md:pt-20 space-y-32">
                {activeView === 'home' && <LandingHomeView {...viewProps} />}
                {activeView === 'about' && <LandingAboutView {...viewProps} />}
                {activeView === 'privacy' && (
                    <LandingPrivacyView {...viewProps} />
                )}
                {activeView === 'features' && (
                    <LandingFeaturesView {...viewProps} />
                )}
                {activeView === 'binders' && (
                    <LandingBindersView {...viewProps} />
                )}
            </main>

            <LandingFooter navigate={navigate} />

            <LandingCookieConsent
                showConsentBanner={auth.showConsentBanner}
                onAcceptCookies={auth.acceptCookies}
                navigate={navigate}
            />

            <LandingAuthModal
                showAuthModal={auth.showAuthModal}
                setShowAuthModal={auth.setShowAuthModal}
                authMode={auth.authMode}
                changeAuthMode={auth.changeAuthMode}
                email={auth.email}
                setEmail={auth.setEmail}
                password={auth.password}
                setPassword={auth.setPassword}
                confirmPassword={auth.confirmPassword}
                setConfirmPassword={auth.setConfirmPassword}
                name={auth.name}
                setName={auth.setName}
                nickname={auth.nickname}
                setNickname={auth.setNickname}
                authError={auth.authError}
                setAuthError={auth.setAuthError}
                isAuthLoading={auth.isAuthLoading}
                isGoogleLoading={auth.isGoogleLoading}
                recoverySuccess={auth.recoverySuccess}
                registrationPendingConfirmation={
                    auth.registrationPendingConfirmation
                }
                handleSubmittedAuth={auth.handleSubmittedAuth}
                handleGoogleSignIn={auth.handleGoogleSignIn}
            />
        </div>
    );
};
