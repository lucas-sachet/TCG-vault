/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../services/supabaseClient';
import { 
  Sparkles, 
  TrendingUp, 
  FolderLock, 
  Layers, 
  Compass, 
  LineChart, 
  Heart, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  PieChart, 
  ChevronRight,
  Database,
  Coins,
  QrCode,
  ArrowLeft,
  Shield,
  FileText,
  ArrowUpRight,
  Plus
} from 'lucide-react';

interface LandingPageProps {
  onAuthSuccess: (email: string) => void;
  currentPath: string;
  navigate: (to: string) => void;
  initialShowAuthModal?: boolean;
  clearInitialShowAuthModal?: () => void;
  userEmail: string | null;
}

// Interactive holographic 3D tilt card component for Binders page and Hero specimens
const TiltCard: React.FC<{
  name: string;
  set: string;
  number: string;
  purchasePrice: number;
  currentValue: number;
  image: string;
  condition: string;
  roi: number;
}> = ({ name, set, number, purchasePrice, currentValue, image, condition, roi }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [sheen, setSheen] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = (x / rect.width) - 0.5;
    const yc = (y / rect.height) - 0.5;

    setTilt({ x: xc * 16, y: -yc * 16 });
    setSheen({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div 
      className="relative aspect-[3/4.2] rounded-2xl overflow-hidden bg-slate-900 border border-slate-850 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-shadow duration-300 group"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="w-full h-full relative p-3 flex flex-col justify-between"
        animate={{
          rotateY: tilt.x,
          rotateX: tilt.y,
          scale: isHovered ? 1.03 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 250,
          damping: 22,
        }}
      >
        {/* Holographic moving sheen overlay */}
        {isHovered && (
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-color-dodge z-20 rounded-2xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${sheen.x}% ${sheen.y}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 65%), linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.1) 40%, transparent 60%)`,
            }}
          />
        )}

        <div className="relative aspect-[3/4.2] bg-slate-950/85 border border-slate-850/40 rounded-xl overflow-hidden mb-3 flex items-center justify-center p-1">
          <img 
            src={image} 
            alt={name} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain select-none"
          />
          
          {/* Card hover stats overlay */}
          <div className={`absolute inset-0 bg-[#0c0e14]/90 backdrop-blur-sm border border-slate-800 p-4 flex flex-col justify-between transition-all duration-300 z-10 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="space-y-1">
              <span className="text-[9px] text-[#FFCB05] font-mono tracking-widest block uppercase font-bold">{set}</span>
              <h4 className="text-xs font-black text-white leading-tight font-mono">{name}</h4>
              <p className="text-[10px] text-slate-400 font-mono"># {number}</p>
            </div>
            
            <div className="space-y-2 border-t border-slate-850 pt-2 font-mono">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Condition:</span>
                <span className="text-white font-bold">{condition}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Cost Basis:</span>
                <span className="text-slate-300 font-bold">${purchasePrice}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Market Value:</span>
                <span className="text-[#FFCB05] font-black">${currentValue}</span>
              </div>
              <div className="flex justify-between text-[10px] pt-1 border-t border-slate-905">
                <span className="text-slate-500">Net Profit:</span>
                <span className="text-green-400 font-bold">+${currentValue - purchasePrice}</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 border border-slate-850/60 px-2 py-1 rounded-lg backdrop-blur-md flex justify-between items-center text-[8px] z-0 group-hover:opacity-0 transition-opacity">
            <span className="text-[#FFCB05] font-black font-mono">{condition}</span>
            <span className="text-slate-400 font-mono truncate max-w-[70px]">{number}</span>
          </div>
        </div>

        <div className="space-y-2 select-none group-hover:opacity-0 transition-opacity z-0">
          <div>
            <span className="text-[8px] text-indigo-400 font-bold tracking-wider font-mono uppercase">{set}</span>
            <h4 className="text-xs font-bold text-white block truncate leading-tight mt-0.5">{name}</h4>
          </div>

          <div className="grid grid-cols-2 gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-900 text-center font-mono">
            <div>
              <span className="text-[7px] text-slate-500 block">VALUE</span>
              <span className="text-[9px] font-bold text-white block mt-0.5">${currentValue}</span>
            </div>
            <div>
              <span className="text-[7px] text-slate-500 block">ROI</span>
              <span className="text-[9px] font-bold text-green-400 block mt-0.5">+{roi.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onAuthSuccess, 
  currentPath, 
  navigate, 
  initialShowAuthModal, 
  clearInitialShowAuthModal,
  userEmail
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [showConsentBanner, setShowConsentBanner] = useState(() => !localStorage.getItem('pokevault_cookie_consent'));

  // Derive active view from currentPath prop
  let activeView: 'home' | 'about' | 'privacy' | 'features' | 'binders' = 'home';
  if (currentPath === '/about') activeView = 'about';
  else if (currentPath === '/privacy') activeView = 'privacy';
  else if (currentPath === '/features') activeView = 'features';
  else if (currentPath === '/binders') activeView = 'binders';

  useEffect(() => {
    if (initialShowAuthModal) {
      setAuthMode('login');
      setShowAuthModal(true);
      if (clearInitialShowAuthModal) {
        clearInitialShowAuthModal();
      }
    }
  }, [initialShowAuthModal]);

  const changeAuthMode = (mode: 'login' | 'register' | 'forgot') => {
    setAuthMode(mode);
    setAuthError(null);
    setRecoverySuccess(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmittedAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Coordinate validation
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
      supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            display_name: name.trim(),
            nickname: nickname.trim() || undefined
          }
        }
      }).then(({ data, error }) => {
        setIsAuthLoading(false);
        if (error) {
          setAuthError(error.message);
        } else if (data?.user?.email) {
          onAuthSuccess(data.user.email);
        }
      }).catch(err => {
        setIsAuthLoading(false);
        setAuthError(err.message || 'An unexpected error occurred.');
      });
      return;
    }

    if (authMode === 'forgot') {
      if (!email.trim()) {
        setAuthError('Please enter your registered email address.');
        return;
      }
      setIsAuthLoading(true);
      supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin
      }).then(({ error }) => {
        setIsAuthLoading(false);
        if (error) {
          setAuthError(error.message);
        } else {
          setRecoverySuccess(true);
        }
      }).catch(err => {
        setIsAuthLoading(false);
        setAuthError(err.message || 'An unexpected error occurred.');
      });
      return;
    }

    // Standard sign in
    setIsAuthLoading(true);
    supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    }).then(({ data, error }) => {
      setIsAuthLoading(false);
      if (error) {
        setAuthError(error.message);
      } else if (data?.user?.email) {
        onAuthSuccess(data.user.email);
      }
    }).catch(err => {
      setIsAuthLoading(false);
      setAuthError(err.message || 'An unexpected error occurred.');
    });
  };

  const handleGoogleSignIn = () => {
    setAuthError(null);
    setIsGoogleLoading(true);
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    }).catch(err => {
      setIsGoogleLoading(false);
      setAuthError(err.message || 'Failed to initialize Google Sign In');
    });
  };

  // Static high-quality example portfolio data for showcase
  const showcasePortfolioCards = [
    {
      name: 'Umbreon VMAX (Alt Art)',
      set: 'Evolving Skies',
      number: '215/203',
      purchasePrice: 450,
      currentValue: 980,
      image: 'https://images.pokemontcg.io/swsh7/215_hires.png',
      rarity: 'Illustration Rare',
      condition: 'PSA 10 Gem Mint'
    },
    {
      name: 'Charizard ex (Special Illustration)',
      set: 'Obsidian Flames',
      number: '223/197',
      purchasePrice: 120,
      currentValue: 285,
      image: 'https://images.pokemontcg.io/sv3/223_hires.png',
      rarity: 'Special Illustration Rare',
      condition: 'Raw NM'
    },
    {
      name: 'Lugia V (Alt Art)',
      set: 'Silver Tempest',
      number: '186/195',
      purchasePrice: 140,
      currentValue: 220,
      image: 'https://images.pokemontcg.io/sit1/186_hires.png',
      rarity: 'Special Illustration Rare',
      condition: 'CGC 9.5 Mint'
    }
  ];

  const totalShowcaseValue = showcasePortfolioCards.reduce((acc, card) => acc + card.currentValue, 0);
  const totalShowcaseCost = showcasePortfolioCards.reduce((acc, card) => acc + card.purchasePrice, 0);
  const totalShowcaseRoi = ((totalShowcaseValue - totalShowcaseCost) / totalShowcaseCost) * 100;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans relative overflow-hidden selection:bg-[#FFCB05] selection:text-slate-900 pb-20">
      
      {/* Decorative ambient gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full bg-gradient-to-br from-indigo-900/20 to-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[45%] rounded-full bg-gradient-to-br from-[#3B4CCA]/10 to-[#FFCB05]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[0%] left-[10%] w-[60%] h-[35%] rounded-full bg-gradient-to-br from-purple-900/10 to-indigo-950/20 blur-[130px] pointer-events-none" />

      {/* Navigation Header */}
      <nav className="relative max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-900/80 z-40 bg-[#07090e]/60 backdrop-blur-md sticky top-0">
        <button 
          onClick={() => {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 cursor-pointer select-none border-none bg-transparent focus:outline-none text-left"
        >
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-[#3B4CCA] to-[#FFCB05] text-white">
            <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1-15.5c2.48 0 4.5 2.02 4.5 4.5S15.48 15.5 13 15.5s-4.5-2.02-4.5-4.5 2.02-4.5 4.5-4.5zm-1 16c-3.87 0-7-3.13-7-7 0-.5.06-1 .17-1.47l4.31 4.31c1.1-.38 2.37.18 2.87 1.25.1.22.15.46.15.7l-.01.21h-.1c-.96 0-1.89-.39-2.58-1.08l-2.01-2.01c-.49-.49-1.28-.49-1.77 0-.49.49-.49 1.28 0 1.77l3.87 3.87C9.28 18.81 10.61 19 12 19c4.96 0 9-4.04 9-9h.5c0 4.96-4.04 9-9 9z" />
            </svg>
          </div>
          <span className="text-lg font-black tracking-widest text-white font-mono uppercase">
            Poké<span className="text-[#FFCB05]">Vault</span>
          </span>
        </button>

        {/* Navigation Links */}
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
                onClick={() => {
                  changeAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="text-slate-300 hover:text-white text-xs font-bold font-mono tracking-wider px-4 py-2 transition-colors cursor-pointer"
              >
                SIGN IN
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  changeAuthMode('register');
                  setShowAuthModal(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black px-5 py-2.5 shadow-lg shadow-indigo-600/20 border border-indigo-500/40 transition-all active:scale-[0.98] cursor-pointer"
              >
                BUILD YOUR FREE VAULT
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Core Section Blocks Wrapper */}
      <main className="relative max-w-7xl mx-auto px-6 pt-12 md:pt-20 space-y-32">
        {activeView === 'home' && (
          <>
            {/* 1. Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/50 border border-indigo-500/20 text-indigo-400 rounded-full font-mono text-[10px] tracking-widest uppercase font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE PORTFOLIO PLATFORM FOR SERIOUS COLLECTORS</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] font-mono">
              The Intelligent <br className="hidden md:inline" />
              Portfolio Vault <br className="hidden md:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFCB05] via-[#3B4CCA] to-indigo-400">
                for Pokémon Collectors
              </span>
            </h1>

            <p className="text-slate-400 text-base md:text-lg max-w-xl leading-relaxed">
              Track real-time valuations, monitor ROI, and organize virtual binders. Stop guessing what your collection is worth—start tracking it like an asset.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              {userEmail ? (
                <button
                  type="button"
                  onClick={() => navigate('/app')}
                  className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-4 px-8 text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FFCB05]/10 font-mono"
                >
                  <span>GO TO DASHBOARD</span>
                  <ArrowRight className="w-4 h-4 shrink-0 stroke-[3px]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    changeAuthMode('register');
                    setShowAuthModal(true);
                  }}
                  className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-4 px-8 text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FFCB05]/10 font-mono"
                >
                  <span>BUILD YOUR FREE VAULT</span>
                  <ArrowRight className="w-4 h-4 shrink-0 stroke-[3px]" />
                </button>
              )}

              <button
                onClick={() => {
                  navigate('/features');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-2xl py-4 px-8 text-sm font-semibold hover:text-white transition-all text-center flex items-center justify-center gap-2 cursor-pointer font-mono"
              >
                <span>EXPLORE FEATURES</span>
              </button>
            </div>

            {/* Micro stats banner for elite feel */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-900/60 max-w-md">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Verified Expansions</span>
                <span className="text-lg font-bold text-white mt-0.5">150+ Sets</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Active Collectors</span>
                <span className="text-lg font-bold text-white mt-0.5">12,000+</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Value Managed</span>
                <span className="text-lg font-bold text-white mt-0.5">$42.5M+</span>
              </div>
            </div>
          </div>

          {/* Hero Premium Interactive Visual mockup mockup */}
          <div className="lg:col-span-6 relative w-full flex justify-center">
            <div className="absolute inset-0 bg-[#3B4CCA]/5 blur-[70px] rounded-full pointer-events-none" />
            
            {/* Visual Glassmorphic Grid Layout of Live Tracker */}
            <div className="relative w-full max-w-lg bg-[#0c0e14]/90 border border-slate-850/80 rounded-3xl p-6 shadow-2xl overflow-hidden backdrop-blur-xl">
              
              {/* Fake UI Header controls */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-850/60 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="bg-slate-900 border border-slate-850 text-[9px] font-mono font-bold text-slate-400 px-3 py-1 rounded-lg">
                  POKEVAULT PORTFOLIO ENGINE V2.4
                </div>
              </div>

              {/* Total Balance mockup card value with green mini trend line */}
              <div className="grid grid-cols-2 gap-4 pb-5 border-b border-slate-850/40">
                <div>
                  <span className="text-[9px] text-slate-500 font-mono uppercase block tracking-wider">TOTAL PORTFOLIO VALUE</span>
                  <span className="text-2xl font-black text-white tracking-tight mt-1 leading-none font-mono">
                    ${totalShowcaseValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] inline-flex items-center gap-1 font-mono font-bold text-green-500 mt-2 bg-green-950/15 border border-green-900/30 px-2 py-0.5 rounded-md leading-none">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{totalShowcaseRoi.toFixed(1)}% ({totalShowcaseValue - totalShowcaseCost > 0 ? '+' : ''}${totalShowcaseValue - totalShowcaseCost})</span>
                  </span>
                </div>

                {/* Simulated Sparkline chart drawing */}
                <div className="flex items-end justify-end h-16 w-full pr-1">
                  <svg className="w-full max-w-[140px] h-full text-green-400" viewBox="0 0 100 30" fill="none">
                    <path 
                      d="M0,25 Q15,22 30,14 T60,18 T90,3 T100,2" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                    <path 
                      d="M0,25 Q15,22 30,14 T60,18 T90,3 T100,2 L100,30 L0,30 Z" 
                      fill="url(#greenGradient)" 
                      opacity="0.12" 
                    />
                    <defs>
                      <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Stacked Showcase of specimen cards */}
              <div className="space-y-3.5 mt-5">
                <span className="text-[9px] text-slate-500 font-mono uppercase block tracking-wider">LIVE VAULT SPECIMENS</span>
                
                {showcasePortfolioCards.map((card, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-850 rounded-2xl hover:border-slate-800 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={card.image} 
                        alt={card.name} 
                        referrerPolicy="no-referrer"
                        className="w-8 h-11 object-contain rounded bg-slate-950 border border-slate-850 shadow"
                      />
                      <div>
                        <span className="font-bold text-xs text-white block truncate max-w-[150px]">{card.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{card.set} • {card.number}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-white block font-mono">${card.currentValue}</span>
                      <span className="text-[9px] text-green-400 font-bold font-mono mt-0.5 block">
                        +{((card.currentValue - card.purchasePrice) / card.purchasePrice * 100).toFixed(0)}% ROI
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* 2. Features Section */}
        <section id="features" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] text-[#FFCB05] font-mono tracking-widest block uppercase font-bold">VAULT ARCHITECTURE</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono uppercase">
              Engineered for Serious Collectors
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Every feature is designed with the precision demanded by high-value TCG investors and grading enthusiasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1: Collection Management */}
          <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
            <div className="w-10 h-10 rounded-xl bg-[#3B4CCA]/10 text-[#3B4CCA] flex items-center justify-center border border-[#3B4CCA]/20 select-none">
              <Database className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-slate-100 font-mono uppercase">Seamless Cataloging</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Log your cards in seconds. Search by set, name, or card number to link your physical holdings with live database records.
            </p>
          </div>

          {/* Feature 2: Portfolio Tracking */}
          <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
            <div className="w-10 h-10 rounded-xl bg-[#FFCB05]/15 text-[#FFCB05] flex items-center justify-center border border-[#FFCB05]/30 select-none">
              <LineChart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-slate-100 font-mono uppercase">Real-Time Valuations</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Automatically calculate cost basis, net value, and ROI. Watch your portfolio's appreciation adjust instantly to live market trends.
            </p>
          </div>

          {/* Feature 3: Price History */}
          <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/25 select-none">
              <Coins className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-slate-100 font-mono uppercase">Historical Market Charts</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Access historical price charts for raw and graded cards. Track market trends to buy the dip and sell at the peak.
            </p>
          </div>

          {/* Feature 4: Wishlist Management */}
          <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/25 select-none">
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-slate-100 font-mono uppercase">Target Price Alerts</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Add high-priority chases to your wishlist, set target prices, and get notified immediately when market values meet your budget.
            </p>
          </div>

          {/* Feature 5: Binder Organization */}
          <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/25 select-none">
              <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-slate-100 font-mono uppercase">Custom Virtual Binders</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Organize your collection your way. Group your singles by expansion set, theme, or investment priority inside customizable digital binders.
            </p>
          </div>

          {/* Feature 6: Collection Analytics */}
          <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/25 select-none">
              <PieChart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-slate-100 font-mono uppercase">Advanced TCG Analytics</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Visualize your collection stats. Track set completion progress, rarity distributions, and graded vs. raw ratios.
            </p>
          </div>

          </div>
        </section>

        {/* 3. Portfolio Showcase Section */}
        <section className="space-y-12 bg-slate-950/40 p-8 rounded-3xl border border-slate-900 backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="text-[10px] text-[#FFCB05] font-mono tracking-widest block uppercase font-bold">PORTFOLIO DEEP DIVE</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-white font-mono uppercase">
                Live Valuation Engine
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                See how PokéVault automatically updates purchase entries against live market sales to display your true returns.
              </p>
            </div>

            {/* Mock Header indicators */}
            <div className="flex items-center gap-6 font-mono bg-[#0c0e14] p-4 rounded-2xl border border-slate-850 shadow shrink-0">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">PORTFOLIO VALUE</span>
                <span className="text-sm font-bold text-[#FFCB05]">${totalShowcaseValue}</span>
              </div>
              <div className="w-px h-8 bg-slate-900" />
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">AVG. CARD VALUE</span>
                <span className="text-sm font-bold text-white">${Math.round(totalShowcaseValue / showcasePortfolioCards.length)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-3">
            {showcasePortfolioCards.map((card, idx) => {
              const profit = card.currentValue - card.purchasePrice;
              const roi = (profit / card.purchasePrice) * 100;

              return (
                <div 
                  key={idx} 
                  className="bg-[#0c0e14] border border-slate-850 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-850 hover:bg-[#0f1118]/80 transition-all shadow-inner group"
                >
                  <div className="relative aspect-[3/4.2] bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden mb-5 flex items-center justify-center p-2 group-hover:scale-[1.01] transition-transform">
                    <img 
                      src={card.image} 
                      alt={card.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                    
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 border border-slate-850 px-3 py-2 rounded-xl backdrop-blur-md flex justify-between items-center text-[10px]">
                      <span className="text-[#FFCB05] font-black font-mono">{card.condition}</span>
                      <span className="text-slate-400 font-mono truncate max-w-[80px]">{card.number}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] text-indigo-400 font-bold tracking-wider font-mono uppercase">{card.set}</span>
                      <h4 className="text-sm font-bold text-white block truncate leading-tight mt-0.5">{card.name}</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-3 rounded-2xl border border-slate-900 text-center font-mono">
                      <div>
                        <span className="text-[8px] text-slate-500 block">COST</span>
                        <span className="text-[11px] font-bold text-slate-300 block mt-1">${card.purchasePrice}</span>
                      </div>
                      <div className="border-x border-slate-900">
                        <span className="text-[8px] text-slate-500 block">VALUE</span>
                        <span className="text-[11px] font-bold text-white block mt-1">${card.currentValue}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block">ROI</span>
                        <span className="text-[11px] font-bold text-green-400 block mt-1">+{roi.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Collector Journey Timeline */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] text-[#FFCB05] font-mono tracking-widest block uppercase font-bold">WORKFLOW TIMELINE</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white font-mono uppercase">
              Four Steps to Total Control
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Taking control of your card collection is simple and secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Connection decorative dashed line */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-px border-t border-dashed border-slate-800 pointer-events-none z-0" />

            {/* Journey Step 1: Search */}
            <div className="space-y-4 relative z-10 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-blue-500/20 text-[#FFCB05] flex items-center justify-center font-mono font-black text-sm mx-auto sm:mx-0">
                01
              </div>
              <h3 className="font-bold text-sm text-white font-mono uppercase flex items-center justify-center sm:justify-start gap-1.5">
                <Search className="w-4 h-4 text-blue-500" />
                <span>Search Card Database</span>
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto sm:mx-0">
                Type any keyword or card number to instantly retrieve official metadata, images, and live prices.
              </p>
            </div>

            {/* Journey Step 2: Add Holdings */}
            <div className="space-y-4 relative z-10 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-blue-500/20 text-[#FFCB05] flex items-center justify-center font-mono font-black text-sm mx-auto sm:mx-0">
                02
              </div>
              <h3 className="font-bold text-sm text-white font-mono uppercase flex items-center justify-center sm:justify-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Log Your Purchase</span>
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto sm:mx-0">
                Enter your purchase price, acquisition date, card condition, and grading cert number to establish your baseline.
              </p>
            </div>

            {/* Journey Step 3: Monitor Growth */}
            <div className="space-y-4 relative z-10 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-blue-500/20 text-[#FFCB05] flex items-center justify-center font-mono font-black text-sm mx-auto sm:mx-0">
                03
              </div>
              <h3 className="font-bold text-sm text-white font-mono uppercase flex items-center justify-center sm:justify-start gap-1.5">
                <TrendingUp className="w-4 h-4 text-pink-500" />
                <span>Track Performance</span>
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto sm:mx-0">
                Monitor your dashboard to watch your total net worth grow, analyze trends, and view ROI.
              </p>
            </div>

            {/* Journey Step 4: Organize Binders */}
            <div className="space-y-4 relative z-10 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-blue-500/20 text-[#FFCB05] flex items-center justify-center font-mono font-black text-sm mx-auto sm:mx-0">
                04
              </div>
              <h3 className="font-bold text-sm text-white font-mono uppercase flex items-center justify-center sm:justify-start gap-1.5">
                <Layers className="w-4 h-4 text-purple-500" />
                <span>Organize in Binders</span>
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto sm:mx-0">
                Sort cards into custom virtual binders that replicate physical slot configurations for easy viewing.
              </p>
            </div>

          </div>
        </section>

        {/* 5. Final CTA Action section panel */}
        <section className="relative rounded-3xl p-8 md:p-14 bg-gradient-to-tr from-[#0b0e14] to-[#121622] border border-slate-850/60 overflow-hidden shadow-2xl flex flex-col items-center text-center space-y-6">
          <div className="absolute inset-0 bg-[#FFCB05]/3 blur-[80px] pointer-events-none" />

          <Sparkles className="w-8 h-8 text-[#FFCB05] animate-bounce" />

          <h2 className="text-2xl md:text-4xl font-extrabold text-white max-w-2xl leading-none font-mono uppercase tracking-tight">
            Start Tracking Your Pokémon Portfolio Today
          </h2>

          <p className="text-slate-400 text-xs md:text-sm max-w-lg leading-relaxed">
            Join thousands of collectors who manage their physical assets with data-driven insights. Create your account in under 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md pt-2">
            {userEmail ? (
              <button
                type="button"
                onClick={() => navigate('/app')}
                className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-3.5 px-8 text-xs font-mono w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2"
              >
                <span>GO TO DASHBOARD</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    changeAuthMode('register');
                    setShowAuthModal(true);
                  }}
                  className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-3.5 px-8 text-xs font-mono w-full sm:w-auto cursor-pointer"
                >
                  BUILD YOUR FREE VAULT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    changeAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-2xl py-3.5 px-8 text-xs font-bold font-mono w-full sm:w-auto cursor-pointer"
                >
                  SIGN IN
                </button>
              </>
            )}
          </div>
        </section>
          </>
        )}

        {/* 2. About PokéVault Sub-page */}
        {activeView === 'about' && (
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
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>BEHIND THE VAULT</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white font-mono uppercase tracking-tight">
                  About PokéVault
                </h1>
              </div>

              <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-sm md:text-base leading-relaxed">
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                    Our Mission
                  </h2>
                  <p>
                    We started PokéVault because we were tired of managing our card collections on clunky, manual spreadsheets. We wanted a tool that treated our cards like the valuable assets they are, without losing the fun of the chase. PokéVault is our answer: a professional-grade portfolio manager built to track live values, ROI, and virtual binders in real-time.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                    The Team
                  </h2>
                  <p>
                    We are a team of passionate collectors and software engineers who live and breathe TCGs. We know the difference between a raw NM card and a PSA 10, and we built this tool with the features and accuracy that we ourselves demand.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                    How the Engine Works
                  </h2>
                  <p>
                    PokéVault links your cards directly to verified official database APIs. By tracking live market trading data and recent sales, our valuation engine automatically calculates your cost basis, current portfolio value, and ROI margins.
                  </p>
                </section>
              </div>

              <div className="pt-6 border-t border-slate-850/60 flex justify-start">
                {userEmail ? (
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/app');
                    }}
                    className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-3 px-6 text-xs font-mono cursor-pointer transition-all"
                  >
                    GO TO DASHBOARD
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      changeAuthMode('register');
                      setShowAuthModal(true);
                    }}
                    className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-3 px-6 text-xs font-mono cursor-pointer transition-all"
                  >
                    START BUILDING YOUR VAULT
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. Privacy Policy & LGPD Sub-page */}
        {activeView === 'privacy' && (
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
                <p className="text-slate-500 text-xs font-mono">Last updated: June 2026</p>
              </div>

              <div className="prose prose-invert max-w-none space-y-8 text-slate-300 text-sm leading-relaxed">
                <p>
                  At PokéVault, we respect your privacy and are committed to protecting your personal data in accordance with the Brazilian General Data Protection Law (LGPD - Lei Geral de Proteção de Dados, Lei nº 13.709/2018).
                </p>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                    1. Data We Collect
                  </h2>
                  <p>
                    We collect and process the following information to manage your digital vault:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Account Credentials:</strong> Your email, display name, and optional nickname, stored securely via Supabase.</li>
                    <li><strong>TCG Holdings Data:</strong> Card quantities, purchase price, conditions, card cert numbers, custom binders, and wishlist chases.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                    2. Legal Grounds & Usage
                  </h2>
                  <p>
                    We process your data strictly to run your personal dashboard, calculate portfolio ROI, and provide analytical tools. We do not sell, rent, or distribute your personal details to third parties or marketing brokers.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                    3. Cookies & Local Storage
                  </h2>
                  <p>
                    We use essential cookie keys and browser local storage configurations to verify user sessions, secure connection routes, and remember your cookie banner settings (`pokevault_cookie_consent`).
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                    4. Your LGPD Rights
                  </h2>
                  <p>
                    Under LGPD articles, you retain full ownership of your data and can request access, corrections, transfers, or absolute deletion. You can permanently erase all account records instantly by using the <strong>Purge Account</strong> button found under the Settings Tab.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider border-b border-slate-850 pb-2">
                    5. Security Measures
                  </h2>
                  <p>
                    Our platform leverages Supabase authentication systems and database security rules to safeguard physical collection details against data leaks, unauthorized access, or manipulation.
                  </p>
                </section>
              </div>

              <div className="pt-6 border-t border-slate-850/60 flex justify-start">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-2xl py-3 px-6 text-xs font-mono cursor-pointer transition-all"
                >
                  RETURN TO HOME
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. Detailed Features Page */}
        {activeView === 'features' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 max-w-5xl mx-auto pt-6"
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

            <div className="bg-[#0c0e14]/90 border border-slate-850/80 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-12">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3B4CCA] via-[#FFCB05] to-indigo-500" />
              
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/50 border border-indigo-500/20 text-[#FFCB05] rounded-full font-mono text-[9px] tracking-widest uppercase font-bold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>PLATFORM CAPABILITIES</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white font-mono uppercase tracking-tight">
                  PokéVault Features
                </h1>
                <p className="text-slate-400 text-sm max-w-xl">
                  Explore the full array of high-precision inventory and analytical tools designed for modern collector workflows.
                </p>
              </div>

              {/* Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Pillar 1: Automation */}
                <div className="space-y-6 bg-slate-950/50 border border-slate-850/50 p-6 rounded-2xl hover:border-blue-500/20 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    Automation & API
                  </h3>
                  <ul className="space-y-4 text-xs text-slate-400 font-sans leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span><strong>Instant Card Lookup:</strong> Search by name, card number, or expansion set to pull official high-resolution artwork and meta data.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span><strong>Live Market Pricing:</strong> Connected to live indexes for real-time market value assessment of raw and graded cards.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span><strong>Auto Expansion Sync:</strong> Keeps your binders perfectly categorized by sets with completion rate metrics.</span>
                    </li>
                  </ul>
                </div>

                {/* Pillar 2: Financials */}
                <div className="space-y-6 bg-slate-950/50 border border-slate-850/50 p-6 rounded-2xl hover:border-yellow-500/20 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center border border-yellow-500/20">
                    <Coins className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    Financial Analytics
                  </h3>
                  <ul className="space-y-4 text-xs text-slate-400 font-sans leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span><strong>Cost-Basis Log:</strong> Capture your exact acquisition costs, grading fees, and custom collector notes.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span><strong>Real-Time ROI:</strong> Dynamically monitor your net gain/loss, profit margins, and annualized percentage yields.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span><strong>Multi-Currency Support:</strong> Toggle currency display options dynamically between USD, EUR, BRL, and JPY.</span>
                    </li>
                  </ul>
                </div>

                {/* Pillar 3: Visuals */}
                <div className="space-y-6 bg-slate-950/50 border border-slate-850/50 p-6 rounded-2xl hover:border-indigo-500/20 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    Asset Management
                  </h3>
                  <ul className="space-y-4 text-xs text-slate-400 font-sans leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span><strong>Interactive Binders:</strong> Group, drag, and display your card entries inside simulated 3x3 pocket sheets.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span><strong>Graded Certification:</strong> Log specific serial numbers and grading companies (PSA, CGC, BGS) for graded holdings.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span><strong>Wishlist Chase Alerts:</strong> Monitor desired items, set price thresholds, and get alerts when targets are met.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Call to Action */}
              <div className="pt-8 border-t border-slate-850/60 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white font-mono uppercase">Ready to start cataloging?</h4>
                  <p className="text-xs text-slate-500">Sign up and log your first 10 cards in less than 2 minutes.</p>
                </div>
                {userEmail ? (
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/app');
                    }}
                    className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-3 px-8 text-xs font-mono cursor-pointer transition-all"
                  >
                    GO TO DASHBOARD
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      changeAuthMode('register');
                      setShowAuthModal(true);
                    }}
                    className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-3 px-8 text-xs font-mono cursor-pointer transition-all"
                  >
                    BUILD YOUR FREE VAULT
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. Binders Demo Page */}
        {activeView === 'binders' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 max-w-5xl mx-auto pt-6"
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

            <div className="bg-[#0c0e14]/90 border border-slate-850/80 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-10">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3B4CCA] via-[#FFCB05] to-indigo-500" />
              
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/50 border border-indigo-500/20 text-[#FFCB05] rounded-full font-mono text-[9px] tracking-widest uppercase font-bold">
                  <Compass className="w-3.5 h-3.5" />
                  <span>INTERACTIVE PLAYGROUND</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white font-mono uppercase tracking-tight">
                  Kanto Chase Binders V1
                </h1>
                <p className="text-slate-400 text-sm max-w-2xl">
                  Tactile binder visualization simulating pocket page sheets. Hover and move your cursor over cards to view holographic sheens and live ROI analytics.
                </p>
              </div>

              {/* Binder Stats Summary Banner */}
              <div className="bg-slate-950/80 rounded-2xl border border-slate-850 p-5 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                {/* Stats 1: Progress */}
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>SHEET COMPLETION</span>
                    <span className="text-[#FFCB05] font-bold">7 / 9 SLOTS (77.8%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                    <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full" style={{ width: '77.8%' }} />
                  </div>
                </div>

                <div className="w-px h-10 bg-slate-850 hidden md:block" />

                {/* Stats 2: Financial Aggregates */}
                <div className="grid grid-cols-3 gap-2 col-span-1 md:col-span-2 text-center md:text-left font-mono">
                  <div>
                    <span className="text-[8px] text-slate-500 block">TOTAL VALUE</span>
                    <span className="text-sm font-extrabold text-white block mt-1">$2,515.00</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 block">COST BASIS</span>
                    <span className="text-sm font-extrabold text-slate-400 block mt-1">$1,200.00</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 block">NET ROI</span>
                    <span className="text-sm font-black text-green-400 block mt-1">+109.6%</span>
                  </div>
                </div>
              </div>

              {/* 3x3 Binder Layout Wrapper */}
              <div className="flex justify-center pt-2">
                <div className="relative flex bg-[#161a22] border border-slate-800/80 rounded-2xl p-4 md:p-8 shadow-2xl max-w-4xl w-full">
                  
                  {/* Binder ring hole sidebar */}
                  <div className="hidden md:flex flex-col justify-around items-center pr-6 border-r border-slate-850 w-8">
                    <div className="w-4.5 h-4.5 rounded-full bg-[#0c0e14] border border-slate-800/80 shadow-inner flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-black/40" />
                    </div>
                    <div className="w-4.5 h-4.5 rounded-full bg-[#0c0e14] border border-slate-800/80 shadow-inner flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-black/40" />
                    </div>
                    <div className="w-4.5 h-4.5 rounded-full bg-[#0c0e14] border border-slate-800/80 shadow-inner flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-black/40" />
                    </div>
                  </div>

                  {/* 3x3 grid */}
                  <div className="grid grid-cols-3 gap-3 md:gap-6 flex-grow md:pl-6">
                    {[
                      {
                        slot: 1,
                        name: 'Charizard ex (SIR)',
                        set: 'Obsidian Flames',
                        number: '223/197',
                        purchasePrice: 120,
                        currentValue: 285,
                        image: 'https://images.pokemontcg.io/sv3/223_hires.png',
                        condition: 'Raw NM',
                        roi: 137.5
                      },
                      {
                        slot: 2,
                        name: 'Blastoise ex (SIR)',
                        set: 'Scarlet & Violet 151',
                        number: '200/165',
                        purchasePrice: 65,
                        currentValue: 110,
                        image: 'https://images.pokemontcg.io/sv3pt5/200_hires.png',
                        condition: 'PSA 9 Mint',
                        roi: 69.2
                      },
                      {
                        slot: 3,
                        name: 'Venusaur ex (SIR)',
                        set: 'Scarlet & Violet 151',
                        number: '198/165',
                        purchasePrice: 45,
                        currentValue: 75,
                        image: 'https://images.pokemontcg.io/sv3pt5/198_hires.png',
                        condition: 'Raw NM',
                        roi: 66.7
                      },
                      {
                        slot: 4,
                        isEmpty: true
                      },
                      {
                        slot: 5,
                        name: 'Umbreon VMAX (Alt Art)',
                        set: 'Evolving Skies',
                        number: '215/203',
                        purchasePrice: 450,
                        currentValue: 980,
                        image: 'https://images.pokemontcg.io/swsh7/215_hires.png',
                        condition: 'PSA 10 Gem Mint',
                        roi: 117.8
                      },
                      {
                        slot: 6,
                        name: 'Lugia V (Alt Art)',
                        set: 'Silver Tempest',
                        number: '186/195',
                        purchasePrice: 140,
                        currentValue: 220,
                        image: 'https://images.pokemontcg.io/sit1/186_hires.png',
                        condition: 'CGC 9.5 Mint',
                        roi: 57.1
                      },
                      {
                        slot: 7,
                        name: 'Giratina V (Alt Art)',
                        set: 'Lost Origin',
                        number: '186/196',
                        purchasePrice: 180,
                        currentValue: 395,
                        image: 'https://images.pokemontcg.io/swsh11/186_hires.png',
                        condition: 'Raw NM',
                        roi: 119.4
                      },
                      {
                        slot: 8,
                        isEmpty: true
                      },
                      {
                        slot: 9,
                        name: 'Rayquaza VMAX (Alt Art)',
                        set: 'Evolving Skies',
                        number: '218/203',
                        purchasePrice: 200,
                        currentValue: 450,
                        image: 'https://images.pokemontcg.io/swsh7/218_hires.png',
                        condition: 'BGS 9.5 Gem Mint',
                        roi: 125.0
                      }
                    ].map((card, idx) => {
                      if (card.isEmpty) {
                        return (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.015 }}
                            onClick={() => {
                              if (userEmail) {
                                navigate('/app');
                              } else {
                                changeAuthMode('register');
                                setShowAuthModal(true);
                              }
                            }}
                            className="relative aspect-[3/4.2] rounded-2xl border-2 border-dashed border-slate-800 bg-[#0c0e14]/50 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:border-indigo-500/30 hover:bg-[#0c0e14]/70 transition-all select-none group"
                          >
                            {/* Card back placeholder illustration */}
                            <div className="w-12 h-16 rounded border border-dashed border-slate-850/60 flex items-center justify-center text-slate-700 bg-slate-950/20 group-hover:text-indigo-400/50 group-hover:border-indigo-500/20 transition-colors">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                              </svg>
                            </div>
                            
                            <span className="text-[8px] text-slate-600 font-mono font-bold tracking-wider mt-4 block group-hover:text-indigo-400 transition-colors uppercase">
                              Awaiting Chase
                            </span>
                            
                            {/* Glowing plus button */}
                            <div className="mt-3 w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-[#FFCB05] group-hover:border-[#FFCB05] group-hover:shadow-lg group-hover:shadow-[#FFCB05]/10 transition-all">
                              <Plus className="w-4 h-4" />
                            </div>
                          </motion.div>
                        );
                      }

                      return (
                        <TiltCard
                          key={idx}
                          name={card.name!}
                          set={card.set!}
                          number={card.number!}
                          purchasePrice={card.purchasePrice!}
                          currentValue={card.currentValue!}
                          image={card.image!}
                          condition={card.condition!}
                          roi={card.roi!}
                        />
                      );
                    })}
                  </div>

                </div>
              </div>

              {/* Bottom Action Footer inside binder demo */}
              <div className="pt-8 border-t border-slate-850/60 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="text-sm font-bold text-white font-mono uppercase">Track your own binders online</h4>
                  <p className="text-xs text-slate-500">Create multiple sheets, customize layout options, and see aggregate stats instantly.</p>
                </div>
                {userEmail ? (
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/app');
                    }}
                    className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-3 px-8 text-xs font-mono cursor-pointer transition-all"
                  >
                    GO TO DASHBOARD
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      changeAuthMode('register');
                      setShowAuthModal(true);
                    }}
                    className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-3 px-8 text-xs font-mono cursor-pointer transition-all"
                  >
                    START YOUR COLLECTION
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* Footer Section */}
      <footer className="relative max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-900/80 z-40 bg-[#07090e]/60 text-slate-500 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 items-start">
          
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2 select-none">
              <div className="p-1 rounded bg-slate-900 text-slate-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1-15.5c2.48 0 4.5 2.02 4.5 4.5S15.48 15.5 13 15.5s-4.5-2.02-4.5-4.5 2.02-4.5 4.5-4.5zm-1 16c-3.87 0-7-3.13-7-7 0-.5.06-1 .17-1.47l4.31 4.31c1.1-.38 2.37.18 2.87 1.25.1.22.15.46.15.7l-.01.21h-.1c-.96 0-1.89-.39-2.58-1.08l-2.01-2.01c-.49-.49-1.28-.49-1.77 0-.49.49-.49 1.28 0 1.77l3.87 3.87C9.28 18.81 10.61 19 12 19c4.96 0 9-4.04 9-9h.5c0 4.96-4.04 9-9 9z" />
                </svg>
              </div>
              <span className="font-bold tracking-widest text-slate-300 font-mono text-sm uppercase">
                Poké<span className="text-[#FFCB05]/80">Vault</span>
              </span>
            </div>
            
            <p className="text-[11px] leading-relaxed text-slate-500 max-w-md">
              © 2026 PokéVault. All original content protected by copyright.
            </p>
            
            <p className="text-[10px] leading-relaxed text-slate-600 font-semibold">
              Pokémon TCG and its respective properties are copyrights of and trademarks of © Pokémon / Nintendo / Creatures / Game Freak. PokéVault is an independent fan site and is not affiliated with, sponsored by, or endorsed by Pokémon or Nintendo. Visit the{' '}
              <a 
                href="https://www.pokemon.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors underline inline-flex items-center gap-0.5"
              >
                official website <ArrowUpRight className="w-2.5 h-2.5 inline" />
              </a>.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-bold">Navigation</span>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button 
                  onClick={() => {
                    navigate('/');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer block bg-transparent border-none p-0 text-slate-500 text-left"
                >
                  Privacy Policy & LGPD
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-bold">System Status</span>
            <div className="flex items-center gap-2 text-[11px] text-green-500 font-mono bg-green-950/10 border border-green-900/20 px-3 py-1.5 rounded-xl w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              <span>All Systems Operational</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Cookie Consent Banner */}
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
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Cookie & Privacy Notice</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  We use essential cookies to manage authentication and preserve configuration parameters. Read our details in the{' '}
                  <button 
                    onClick={() => {
                      navigate('/privacy');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[#FFCB05] underline font-bold hover:text-yellow-400 cursor-pointer bg-transparent border-none p-0 inline font-sans text-[11px]"
                  >
                    Privacy & LGPD Policy
                  </button>.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  navigate('/privacy');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:text-white font-mono uppercase cursor-pointer border-none bg-transparent"
              >
                Review Policy
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('pokevault_cookie_consent', 'true');
                  setShowConsentBanner(false);
                }}
                className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black px-4 py-1.5 rounded-lg text-[10px] font-mono tracking-wide cursor-pointer transition-all border-none"
              >
                Accept Cookies
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Credentials Overlay Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isAuthLoading && !isGoogleLoading) {
                  setShowAuthModal(false);
                }
              }}
              className="fixed inset-0 bg-[#05070a]/95 backdrop-blur-md"
            />

            {/* Credential Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0c0e14] border border-slate-850 rounded-3xl p-6 shadow-2xl overflow-hidden z-50 flex flex-col justify-between"
            >
              {/* Outer decorative glow */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3B4CCA] via-[#FFCB05] to-indigo-500" />

              <div className="space-y-5">
                
                {/* Header Controls */}
                <div className="flex justify-between items-center pb-2">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-widest">
                      {authMode === 'login' && 'WELCOME BACK'}
                      {authMode === 'register' && 'CREATE YOUR VAULT'}
                      {authMode === 'forgot' && 'RESET PASSWORD'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowAuthModal(false)}
                    disabled={isAuthLoading || isGoogleLoading}
                    className="p-1 px-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Close
                  </button>
                </div>

                {/* Main Titles */}
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
                    {authMode === 'login' && 'Unlock Vault'}
                    {authMode === 'register' && 'Create Vault Account'}
                    {authMode === 'forgot' && 'Reset Password'}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                    {authMode === 'login' && 'Sign in to access your digital vault and collection dashboard.'}
                    {authMode === 'register' && 'Start tracking, valuing, and organizing your TCG assets today.'}
                    {authMode === 'forgot' && 'Enter your registered email address to receive password reset instructions.'}
                  </p>
                </div>

                {/* Error Banner state */}
                {authError && (
                  <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-xs flex items-start gap-2 animate-feed-in font-semibold">
                    <span className="shrink-0 block text-sm mt-0.5">⚠️</span>
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
                      A password reset link has been sent to <span className="font-bold underline text-white">{email}</span>. Click the link within the next 15 minutes to set a new password.
                    </p>
                    <button 
                      type="button"
                      onClick={() => changeAuthMode('login')}
                      className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-300 font-mono transition-all uppercase cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </div>
                )}

                {/* Loading state overlays / visual block */}
                {(isAuthLoading || isGoogleLoading) ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                      <div className="absolute inset-0 rounded-full border-4 border-[#FFCB05] border-t-transparent animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-white font-bold font-mono tracking-wider animate-pulse uppercase">
                        {isGoogleLoading ? 'Authenticating with Google...' : 'Signing you in...'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Please wait while we establish secure connections...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {!recoverySuccess && (
                      <form onSubmit={handleSubmittedAuth} className="space-y-4">
                        
                        {/* 1. DISPLAY NAME - Only for Register */}
                        {authMode === 'register' && (
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Display Name</label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <input
                                type="text"
                                placeholder="Professor Oak"
                                value={name}
                                onChange={(e) => {
                                  setName(e.target.value);
                                  if (authError) setAuthError(null);
                                }}
                                className="w-full bg-[#151720] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20"
                                required
                              />
                            </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Nickname (Optional)</label>
                              <div className="relative">
                                <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                  type="text"
                                  placeholder="Oaky (used for personal greetings)"
                                  value={nickname}
                                  onChange={(e) => {
                                    setNickname(e.target.value);
                                    if (authError) setAuthError(null);
                                  }}
                                  className="w-full bg-[#151720] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. EMAIL ADDRESS - All Views */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="email"
                              placeholder="collector@pokevault.com"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                if (authError) setAuthError(null);
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
                              <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold font-medium">Password</label>
                              {authMode === 'login' && (
                                <button
                                  type="button"
                                  onClick={() => changeAuthMode('forgot')}
                                  className="text-[9px] text-indigo-400 hover:text-indigo-300 font-mono uppercase underline cursor-pointer"
                                >
                                  Forgot Password?
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => {
                                  setPassword(e.target.value);
                                  if (authError) setAuthError(null);
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
                            <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold font-medium">Confirm Password</label>
                            <div className="relative">
                              <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => {
                                  setConfirmPassword(e.target.value);
                                  if (authError) setAuthError(null);
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
                          {authMode === 'login' && 'OPEN DIGITAL VAULT'}
                          {authMode === 'register' && 'CREATE VAULT ACCOUNT'}
                          {authMode === 'forgot' && 'SEND RESET LINK'}
                        </button>
                      </form>
                    )}

                    {/* Authentication Divider (External / Google SSO support) */}
                    {!recoverySuccess && authMode !== 'forgot' && (
                      <div className="space-y-3">
                        <div className="relative flex py-2 items-center">
                          <div className="flex-grow border-t border-slate-850/60"></div>
                          <span className="flex-shrink mx-3 text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider">OR CONTINUE WITH SSO</span>
                          <div className="flex-grow border-t border-slate-850/60"></div>
                        </div>

                        {/* Premium Google Auth Button */}
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={isAuthLoading || isGoogleLoading}
                          className="w-full bg-[#151720] hover:bg-[#1E212A] border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl py-3.5 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer selection:bg-transparent"
                        >
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                          </svg>
                          <span className="font-mono text-[10px] tracking-wider uppercase font-extrabold text-slate-300">Sign in with Google Account</span>
                        </button>
                      </div>
                    )}

                    {/* Developer Bypass Sandbox quick start */}
                    {!recoverySuccess && (
                      <div className="pt-3 border-t border-slate-900 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setEmail('lucasachet@gmail.com');
                            onAuthSuccess('lucasachet@gmail.com');
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono underline select-none cursor-pointer"
                        >
                          Bypass Authentication (Sandbox Quick Start)
                        </button>
                      </div>
                    )}

                    {/* Footer Nav Links */}
                    <div className="text-center pt-1">
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => changeAuthMode('register')}
                          className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer block w-full select-none"
                        >
                          New to PokéVault? <span className="text-[#FFCB05] font-bold underline font-mono">Create a free account</span>
                        </button>
                      )}

                      {authMode === 'register' && (
                        <button
                          type="button"
                          onClick={() => changeAuthMode('login')}
                          className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer block w-full select-none"
                        >
                          Already have an account? <span className="text-[#FFCB05] font-bold underline font-mono">Sign In</span>
                        </button>
                      )}

                      {authMode === 'forgot' && (
                        <button
                          type="button"
                          onClick={() => changeAuthMode('login')}
                          className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer block w-full select-none"
                        >
                          Remember your password? <span className="text-[#FFCB05] font-bold underline font-mono">Back to Sign In</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
