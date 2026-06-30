import type { FormEvent } from 'react';

export type LandingView =
    | 'home'
    | 'about'
    | 'privacy'
    | 'features'
    | 'binders';

export type AuthMode = 'login' | 'register' | 'forgot';

export interface LandingPageProps {
    onAuthSuccess: (email: string) => void;
    currentPath: string;
    navigate: (to: string) => void;
    initialShowAuthModal?: boolean;
    clearInitialShowAuthModal?: () => void;
    userEmail: string | null;
}

export interface LandingNavigateProps {
    navigate: (to: string) => void;
    userEmail: string | null;
}

export interface LandingAuthOpeners {
    onOpenRegister: () => void;
    onOpenLogin: () => void;
}

export interface LandingViewCommonProps
    extends LandingNavigateProps,
        LandingAuthOpeners {}

export interface LandingHeaderProps extends LandingNavigateProps {
    activeView: LandingView;
    onOpenLogin: () => void;
    onOpenRegister: () => void;
}

export interface ShowcasePortfolioCard {
    name: string;
    set: string;
    number: string;
    purchasePrice: number;
    currentValue: number;
    image: string;
    rarity: string;
    condition: string;
}

export interface BinderDemoCard {
    slot: number;
    isEmpty?: boolean;
    name?: string;
    set?: string;
    number?: string;
    purchasePrice?: number;
    currentValue?: number;
    image?: string;
    condition?: string;
    roi?: number;
}

export interface UseLandingAuthOptions {
    onAuthSuccess: (email: string) => void;
    initialShowAuthModal?: boolean;
    clearInitialShowAuthModal?: () => void;
}

export interface LandingAuthModalProps {
    showAuthModal: boolean;
    setShowAuthModal: (show: boolean) => void;
    authMode: AuthMode;
    changeAuthMode: (mode: AuthMode) => void;
    email: string;
    setEmail: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    confirmPassword: string;
    setConfirmPassword: (value: string) => void;
    name: string;
    setName: (value: string) => void;
    nickname: string;
    setNickname: (value: string) => void;
    authError: string | null;
    setAuthError: (value: string | null) => void;
    isAuthLoading: boolean;
    isGoogleLoading: boolean;
    recoverySuccess: boolean;
    registrationPendingConfirmation: boolean;
    handleSubmittedAuth: (event: FormEvent) => void;
    handleGoogleSignIn: () => void;
}
