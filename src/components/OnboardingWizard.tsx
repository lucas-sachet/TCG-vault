/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Languages, 
  Target, 
  FolderPlus, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  TrendingUp, 
  Plus, 
  Check, 
  HelpCircle,
  HelpCircle as HelpIcon
} from 'lucide-react';

interface OnboardingWizardProps {
  userEmail: string;
  onComplete: (collectionName: string, selectedLanguages: string[], selectedGoals: string[]) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ userEmail, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // State for preferences
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Collection Tracking',
    'Wishlist Management'
  ]);
  const [collectionName, setCollectionName] = useState('My Collection');
  const [isEntering, setIsEntering] = useState(false);
  const [inputFeedback, setInputFeedback] = useState<string | null>(null);

  // Toggle helpers
  const handleToggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(lang)) {
        // Prevent clearing all languages to avoid empty states
        if (prev.length === 1) return prev;
        return prev.filter(l => l !== lang);
      }
      return [...prev, lang];
    });
  };

  const handleToggleGoal = (goal: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goal)) {
        if (prev.length === 1) return prev;
        return prev.filter(g => g !== goal);
      }
      return [...prev, goal];
    });
  };

  // Step movement handlers with strict input validation safeguards
  const handleNext = () => {
    if (currentStep === 4) {
      if (!collectionName.trim()) {
        setInputFeedback('Please provide a name for your first collection organizer.');
        return;
      }
      setInputFeedback(null);
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setInputFeedback(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinish = () => {
    setIsEntering(true);
    setTimeout(() => {
      onComplete(collectionName.trim(), selectedLanguages, selectedGoals);
    }, 1200);
  };

  // Total steps definition
  const totalSteps = 5;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      
      {/* Immersive backdrop glowing coordinates matching landing page exactly */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full bg-gradient-to-br from-indigo-900/20 to-blue-905/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[45%] rounded-full bg-gradient-to-br from-[#3B4CCA]/10 to-[#FFCB05]/5 blur-[120px] pointer-events-none" />

      {/* Main Stepper Card Frame */}
      <div className="w-full max-w-xl bg-[#0c0e14] border border-slate-850 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden z-20 flex flex-col justify-between min-h-[500px]">
        {/* Dynamic header progress border accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#3B4CCA] via-[#FFCB05] to-indigo-500"
            initial={{ width: '20%' }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        {/* Stepper Wizard Top Indicator */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FFCB05] animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-widest">ONBOARDING SEQUENCE</span>
          </div>
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-mono font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
            STEP {currentStep} OF {totalSteps}
          </span>
        </div>

        {/* Dynamic Main Body Content Router with framer motion animations */}
        <div className="flex-grow flex flex-col justify-center py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="space-y-5"
            >
              
              {/* STEP 1: WELCOME TO POKEVAULT */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-tr from-[#3B4CCA] to-indigo-600 rounded-2xl w-fit border border-indigo-500/20">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1-15.5c2.48 0 4.5 2.02 4.5 4.5S15.48 15.5 13 15.5s-4.5-2.02-4.5-4.5 2.02-4.5 4.5-4.5zm-1 16c-3.87 0-7-3.13-7-7 0-.5.06-1 .17-1.47l4.31 4.31c1.1-.38 2.37.18 2.87 1.25.1.22.15.46.15.7l-.01.21h-.1c-.96 0-1.89-.39-2.58-1.08l-2.01-2.01c-.49-.49-1.28-.49-1.77 0-.49.49-.49 1.28 0 1.77l3.87 3.87C9.28 18.81 10.61 19 12 19c4.96 0 9-4.04 9-9h.5c0 4.96-4.04 9-9 9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-white font-mono uppercase">Welcome to PokéVault</h3>
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{userEmail}</p>
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                    PokéVault is an advanced, secure portfolio manager tailored specifically for Pokémon TCG collectors and investors. It enables tracking raw and graded specimens, monitoring live market fluctuations, organizing digital binders, and setting custom high-utility collection targets.
                  </p>

                  <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl space-y-3">
                    <div className="flex gap-2.5 items-start text-xs text-slate-300">
                      <div className="p-1.5 bg-yellow-400/10 text-[#FFCB05] rounded-lg mt-0.5 shrink-0">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                      <p className="leading-relaxed">
                        <span className="font-bold text-slate-200 block mb-0.5">Live Valuation Indexing</span>
                        Monitor real-time card valuations tracked against leading TCG marketplace index API feeds.
                      </p>
                    </div>
                    <div className="flex gap-2.5 items-start text-xs text-slate-300">
                      <div className="p-1.5 bg-blue-400/15 text-indigo-400 rounded-lg mt-0.5 shrink-0">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <p className="leading-relaxed">
                        <span className="font-bold text-slate-200 block mb-0.5">Surgical Digital Binders</span>
                        Organize your collections inside interactive tactile binders complete with grade cert numbers, conditions, and custom micro-photos.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: LANGUAGE PREFERENCES */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-md font-bold text-white uppercase font-mono flex items-center gap-2">
                      <Languages className="w-4 h-4 text-[#FFCB05]" />
                      <span>Select Collecting Preferences</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Choose the card language editions you primarily collect. Allow multiple selections.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {/* Option 1: English */}
                    <div 
                      onClick={() => handleToggleLanguage('English')}
                      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer h-24 ${
                        selectedLanguages.includes('English') 
                          ? 'bg-[#3B4CCA]/5 border-[#3B4CCA] shadow-lg shadow-indigo-600/5' 
                          : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div className={`p-1.5 rounded-xl text-xs font-black shrink-0 ${selectedLanguages.includes('English') ? 'bg-[#3B4CCA] text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {selectedLanguages.includes('English') ? <Check className="w-4 h-4" /> : 'EN'}
                      </div>
                      <div className="flex-grow min-w-0">
                        <span className="font-bold text-xs text-white block">English Cards</span>
                        <span className="text-[10px] text-slate-500 mt-1 block leading-normal">
                          Primary standard global sets including Base Set, Sword & Shield, Scarlet & Violet.
                        </span>
                      </div>
                    </div>

                    {/* Option 2: Japanese */}
                    <div 
                      onClick={() => handleToggleLanguage('Japanese')}
                      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer h-24 ${
                        selectedLanguages.includes('Japanese') 
                          ? 'bg-[#3B4CCA]/5 border-[#3B4CCA] shadow-lg shadow-indigo-600/5' 
                          : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div className={`p-1.5 rounded-xl text-xs font-black shrink-0 ${selectedLanguages.includes('Japanese') ? 'bg-[#3B4CCA] text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {selectedLanguages.includes('Japanese') ? <Check className="w-4 h-4" /> : 'JP'}
                      </div>
                      <div className="flex-grow min-w-0">
                        <span className="font-bold text-xs text-white block">Japanese Cards</span>
                        <span className="text-[10px] text-slate-500 mt-1 block leading-normal">
                          High-grade textured variants, exclusive Japanese promo releases, and strict vintage runs.
                        </span>
                      </div>
                    </div>

                    {/* Option 3: Portuguese */}
                    <div 
                      onClick={() => handleToggleLanguage('Portuguese')}
                      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer h-24 ${
                        selectedLanguages.includes('Portuguese') 
                          ? 'bg-[#3B4CCA]/5 border-[#3B4CCA] shadow-lg shadow-indigo-600/5' 
                          : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div className={`p-1.5 rounded-xl text-xs font-black shrink-0 ${selectedLanguages.includes('Portuguese') ? 'bg-[#3B4CCA] text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {selectedLanguages.includes('Portuguese') ? <Check className="w-4 h-4" /> : 'PT'}
                      </div>
                      <div className="flex-grow min-w-0">
                        <span className="font-bold text-xs text-white block">Portuguese Cards</span>
                        <span className="text-[10px] text-slate-500 mt-1 block leading-normal">
                          Brazilian set variants, vintage editions, and regional collectible leagues.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: COLLECTION GOALS */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-md font-bold text-white uppercase font-mono flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#FFCB05]" />
                      <span>Collection Goals</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 hidden sm:block">
                      Select your goals to fine-tune active telemetry and tracking dashboards.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Goal 1: Collection Tracking */}
                    <div 
                      onClick={() => handleToggleGoal('Collection Tracking')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-[105px] ${
                        selectedGoals.includes('Collection Tracking') 
                          ? 'bg-[#3B4CCA]/5 border-[#3B4CCA]' 
                          : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[11px] text-slate-100 block">Collection Tracking</span>
                        {selectedGoals.includes('Collection Tracking') && <Check className="w-3.5 h-3.5 text-[#FFCB05]" />}
                      </div>
                      <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">
                        Track raw/graded item coordinates, preserve condition profiles, and view photo cards.
                      </p>
                    </div>

                    {/* Goal 2: Investment Tracking */}
                    <div 
                      onClick={() => handleToggleGoal('Investment Tracking')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-[105px] ${
                        selectedGoals.includes('Investment Tracking') 
                          ? 'bg-[#3B4CCA]/5 border-[#3B4CCA]' 
                          : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[11px] text-slate-100 block">Investment Tracking</span>
                        {selectedGoals.includes('Investment Tracking') && <Check className="w-3.5 h-3.5 text-[#FFCB05]" />}
                      </div>
                      <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">
                        Analyze ROI, cost basis distributions, historical charts, and financial gain ratios.
                      </p>
                    </div>

                    {/* Goal 3: Master Sets */}
                    <div 
                      onClick={() => handleToggleGoal('Master Sets')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-[105px] ${
                        selectedGoals.includes('Master Sets') 
                          ? 'bg-[#3B4CCA]/5 border-[#3B4CCA]' 
                          : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[11px] text-slate-100 block">Master Sets</span>
                        {selectedGoals.includes('Master Sets') && <Check className="w-3.5 h-3.5 text-[#FFCB05]" />}
                      </div>
                      <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">
                        Audit checklist maps for set completion, find missing spots, and optimize binders.
                      </p>
                    </div>

                    {/* Goal 4: Wishlist Management */}
                    <div 
                      onClick={() => handleToggleGoal('Wishlist Management')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-[105px] ${
                        selectedGoals.includes('Wishlist Management') 
                          ? 'bg-[#3B4CCA]/5 border-[#3B4CCA]' 
                          : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[11px] text-slate-100 block">Wishlist Management</span>
                        {selectedGoals.includes('Wishlist Management') && <Check className="w-3.5 h-3.5 text-[#FFCB05]" />}
                      </div>
                      <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">
                        Track upcoming set desires, target dynamic buying prices, and plan transactions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: CREATE FIRST COLLECTION */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-md font-bold text-white uppercase font-mono flex items-center gap-2">
                      <FolderPlus className="w-4 h-4 text-[#FFCB05]" />
                      <span>Establish First Collection Binder</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Set a custom name for your initial collection. We will auto-configure a tactile binder with this name.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Binder Title</label>
                      <div className="relative">
                        <FolderPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="e.g., My Collection, Ultra Rare Slabs, Vintage Promos..."
                          value={collectionName}
                          onChange={(e) => {
                            setCollectionName(e.target.value);
                            if (inputFeedback) setInputFeedback(null);
                          }}
                          className="w-full bg-[#151720] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-3 py-3.5 focus:outline-none focus:border-[#FFCB05]/40 transition-all focus:ring-1 focus:ring-[#FFCB05]/10 font-mono"
                          required
                        />
                      </div>
                      {inputFeedback && (
                        <p className="text-[10px] text-red-500 font-semibold">{inputFeedback}</p>
                      )}
                    </div>

                    <div className="bg-slate-900/30 border border-slate-850/60 p-4 rounded-xl space-y-2">
                      <span className="text-[8px] bg-[#FFCB05]/10 text-[#FFCB05] font-mono px-2 py-0.5 rounded uppercase font-bold leading-none w-fit block">AUTOMATIC GENERATION</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Creating your primary folder installs a standard digital spreadsheet ledger where empty sleeve grids are prepared to take physical card registrations seamlessly once you start.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: ENTER DASHBOARD */}
              {currentStep === 5 && (
                <div className="space-y-5 text-center py-6">
                  <div className="relative w-16 h-16 mx-auto">
                    {/* Pulsing visual circles */}
                    <div className="absolute inset-0 bg-[#FFCB05]/20 rounded-full animate-ping pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#3B4CCA] to-indigo-600 rounded-full flex items-center justify-center border border-[#FFCB05]/40 shadow-lg">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight text-white font-mono uppercase">Onboarding Completed</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto font-semibold leading-relaxed">
                      Your premium PokéVault workspace is fully configured and secured! Decryption keys have been assigned to your profile coordinates.
                    </p>
                  </div>

                  {/* Summary grid */}
                  <div className="bg-[#151720]/80 border border-slate-850 rounded-2xl p-4 text-left max-w-sm mx-auto grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[8px] text-slate-500 font-mono uppercase block">Primary Vault</span>
                      <span className="text-xs font-bold text-white block truncate">{collectionName}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 font-mono uppercase block">Languages</span>
                      <span className="text-xs font-bold text-white block truncate">{selectedLanguages.join(', ')}</span>
                    </div>
                    <div className="col-span-2 border-t border-slate-850 pt-2.5">
                      <span className="text-[8px] text-slate-500 font-mono uppercase block">Configured Telemetry Goals</span>
                      <span className="text-xs font-bold text-indigo-400 block truncate">{selectedGoals.join(' & ')}</span>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Controls Navigation Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-900 mt-4 gap-4">
          {/* Back Action button */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1 || isEntering}
            className="flex items-center gap-1.5 px-4 py-3 bg-slate-900 border border-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-xs font-bold font-mono tracking-wide text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>

          {/* Forward / Finish Action button */}
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isEntering}
              className="flex items-center gap-2 bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 px-5 py-3 rounded-xl text-xs font-black font-mono tracking-wider transition-all hover:shadow-lg hover:shadow-yellow-500/10 active:scale-[0.98] cursor-pointer"
            >
              <span>CONTINUE</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isEntering}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl text-xs font-black font-mono tracking-wider transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] cursor-pointer min-w-[150px] justify-center"
            >
              {isEntering ? (
                <div className="flex items-center gap-2 font-mono">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>DECRYPTING...</span>
                </div>
              ) : (
                <>
                  <span>ENTER DASHBOARD</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Safety developer help notes block */}
      <p className="text-[10px] text-slate-500 font-mono tracking-wide uppercase mt-4 text-center z-15">
        PokéVault Security Core &reg; {new Date().getFullYear()} &bull; Interactive Sandbox
      </p>
    </div>
  );
};
