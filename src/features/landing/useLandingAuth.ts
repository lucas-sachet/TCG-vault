'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { supabase } from '@/src/services/supabaseClient';
import type { AuthMode, UseLandingAuthOptions } from './landingTypes';

export function useLandingAuth({
    onAuthSuccess,
    initialShowAuthModal,
    clearInitialShowAuthModal,
}: UseLandingAuthOptions) {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>('register');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [authError, setAuthError] = useState<string | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [recoverySuccess, setRecoverySuccess] = useState(false);
    const [registrationPendingConfirmation, setRegistrationPendingConfirmation] =
        useState(false);
    const [showConsentBanner, setShowConsentBanner] = useState(false);

    useEffect(() => {
        setShowConsentBanner(
            !localStorage.getItem('pokevault_cookie_consent'),
        );
    }, []);

    useEffect(() => {
        if (initialShowAuthModal) {
            setAuthMode('login');
            setShowAuthModal(true);
            if (clearInitialShowAuthModal) {
                clearInitialShowAuthModal();
            }
        }
    }, [initialShowAuthModal, clearInitialShowAuthModal]);

    const changeAuthMode = (mode: AuthMode) => {
        setAuthMode(mode);
        setAuthError(null);
        setRecoverySuccess(false);
        setRegistrationPendingConfirmation(false);
        setPassword('');
        setConfirmPassword('');
    };

    const finalizeAuthenticatedSession = (authenticatedEmail: string) => {
        setShowAuthModal(false);
        setRegistrationPendingConfirmation(false);
        onAuthSuccess(authenticatedEmail);
    };

    const openLogin = () => {
        changeAuthMode('login');
        setShowAuthModal(true);
    };

    const openRegister = () => {
        changeAuthMode('register');
        setShowAuthModal(true);
    };

    const handleSubmittedAuth = (event: FormEvent) => {
        event.preventDefault();
        setAuthError(null);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (authMode !== 'forgot' && (!email.trim() || !password.trim())) {
            setAuthError('Please fill in all credentials.');
            return;
        }

        if (!emailRegex.test(email.trim())) {
            setAuthError('Please enter a valid email address.');
            return;
        }

        if (authMode === 'register') {
            if (!name.trim()) {
                setAuthError('A Display Name is required.');
                return;
            }
            if (password.length < 6) {
                setAuthError('Passwords must be at least 6 characters.');
                return;
            }
            if (password !== confirmPassword) {
                setAuthError('Passwords must match exactly.');
                return;
            }

            setIsAuthLoading(true);
            supabase.auth
                .signUp({
                    email: email.trim(),
                    password: password,
                    options: {
                        data: {
                            display_name: name.trim(),
                            nickname: nickname.trim() || undefined,
                        },
                    },
                })
                .then(({ data, error }) => {
                    setIsAuthLoading(false);
                    if (error) {
                        setAuthError(error.message);
                        return;
                    }

                    if (data.session && data.user?.email) {
                        finalizeAuthenticatedSession(data.user.email);
                        return;
                    }

                    if (data.user && !data.session) {
                        setRegistrationPendingConfirmation(true);
                        return;
                    }

                    setAuthError(
                        'Account could not be created. Please try again.',
                    );
                })
                .catch(error => {
                    setIsAuthLoading(false);
                    setAuthError(
                        error.message || 'An unexpected error occurred.',
                    );
                });
            return;
        }

        if (authMode === 'forgot') {
            if (!email.trim()) {
                setAuthError('Please enter your registered email address.');
                return;
            }
            setIsAuthLoading(true);
            supabase.auth
                .resetPasswordForEmail(email.trim(), {
                    redirectTo: window.location.origin,
                })
                .then(({ error }) => {
                    setIsAuthLoading(false);
                    if (error) {
                        setAuthError(error.message);
                    } else {
                        setRecoverySuccess(true);
                    }
                })
                .catch(error => {
                    setIsAuthLoading(false);
                    setAuthError(
                        error.message || 'An unexpected error occurred.',
                    );
                });
            return;
        }

        setIsAuthLoading(true);
        supabase.auth
            .signInWithPassword({
                email: email.trim(),
                password: password,
            })
            .then(({ data, error }) => {
                setIsAuthLoading(false);
                if (error) {
                    setAuthError(error.message);
                    return;
                }

                if (data.session && data.user?.email) {
                    finalizeAuthenticatedSession(data.user.email);
                }
            })
            .catch(error => {
                setIsAuthLoading(false);
                setAuthError(error.message || 'An unexpected error occurred.');
            });
    };

    const handleGoogleSignIn = () => {
        setAuthError(null);
        setIsGoogleLoading(true);
        supabase.auth
            .signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                },
            })
            .catch(error => {
                setIsGoogleLoading(false);
                setAuthError(
                    error.message || 'Failed to initialize Google Sign In',
                );
            });
    };

    const acceptCookies = () => {
        localStorage.setItem('pokevault_cookie_consent', 'true');
        setShowConsentBanner(false);
    };

    return {
        showAuthModal,
        setShowAuthModal,
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
        isAuthLoading,
        isGoogleLoading,
        recoverySuccess,
        registrationPendingConfirmation,
        showConsentBanner,
        setShowConsentBanner,
        acceptCookies,
        openLogin,
        openRegister,
        handleSubmittedAuth,
        handleGoogleSignIn,
    };
}
