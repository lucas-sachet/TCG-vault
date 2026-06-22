/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  QrCode
} from 'lucide-react';

interface LandingPageProps {
  onAuthSuccess: (email: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAuthSuccess }) => {
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
      setAuthError('Please expand and fill in all standard credentials.');
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setAuthError('Please provide a valid email coordinate format.');
      return;
    }

    if (authMode === 'register') {
      if (!name.trim()) {
        setAuthError('A Display Name is required to establish your vault profile.');
        return;
      }
      if (password.length < 6) {
        setAuthError('For safety, passwords must contain at least 6 tokens.');
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
        setAuthError('Please provide your registered email coordinate.');
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
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-[#3B4CCA] to-[#FFCB05] text-white">
            <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1-15.5c2.48 0 4.5 2.02 4.5 4.5S15.48 15.5 13 15.5s-4.5-2.02-4.5-4.5 2.02-4.5 4.5-4.5zm-1 16c-3.87 0-7-3.13-7-7 0-.5.06-1 .17-1.47l4.31 4.31c1.1-.38 2.37.18 2.87 1.25.1.22.15.46.15.7l-.01.21h-.1c-.96 0-1.89-.39-2.58-1.08l-2.01-2.01c-.49-.49-1.28-.49-1.77 0-.49.49-.49 1.28 0 1.77l3.87 3.87C9.28 18.81 10.61 19 12 19c4.96 0 9-4.04 9-9h.5c0 4.96-4.04 9-9 9z" />
            </svg>
          </div>
          <span className="text-lg font-black tracking-widest text-white font-mono uppercase">
            Poké<span className="text-[#FFCB05]">Vault</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
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
            CREATE FREE ACCOUNT
          </button>
        </div>
      </nav>

      {/* Main Core Section Blocks Wrapper */}
      <main className="relative max-w-7xl mx-auto px-6 pt-12 md:pt-20 space-y-32">
        
        {/* 1. Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/50 border border-indigo-500/20 text-indigo-400 rounded-full font-mono text-[10px] tracking-widest uppercase font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE PORTFOLIO PLATFORM FOR SERIOUS COLLECTORS</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] font-mono">
              Your Pokémon <br className="hidden md:inline" />
              Collection. <br className="hidden md:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFCB05] via-[#3B4CCA] to-indigo-400">
                Organized. Tracked. Valued.
              </span>
            </h1>

            <p className="text-slate-400 text-base md:text-lg max-w-xl leading-relaxed">
              Track your cards, monitor collection growth, and build your personal Pokémon TCG portfolio with real-time analytics, Condition valuations, and custom binders.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  changeAuthMode('register');
                  setShowAuthModal(true);
                }}
                className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-4 px-8 text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FFCB05]/10 font-mono"
              >
                <span>CREATE FREE ACCOUNT</span>
                <ArrowRight className="w-4 h-4 shrink-0 stroke-[3px]" />
              </button>

              <a
                href="#features"
                className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-2xl py-4 px-8 text-sm font-semibold hover:text-white transition-all text-center flex items-center justify-center gap-2 cursor-pointer font-mono"
              >
                <span>EXPLORE FEATURES</span>
              </a>
            </div>

            {/* Micro stats banner for elite feel */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-900/60 max-w-md">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Live API Sets</span>
                <span className="text-lg font-bold text-white mt-0.5">150+ Sets</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Active Investors</span>
                <span className="text-lg font-bold text-white mt-0.5">12,000+</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Portfolios Loaded</span>
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
                  <span className="text-[9px] text-slate-500 font-mono uppercase block tracking-wider">TOTAL VAULT VALUE</span>
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
              Engineered for True Collectors
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every features has been customized to mimic the precision and accuracy demanded by high-value TCG investors and grading purists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1: Collection Management */}
            <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
              <div className="w-10 h-10 rounded-xl bg-[#3B4CCA]/10 text-[#3B4CCA] flex items-center justify-center border border-[#3B4CCA]/20 select-none">
                <Database className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-base text-slate-100 font-mono uppercase">Collection Management</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Log and catalogue card specimens cleanly. Link physical holdings immediately to verified official database records automatically.
              </p>
            </div>

            {/* Feature 2: Portfolio Tracking */}
            <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
              <div className="w-10 h-10 rounded-xl bg-[#FFCB05]/15 text-[#FFCB05] flex items-center justify-center border border-[#FFCB05]/30 select-none">
                <LineChart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-base text-slate-100 font-mono uppercase">Portfolio Tracking</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Analyze total cost basis, dynamic gain/losses, and percentage ROI margins continuously. Live calculations support currency exchanges instantly.
              </p>
            </div>

            {/* Feature 3: Price History */}
            <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/25 select-none">
                <Coins className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-base text-slate-100 font-mono uppercase">Price History</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Review historic market fluctuations mapped directly across comprehensive daily timelines to time your purchases and sells perfectly.
              </p>
            </div>

            {/* Feature 4: Wishlist Management */}
            <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/25 select-none">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-base text-slate-100 font-mono uppercase">Wishlist Management</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Bookmark desired cards, construct target purchase thresholds, and see immediately when active market prices dip below your limits.
              </p>
            </div>

            {/* Feature 5: Binder Organization */}
            <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/25 select-none">
                <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-base text-slate-100 font-mono uppercase">Binder Organization</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Partition your collectibles dynamically. Arrange investments, sets, custom master collections, or graded singles into neat virtual folders.
              </p>
            </div>

            {/* Feature 6: Collection Analytics */}
            <div className="p-6 bg-[#0c0e14] border border-slate-850 hover:border-indigo-500/20 rounded-3xl space-y-4 shadow transition-all hover:bg-[#0f1118] group">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/25 select-none">
                <PieChart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-base text-slate-100 font-mono uppercase">Collection Analytics</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Unlock advanced charts mapping card rarities, expansion set progresses, graded certification breakdowns, and milestones.
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
                Active Valuation Showcase
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                See how PokéVault maps purchase entries against dynamic trading price charts to evaluate specimen appreciation.
              </p>
            </div>

            {/* Mock Header indicators */}
            <div className="flex items-center gap-6 font-mono bg-[#0c0e14] p-4 rounded-2xl border border-slate-850 shadow shrink-0">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">SHOWCASE CAP</span>
                <span className="text-sm font-bold text-[#FFCB05]">${totalShowcaseValue}</span>
              </div>
              <div className="w-px h-8 bg-slate-900" />
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">AVG. SECURED VALUE</span>
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
              How PokéVault Secures Value
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Formulate a structured portfolio workflow in four straightforward visual steps.
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
                <span>Search card API</span>
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto sm:mx-0">
                Type any keyword or serialization number to load official card metadata directly. Includes rarities, numbers, images, and live indexes.
              </p>
            </div>

            {/* Journey Step 2: Add Holdings */}
            <div className="space-y-4 relative z-10 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-blue-500/20 text-[#FFCB05] flex items-center justify-center font-mono font-black text-sm mx-auto sm:mx-0">
                02
              </div>
              <h3 className="font-bold text-sm text-white font-mono uppercase flex items-center justify-center sm:justify-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Log Holdings</span>
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto sm:mx-0">
                Input your transactional information: purchase cost, buy date, condition, grading cert number, and private verification specimen photos.
              </p>
            </div>

            {/* Journey Step 3: Monitor Growth */}
            <div className="space-y-4 relative z-10 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-blue-500/20 text-[#FFCB05] flex items-center justify-center font-mono font-black text-sm mx-auto sm:mx-0">
                03
              </div>
              <h3 className="font-bold text-sm text-white font-mono uppercase flex items-center justify-center sm:justify-start gap-1.5">
                <TrendingUp className="w-4 h-4 text-pink-500" />
                <span>Monitor Trends</span>
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto sm:mx-0">
                Check valuation updates dynamically. Review active net-worth curves, percent yield trends, and price fluctuation alarms.
              </p>
            </div>

            {/* Journey Step 4: Organize Binders */}
            <div className="space-y-4 relative z-10 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-blue-500/20 text-[#FFCB05] flex items-center justify-center font-mono font-black text-sm mx-auto sm:mx-0">
                04
              </div>
              <h3 className="font-bold text-sm text-white font-mono uppercase flex items-center justify-center sm:justify-start gap-1.5">
                <Layers className="w-4 h-4 text-purple-500" />
                <span>Sort Binders</span>
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto sm:mx-0">
                Partition valuable cards into designated portfolios or expansion checklists. Simulates physical binder slot tracking flawlessly.
              </p>
            </div>

          </div>
        </section>

        {/* 5. Final CTA Action section panel */}
        <section className="relative rounded-3xl p-8 md:p-14 bg-gradient-to-tr from-[#0b0e14] to-[#121622] border border-slate-850/60 overflow-hidden shadow-2xl flex flex-col items-center text-center space-y-6">
          <div className="absolute inset-0 bg-[#FFCB05]/3 blur-[80px] pointer-events-none" />

          <Sparkles className="w-8 h-8 text-[#FFCB05] animate-bounce" />

          <h2 className="text-2xl md:text-4xl font-extrabold text-white max-w-2xl leading-none font-mono uppercase tracking-tight">
            Start Building Your Pokémon Collection Portfolio
          </h2>

          <p className="text-slate-400 text-xs md:text-sm max-w-lg leading-relaxed">
            Join thousands of collectors who vault, evaluate, and trade with verified statistics. Account creation takes less than 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md pt-2">
            <button
              type="button"
              onClick={() => {
                changeAuthMode('register');
                setShowAuthModal(true);
              }}
              className="bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black tracking-wide rounded-2xl py-3.5 px-8 text-xs font-mono w-full sm:w-auto cursor-pointer"
            >
              CREATE FREE ACCOUNT
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
          </div>
        </section>

      </main>

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
                      {authMode === 'login' && 'ACCESS CREDENTIALS'}
                      {authMode === 'register' && 'METADATA ENROLLMENT'}
                      {authMode === 'forgot' && 'VAULT RECOVERY'}
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
                    {authMode === 'register' && 'Establish Profile'}
                    {authMode === 'forgot' && 'Reset Vault Key'}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                    {authMode === 'login' && 'Decrypt and review your Pokémon portfolios.'}
                    {authMode === 'register' && 'Track and secure your physical specimens with high precision.'}
                    {authMode === 'forgot' && 'Provide your coordinate to recover secure credentials.'}
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
                      <span>COORDINATES TRANSMITTED</span>
                    </div>
                    <p className="leading-relaxed">
                      Safe credentials reset authorization has been dispatched to <span className="font-bold underline text-white">{email}</span>. Click the contained hyperlink inside the next 15 minutes to configure a new keycard.
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
                        {isGoogleLoading ? 'Authenticating with Google...' : 'Securely decrypting vault profile...'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Please wait while we establish remote connections...</p>
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
                          <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Email Coordinate</label>
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
                              <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold font-medium">Vault Keycard / Password</label>
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
                            <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold font-medium">Confirm Vault Password</label>
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
                          {authMode === 'login' && 'DECRYPT & OPEN VAULT'}
                          {authMode === 'register' && 'INITIALIZE VAULT PROFILE'}
                          {authMode === 'forgot' && 'TRANSMIT RESET INSTRUCTIONS'}
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
                          New to PokéVault? <span className="text-[#FFCB05] font-bold underline font-mono">Establish New Vault Profile</span>
                        </button>
                      )}

                      {authMode === 'register' && (
                        <button
                          type="button"
                          onClick={() => changeAuthMode('login')}
                          className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer block w-full select-none"
                        >
                          Already have custom credentials? <span className="text-[#FFCB05] font-bold underline font-mono">Open Vault Account</span>
                        </button>
                      )}

                      {authMode === 'forgot' && (
                        <button
                          type="button"
                          onClick={() => changeAuthMode('login')}
                          className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer block w-full select-none"
                        >
                          Remembered password keycard? <span className="text-[#FFCB05] font-bold underline font-mono">Return to Sign In</span>
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
