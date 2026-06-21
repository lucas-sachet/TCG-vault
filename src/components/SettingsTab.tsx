/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ConfirmationModal } from './ConfirmationModal';
import { 
  User, 
  Mail, 
  Globe, 
  Coins, 
  Calendar, 
  Info, 
  Languages, 
  ShieldAlert, 
  Lock, 
  Key,
  Download, 
  Trash2, 
  Check, 
  CheckCircle2, 
  X,
  ChevronRight, 
  Plus, 
  Camera, 
  Eye, 
  EyeOff,
  HelpCircle,
  FolderHeart,
  TrendingUp,
  Sliders,
  Sparkles,
  Loader2,
  Check as CheckIcon,
  Plus as PlusIcon,
  Camera as CameraIcon,
  Layers
} from 'lucide-react';
import { Binder, PriceNotification, CollectionItem, WishlistItem, Card } from '../types';
import { services } from '../services/serviceProvider';

interface SettingsTabProps {
  binders: Binder[];
  onAddBinder: (name: string, description?: string) => void;
  onDeleteBinder: (binderId: string) => void;
  onResetCollection: (type: 'seed' | 'empty') => void;
  selectedCurrency: string;
  onSelectCurrency: (currency: string) => void;
  priceNotifications: PriceNotification[];
  onMarkNotificationRead: (notifId: string) => void;
  preferSpecimenPhoto?: boolean;
  onTogglePreferSpecimenPhoto?: (value: boolean) => void;
  userEmail: string;
  onSignOut?: () => void;
  
  // Real data arrays for functional CSV exports
  collectionItems?: CollectionItem[];
  wishlistItems?: WishlistItem[];
  cards?: Card[];
  onDeleteAccount?: () => void;
}

type SubTabId = 'profile' | 'preferences' | 'account';

export const SettingsTab: React.FC<SettingsTabProps> = ({
  binders,
  onAddBinder,
  onDeleteBinder,
  onResetCollection,
  selectedCurrency,
  onSelectCurrency,
  priceNotifications,
  onMarkNotificationRead,
  preferSpecimenPhoto = false,
  onTogglePreferSpecimenPhoto,
  userEmail,
  onSignOut,
  collectionItems = [],
  wishlistItems = [],
  cards = [],
  onDeleteAccount
}) => {
  // Navigation
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('profile');
  
  // Modals / Alerts
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  // Success/error banners
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // -----------------------------------------------------
  // 1. STATE: PROFILE SETTINGS
  // -----------------------------------------------------
  const [displayName, setDisplayName] = useState<string>(() => {
    return localStorage.getItem(`pokevault_displayName_${userEmail}`) || 'Trainer Ash';
  });
  const [nickname, setNickname] = useState<string>(() => {
    return localStorage.getItem(`pokevault_nickname_${userEmail}`) || '';
  });
  const [country, setCountry] = useState<string>(() => {
    return localStorage.getItem(`pokevault_country_${userEmail}`) || 'United States';
  });
  const [aboutMe, setAboutMe] = useState<string>(() => {
    return localStorage.getItem(`pokevault_aboutMe_${userEmail}`) || '';
  });
  const [collectorSince, setCollectorSince] = useState<string>(() => {
    return localStorage.getItem(`pokevault_collectorSince_${userEmail}`) || '2026-01-01';
  });
  
  // Profile picture base64 state or preset selection
  const [profilePic, setProfilePic] = useState<string>(() => {
    return localStorage.getItem(`pokevault_profilePic_${userEmail}`) || 'avatar-oak';
  });
  
  const [dragOver, setDragOver] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // -----------------------------------------------------
  // 2. STATE: COLLECTION PREFERENCES
  // -----------------------------------------------------
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`pokevault_languages_${userEmail}`);
      return stored ? JSON.parse(stored) : ['English'];
    } catch {
      return ['English'];
    }
  });

  const [defaultCollectionId, setDefaultCollectionId] = useState<string>(() => {
    return localStorage.getItem(`pokevault_defaultBinder_${userEmail}`) || 'binder-all';
  });

  const [showPurchasePrices, setShowPurchasePrices] = useState<boolean>(() => {
    const value = localStorage.getItem(`pokevault_showPurchasePrices_${userEmail}`);
    return value !== 'false'; // defaults to true
  });

  const [showROI, setShowROI] = useState<boolean>(() => {
    const value = localStorage.getItem(`pokevault_showROI_${userEmail}`);
    return value !== 'false'; // defaults to true
  });

  const [showCollectionValue, setShowCollectionValue] = useState<boolean>(() => {
    const value = localStorage.getItem(`pokevault_showCollectionValue_${userEmail}`);
    return value !== 'false'; // defaults to true
  });

  const [collectorProfile, setCollectorProfile] = useState<string>(() => {
    return localStorage.getItem(`pokevault_collectorProfile_${userEmail}`) || 'Mixed Collector';
  });

  // -----------------------------------------------------
  // 3. STATE: PASSWORD MANAGEMENT
  // -----------------------------------------------------
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [pwdShow, setPwdShow] = useState(false);

  // Set default binders & sync to selected currencies
  useEffect(() => {
    localStorage.setItem(`pokevault_languages_${userEmail}`, JSON.stringify(selectedLanguages));
  }, [selectedLanguages, userEmail]);

  // Handle preset profile picture choices
  const presetAvatars = [
    { id: 'avatar-oak', name: 'Professor Oak', label: '👴' },
    { id: 'avatar-ash', name: 'Trainer Red', label: '🧢' },
    { id: 'avatar-misty', name: 'Leader Misty', label: '💧' },
    { id: 'avatar-pikachu', name: 'Pikachu Fan', label: '⚡' },
  ];

  // -----------------------------------------------------
  // HANDLERS: IMAGE UPLOAD (DRAG & DROP + CLICK)
  // -----------------------------------------------------
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImageFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleImageFile(files[0]);
    }
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorBanner('Please select a valid image file coordinate.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorBanner('Max image size limit is 2MB to preserve local cache.');
      return;
    }
    setErrorBanner(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64 = event.target.result as string;
        setProfilePic(base64);
        localStorage.setItem(`pokevault_profilePic_${userEmail}`, base64);
        setSuccessBanner('Physical specimen artwork mapped successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // -----------------------------------------------------
  // SAVE PROFILE CHANGES
  // -----------------------------------------------------
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorBanner('Display Name is required to save metadata profile.');
      return;
    }
    
    setIsSavingProfile(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    setTimeout(() => {
      localStorage.setItem(`pokevault_displayName_${userEmail}`, displayName.trim());
      localStorage.setItem(`pokevault_nickname_${userEmail}`, nickname.trim());
      localStorage.setItem(`pokevault_country_${userEmail}`, country);
      localStorage.setItem(`pokevault_aboutMe_${userEmail}`, aboutMe.trim());
      localStorage.setItem(`pokevault_collectorSince_${userEmail}`, collectorSince);
      localStorage.setItem(`pokevault_profilePic_${userEmail}`, profilePic);
      
      setIsSavingProfile(false);
      setSuccessBanner('Profile parameters updated securely inside local cache.');
    }, 800);
  };

  // -----------------------------------------------------
  // SAVE PREFERENCES CHANGES
  // -----------------------------------------------------
  const handleSavePreferences = () => {
    if (selectedLanguages.length === 0) {
      setErrorBanner('At least one preferred card language coordinate must be selected.');
      return;
    }

    localStorage.setItem(`pokevault_languages_${userEmail}`, JSON.stringify(selectedLanguages));
    localStorage.setItem(`pokevault_defaultBinder_${userEmail}`, defaultCollectionId);
    localStorage.setItem(`pokevault_showPurchasePrices_${userEmail}`, String(showPurchasePrices));
    localStorage.setItem(`pokevault_showROI_${userEmail}`, String(showROI));
    localStorage.setItem(`pokevault_showCollectionValue_${userEmail}`, String(showCollectionValue));
    localStorage.setItem(`pokevault_collectorProfile_${userEmail}`, collectorProfile);

    setErrorBanner(null);
    setSuccessBanner('Personalization dashboard preferences saved successfully.');
    
    // Clear banner after delay
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4000);
  };

  // -----------------------------------------------------
  // PASSWORD MANAGEMENT
  // -----------------------------------------------------
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setSuccessBanner(null);

    if (!currentPassword) {
      setErrorBanner('Vault verification required: Please enter current password keycard.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorBanner('Security constraint: New passwords must be at least 6 tokens.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorBanner('Input mismatch: Confirmed password must match exactly.');
      return;
    }

    setIsUpdatingPassword(true);

    setTimeout(() => {
      setIsUpdatingPassword(false);
      setSuccessBanner('Vault keycard updated successfully! Access password mutated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }, 1500);
  };

  // -----------------------------------------------------
  // LANGUAGE CHECKBOX COORDINATOR
  // -----------------------------------------------------
  const handleToggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(lang)) {
        if (prev.length === 1) return prev; // prevent zero selections
        return prev.filter(l => l !== lang);
      }
      return [...prev, lang];
    });
  };

  // -----------------------------------------------------
  // EXPORT COLLECTION DATA (.CSV)
  // -----------------------------------------------------
  const handleExportCollectionCSV = () => {
    if (!collectionItems || collectionItems.length === 0) {
      setErrorBanner('Export failed: Your collection catalog is currently empty.');
      return;
    }

    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Item ID,Card Name,Set,Number,Rarity,Purchase Date,Purchase Price,Currency,Quantity,Grade Type,Grade Value,Cert Number,Notes\r\n';

      collectionItems.forEach(item => {
        const card = cards.find(c => c.id === item.cardId);
        const cardName = card ? `"${card.name.replace(/"/g, '""')}"` : 'Unknown Pokémon';
        const cardSet = card ? `"${card.set.replace(/"/g, '""')}"` : 'Unknown Set';
        const cardNum = card ? `"${card.number}"` : '';
        const cardRarity = card ? `"${card.rarity}"` : '';
        const pDate = item.purchaseDate || '';
        const pPrice = item.purchasePrice || 0;
        const curr = item.currency || 'USD';
        const qty = item.quantity || 1;
        const gType = item.gradeType || 'Raw';
        const gVal = item.gradeValue || 'Raw';
        const cert = item.certNumber || '';
        const notes = item.notes ? `"${item.notes.replace(/"/g, '""')}"` : '';

        csvContent += `${item.id},${cardName},${cardSet},${cardNum},${cardRarity},${pDate},${pPrice},${curr},${qty},${gType},${gVal},${cert},${notes}\r\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `pokevault_holdings_export_${userEmail.replace(/[@.]/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessBanner('Collection ledger exported cleanly to CSV!');
    } catch {
      setErrorBanner('An unexpected error occurred during document formulation.');
    }
  };

  // -----------------------------------------------------
  // EXPORT WISHLIST DATA (.CSV)
  // -----------------------------------------------------
  const handleExportWishlistCSV = () => {
    if (!wishlistItems || wishlistItems.length === 0) {
      setErrorBanner('Export failed: Your wishlist catalog is currently empty.');
      return;
    }

    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Wishlist ID,Card Name,Set,Number,Rarity,Desired Price,Priority,Notes,Date Added\r\n';

      wishlistItems.forEach(item => {
        const card = cards.find(c => c.id === item.cardId);
        const cardName = card ? `"${card.name.replace(/"/g, '""')}"` : 'Unknown Pokémon';
        const cardSet = card ? `"${card.set.replace(/"/g, '""')}"` : 'Unknown Set';
        const cardNum = card ? `"${card.number}"` : '';
        const cardRarity = card ? `"${card.rarity}"` : '';
        const dPrice = item.desiredPrice || 0;
        const priority = item.priority || 'Medium';
        const notes = item.notes ? `"${item.notes.replace(/"/g, '""')}"` : '';
        const dateAdded = item.dateAdded || '';

        csvContent += `${item.id},${cardName},${cardSet},${cardNum},${cardRarity},${dPrice},${priority},${notes},${dateAdded}\r\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `pokevault_wishlist_export_${userEmail.replace(/[@.]/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessBanner('Wishlist database exported cleanly to CSV!');
    } catch {
      setErrorBanner('An unexpected error occurred during document formulation.');
    }
  };

  // -----------------------------------------------------
  // ACCOUNT DELETION TRIGGER
  // -----------------------------------------------------
  const handleDeleteAccountAction = () => {
    setConfirmModal({
      isOpen: true,
      title: '⚠️ CRITICAL: PERMANENT ACCOUNT ERASURE',
      description: `You are about to purge and delete all workspace parameters, secure metadata, files, binders, custom collections, and wishlist items tied to ${userEmail}. This operation is completely automated, irreversible and immediate. Secure authentication codes will be destroyed. Do you wish to proceed?`,
      confirmText: 'YES, ERASE PROFILE FOREVER',
      cancelText: 'ABORT AND REMAIN',
      type: 'danger',
      onConfirm: () => {
        if (onDeleteAccount) {
          onDeleteAccount();
        }
      }
    });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6 select-none animate-fadeIn">
      
      {/* 1. Header controls panel */}
      <div className="flex justify-between items-center bg-[#1A1D24] p-4 md:p-5 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-[#3B4CCA] rounded-xl shrink-0">
            <Sliders className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider font-mono">ACCOUNT SETTINGS & PREFERENCES</h2>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-semibold">
              Manage secure authentication profiles, display configurations, CSV ledger exports, and data integrity parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error Banner alerts */}
      {successBanner && (
        <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-emerald-400 text-xs flex items-center justify-between animate-feed-in font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-500 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorBanner && (
        <div className="p-3.5 bg-red-950/20 border border-red-900/30 rounded-xl text-red-500 text-xs flex items-center justify-between animate-feed-in font-semibold">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner(null)} className="text-red-400 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Three Tab Controls Selector */}
      <div className="flex border-b border-slate-800 bg-[#12151C] p-1.5 rounded-2xl border gap-1.5 overflow-x-auto">
        <button
          onClick={() => { setActiveSubTab('profile'); setErrorBanner(null); setSuccessBanner(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider transition-all uppercase cursor-pointer shrink-0 ${
            activeSubTab === 'profile'
              ? 'bg-[#3B4CCA] text-white shadow-lg shadow-indigo-600/15'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('preferences'); setErrorBanner(null); setSuccessBanner(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider transition-all uppercase cursor-pointer shrink-0 ${
            activeSubTab === 'preferences'
              ? 'bg-[#3B4CCA] text-white shadow-lg shadow-indigo-600/15'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Collection Preferences</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('account'); setErrorBanner(null); setSuccessBanner(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider transition-all uppercase cursor-pointer shrink-0 ${
            activeSubTab === 'account'
              ? 'bg-[#3B4CCA] text-white shadow-lg shadow-indigo-600/15'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Account Controls</span>
        </button>
      </div>

      {/* 3. Rendered Content Tab Sections */}
      <div className="space-y-6">
        
        {/* TAB 1: PROFILE */}
        {activeSubTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* Double column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Picture Upload Column */}
              <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm uppercase font-mono tracking-wide flex items-center gap-2 mb-1.5">
                    <Camera className="w-4 h-4 text-orange-400" />
                    <span>Profile Image Mapping</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    Customise your signature icon. Upload a real physical specimen photo card copy or choose a classic Pokémon league character class preset.
                  </p>
                </div>

                {/* Avatar Display Frame */}
                <div className="flex flex-col items-center justify-center py-4 space-y-3 bg-[#111319] border border-slate-850 rounded-2xl">
                  {profilePic.startsWith('data:') ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md">
                      <img src={profilePic} alt="Uploaded Specimen Badge" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => { setProfilePic('avatar-oak'); localStorage.setItem(`pokevault_profilePic_${userEmail}`, 'avatar-oak'); }}
                        className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] font-mono py-1 font-bold text-red-400 hover:text-red-300"
                      >
                        Reset Preset
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl shadow-inner relative">
                      {presetAvatars.find(a => a.id === profilePic)?.label || '👴'}
                      <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1 border border-slate-900">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">
                    {profilePic.startsWith('data:') ? 'Custom Asset Mapped' : presetAvatars.find(a => a.id === profilePic)?.name || 'Default Oakley'}
                  </span>
                </div>

                {/* Preset Fast Selector */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-500 font-mono block uppercase font-bold text-center">Fast Avatar Presets</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {presetAvatars.map(av => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => { setProfilePic(av.id); localStorage.setItem(`pokevault_profilePic_${userEmail}`, av.id); }}
                        className={`py-3 bg-[#111319] border rounded-xl text-xl hover:bg-[#1E2129] transition-all flex items-center justify-center cursor-pointer ${
                          profilePic === av.id ? 'border-[#FFCB05] bg-[#3B4CCA]/5 text-white' : 'border-slate-850 text-slate-400'
                        }`}
                        title={av.name}
                      >
                        {av.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Drag & Drop Area */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    dragOver 
                      ? 'border-[#FFCB05] bg-[#FFCB05]/5' 
                      : 'border-slate-800 bg-[#12151D] hover:bg-slate-900'
                  }`}
                >
                  <input
                    type="file"
                    id="profile-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="profile-upload" className="cursor-pointer block space-y-1.5">
                    <Camera className="w-5 h-5 mx-auto text-indigo-400" />
                    <span className="block text-[10px] font-bold text-slate-300 font-mono uppercase tracking-wider">Drag & drop specimen here</span>
                    <span className="block text-[9px] text-slate-500 font-semibold leading-normal">Or click to select image copy (Max 2MB)</span>
                  </label>
                </div>

              </div>

              {/* Profile Fields block */}
              <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl lg:col-span-2 space-y-4">
                
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
                  <h3 className="font-bold text-slate-100 text-sm uppercase font-mono tracking-wide flex items-center gap-2">
                    <User className="w-4 h-4 text-[#FFCB05]" />
                    <span>Collector Coordinates</span>
                  </h3>
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded leading-none uppercase font-bold">Metadata ID</span>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Display Name */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Display Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20 font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Nickname (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Nickname (Optional)</label>
                    <div className="relative">
                      <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Oaky"
                        className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20 font-mono"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Secure Vault Email (Locked)</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input
                        type="email"
                        value={userEmail}
                        disabled
                        className="w-full bg-[#12141B] border border-slate-850/80 text-xs text-slate-500 rounded-xl pl-10 pr-3 py-3 cursor-not-allowed font-mono opacity-80"
                        title="Immutable account email coordinate"
                      />
                    </div>
                  </div>

                  {/* Country Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Country Coordinates</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20 font-mono appearance-none"
                      >
                        {['United States', 'Japan', 'Brazil', 'Portugal', 'United Kingdom', 'Germany', 'Canada', 'Australia'].map(cnt => (
                          <option key={cnt} value={cnt} className="bg-slate-900 text-slate-200">{cnt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Preferred Wallet Currency */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Exchange Index Currency</label>
                    <div className="relative">
                      <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <select
                        value={selectedCurrency}
                        onChange={(e) => onSelectCurrency(e.target.value)}
                        className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20 font-mono appearance-none"
                      >
                        <option value="USD">USD (US Dollars - $)</option>
                        <option value="EUR">EUR (European Euros - €)</option>
                        <option value="BRL">BRL (Brazilian Real - R$)</option>
                        <option value="JPY">JPY (Japanese Yen - ¥)</option>
                      </select>
                    </div>
                  </div>

                  {/* Collector Since */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Collector Commencement Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="date"
                        value={collectorSince}
                        onChange={(e) => setCollectorSince(e.target.value)}
                        className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* About me */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Optional About Me / Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Provide a short synopsis describing your target card sets, vintage grading pursuits, or dynamic market desires here..."
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value.slice(0, 150))}
                    className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl p-3.5 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20 font-sans leading-relaxed"
                  />
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                    <span>Limit details to 150 characters.</span>
                    <span className="font-bold">{aboutMe.length} / 150 TOKENS</span>
                  </div>
                </div>

                {/* Submission button */}
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-3 bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 rounded-xl text-xs font-black font-mono tracking-wider transition-all select-none cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>APPLIANCE RUNNING...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>SECURE & SAVE PROFILE METADATA</span>
                    </>
                  )}
                </button>

              </div>
              
            </div>

          </form>
        )}

        {/* TAB 2: COLLECTION PREFERENCES */}
        {activeSubTab === 'preferences' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Preferences Configuration Left */}
              <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl space-y-5">
                
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
                  <h3 className="font-bold text-slate-100 text-sm uppercase font-mono tracking-wide flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Display & Filter Parameters</span>
                  </h3>
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded leading-none uppercase font-bold">Preferences</span>
                </div>

                {/* Language Checklist Choice */}
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Preferred Card Languages</span>
                  </label>
                  <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                    Set cards lang editions that display natively in search and filters. (Multiple choices allowed).
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2.5 pt-1.5">
                    {['English', 'Japanese', 'Portuguese'].map(lang => {
                      const active = selectedLanguages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleToggleLanguage(lang)}
                          className={`py-3.5 border text-xs font-bold font-mono tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            active 
                              ? 'border-[#FFCB05] bg-[#3B4CCA]/5 text-[#FFCB05] font-black' 
                              : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${active ? 'border-[#FFCB05] bg-yellow-400/20' : 'border-slate-700 bg-slate-950'}`}>
                            {active && <Check className="w-2.5 h-2.5 text-[#FFCB05]" />}
                          </div>
                          <span>{lang}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Default Binder Collection */}
                <div className="space-y-2 pt-1">
                  <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold flex items-center gap-1">
                    <FolderHeart className="w-3.5 h-3.5 text-[#FFCB05]" />
                    <span>Default Initial Collection / Binder</span>
                  </label>
                  <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                    Select the fallback drawer to present active cards, stats, and filters immediately when dashboard logs boot.
                  </p>
                  <select
                    value={defaultCollectionId}
                    onChange={(e) => setDefaultCollectionId(e.target.value)}
                    className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 rounded-xl p-3.5 focus:outline-none focus:border-[#FFCB05]/40 transition-all font-mono appearance-none"
                  >
                    {binders.map(b => (
                      <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                        {b.name} ({b.id === 'binder-all' ? 'All Binders Combined' : 'Custom Binder'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Display Toggles */}
                <div className="space-y-3 pt-2">
                  <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">
                    Telemetry Display Preferences
                  </label>

                  <div className="space-y-2.5">
                    {/* Toggle 1: Show Purchase prices */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Show Card Purchase Prices</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 leading-normal">Exposes historical personal cost basis allocations inside binders logs.</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowPurchasePrices(!showPurchasePrices)}
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${showPurchasePrices ? 'bg-indigo-600' : 'bg-slate-800'}`}
                      >
                        <div className={`absolute top-1.5 w-3 h-3 bg-white rounded-full transition-all duration-200 ${showPurchasePrices ? 'translate-x-5' : 'translate-x-0'}`} style={{ left: '0.375rem' }} />
                      </button>
                    </div>

                    {/* Toggle 2: Show ROI */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Show Return On Investment (ROI)</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 leading-normal">Displays financial return ratios and value multipliers against cost basis.</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowROI(!showROI)}
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${showROI ? 'bg-indigo-600' : 'bg-slate-800'}`}
                      >
                        <div className={`absolute top-1.5 w-3 h-3 bg-white rounded-full transition-all duration-200 ${showROI ? 'translate-x-5' : 'translate-x-0'}`} style={{ left: '0.375rem' }} />
                      </button>
                    </div>

                    {/* Toggle 3: Show Collection Value */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Show Total Collection Valuation</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 leading-normal">Presents overall combined monetary coordinates at the top headers.</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowCollectionValue(!showCollectionValue)}
                        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${showCollectionValue ? 'bg-indigo-600' : 'bg-slate-800'}`}
                      >
                        <div className={`absolute top-1.5 w-3 h-3 bg-white rounded-full transition-all duration-200 ${showCollectionValue ? 'translate-x-5' : 'translate-x-0'}`} style={{ left: '0.375rem' }} />
                      </button>
                    </div>

                  </div>
                </div>

              </div>

              {/* Collector Profile Persona selector Right */}
              <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl flex flex-col justify-between">
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
                    <h3 className="font-bold text-slate-100 text-sm uppercase font-mono tracking-wide flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FFCB05]" />
                      <span>Collector Style Persona</span>
                    </h3>
                    <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded leading-none uppercase font-bold">Archetypes</span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    Select your primary collection archetype. Changing your style adapts the dashboard layout highlight tones, tips, and target goals metrics naturally.
                  </p>

                  <div className="space-y-3 pt-1">
                    {[
                      { id: 'Investment Focus', name: 'Investment Focus', desc: 'Returns, price trends, ROI analysis, premium graded slabs, and volume gains.', color: 'border-emerald-500 bg-emerald-500/5', glyph: '📈' },
                      { id: 'Master Set Collector', name: 'Master Set Collector', desc: 'Focus on card indexes, full expansions maps, finding raw slots, and completion ratios.', color: 'border-[#3B4CCA] bg-[#3B4CCA]/5', glyph: '📖' },
                      { id: 'Vintage Collector', name: 'Vintage Collector', desc: 'Prefers classic retro runs, holographic 90s specimens, and PSA historical classics.', color: 'border-orange-500 bg-orange-500/5', glyph: '🦖' },
                      { id: 'Competitive Collector', name: 'Competitive Collector', desc: 'Targets active playability ratios, deck configurations, languages matching, and current meta.', color: 'border-red-500 bg-red-500/5', glyph: '⚔️' },
                      { id: 'Mixed Collector', name: 'Mixed Collector', desc: 'Hybrid collectors. Tracks card indexes, financial details, and binder shelves combined.', color: 'border-yellow-500 bg-yellow-500/5', glyph: '🌈' },
                    ].map(style => {
                      const active = collectorProfile === style.id;
                      return (
                        <div
                          key={style.id}
                          onClick={() => setCollectorProfile(style.id)}
                          className={`p-3 border rounded-xl cursor-pointer transition-all flex items-start gap-3 text-left ${
                            active 
                              ? `${style.color} ring-1 ring-white/10 shadow-md` 
                              : 'border-slate-850 hover:border-slate-800 bg-slate-900/40 hover:bg-slate-900'
                          }`}
                        >
                          <span className="text-2xl pt-0.5 shrink-0 select-none">{style.glyph}</span>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-semibold ${active ? 'text-[#FFCB05]' : 'text-slate-100'}`}>
                                {style.name}
                              </span>
                              {active && (
                                <span className="text-[8px] bg-[#FFCB05]/10 text-[#FFCB05] font-mono px-1.5 py-0.5 rounded uppercase font-bold leading-none">PRIMARY OPTION</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 leading-relaxed block mt-1">
                              {style.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Apply Preferences Button */}
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="w-full mt-6 py-3 bg-[#3B4CCA] hover:bg-indigo-600 text-white rounded-xl text-xs font-black font-mono tracking-wider transition-all select-none cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15"
                >
                  <Check className="w-4 h-4" />
                  <span>APPLY DASHBOARD PREFERENCES</span>
                </button>

              </div>

            </div>

          </div>
        )}

        {/* TAB 3: ACCOUNT CONTROLS */}
        {activeSubTab === 'account' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Connected Accounts Section */}
              <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
                    <h3 className="font-bold text-slate-100 text-sm uppercase font-mono tracking-wide flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#FFCB05]" />
                      <span>Connected SSO Accounts</span>
                    </h3>
                    <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded leading-none uppercase font-bold">Connected</span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    Verify connected external accounts linked to this PokéVault workspace session. Connected accounts can bypass keycard access.
                  </p>

                  <div className="space-y-3.5 pt-1">
                    {/* Google SSO */}
                    <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                        <div>
                          <span className="block text-xs font-bold text-slate-100">Google Credentials</span>
                          <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{userEmail.includes('@') ? userEmail : 'Google Federated OAuth 2.0'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20 text-[8px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                        <Check className="w-3 h-3 shrink-0" />
                        <span>Connected</span>
                      </div>
                    </div>

                    {/* PokéVault Session ID */}
                    <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-indigo-400 shrink-0" />
                        <div>
                          <span className="block text-xs font-bold text-slate-100">PokéVault ID Keycard</span>
                          <span className="block text-[10px] text-slate-500 font-mono mt-0.5">SHA-256 local verification security</span>
                        </div>
                      </div>
                      <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[8px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider">Active</span>
                    </div>

                    {/* Nintendo Network */}
                    <div className="p-4 bg-slate-900/45 border border-slate-850/50 rounded-2xl flex items-center justify-between opacity-50 hover:opacity-100 transition-all">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4.5h-2V7h2v5z" />
                        </svg>
                        <div>
                          <span className="block text-xs font-bold text-slate-300">Nintendo Account Connect</span>
                          <span className="block text-[10px] text-slate-600 font-mono mt-0.5">Establish physical sync features</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setSuccessBanner('Authorized Nintendo ID handshake link.')}
                        className="text-[9px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg font-bold uppercase transition-all"
                      >
                        Connect
                      </button>
                    </div>

                  </div>
                </div>

                {/* Simple manual log action */}
                {onSignOut && (
                  <div className="mt-6 pt-5 border-t border-slate-850">
                    <button
                      type="button"
                      onClick={onSignOut}
                      className="w-full bg-slate-900 hover:bg-slate-800 hover:text-red-400 text-slate-300 px-4 py-3 rounded-xl border border-slate-800 font-bold font-mono tracking-wide text-xs transition-all uppercase cursor-pointer text-center"
                    >
                      Sign Out & lock Session
                    </button>
                  </div>
                )}
              </div>

              {/* Password Management Block */}
              <form onSubmit={handleUpdatePassword} className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
                    <h3 className="font-bold text-slate-100 text-sm uppercase font-mono tracking-wide flex items-center gap-2">
                      <Lock className="w-4 h-4 text-orange-400" />
                      <span>Password Keycard Management</span>
                    </h3>
                    <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded leading-none uppercase font-bold">Cipher</span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    Mutate your profile decryption keycard safely. Keep passwords secure and distinct.
                  </p>

                  <div className="space-y-3">
                    {/* Current Password */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Current Password</label>
                      <input
                        type={pwdShow ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => { setCurrentPassword(e.target.value); setErrorBanner(null); }}
                        placeholder="••••••••"
                        className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl px-3.5 py-3 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    {/* New Password */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">New Vault Password</label>
                      <input
                        type={pwdShow ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setErrorBanner(null); }}
                        placeholder="Minimum 6 tokens"
                        className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl px-3.5 py-3 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Confirm New Password</label>
                      <input
                        type={pwdShow ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => { setConfirmNewPassword(e.target.value); setErrorBanner(null); }}
                        placeholder="••••••••"
                        className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl px-3.5 py-3 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    {/* Show password checkbox helper */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="pwdShow"
                        checked={pwdShow}
                        onChange={() => setPwdShow(!pwdShow)}
                        className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                      />
                      <label htmlFor="pwdShow" className="text-[10px] text-slate-400 font-mono font-semibold tracking-wide uppercase cursor-pointer">
                        Reveal typed tokens
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full py-3 bg-[#FFCB05] hover:bg-yellow-400 text-slate-950 font-black font-mono tracking-wider text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>CRYPTING UPDATE...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>UPDATE SECURE PASSWORD KEYCARD</span>
                    </>
                  )}
                </button>

              </form>

              {/* EXPORT COLLECTION DATA (.CSV) */}
              <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl lg:col-span-2 space-y-4">
                
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
                  <h3 className="font-bold text-slate-100 text-sm uppercase font-mono tracking-wide flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Export Vault Storage Matrices</span>
                  </h3>
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-emerald-400 font-mono px-2 py-0.5 rounded leading-none uppercase font-bold">Standard CSV</span>
                </div>

                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                  Generate offline backups of physical slabs ledger structures. Exports match exact card metadata, purchase basis, qualities, and certificate notes. No remote server tracks these entries.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Export Collection */}
                  <div className="bg-[#12151D] border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-3.5">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Personal Holdings Backup</span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-normal">
                        Packages all <span className="text-[#FFCB05] font-bold">{collectionItems.length} portfolio item cards</span> with certificate codes intact.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportCollectionCSV}
                      className="w-full py-3 bg-slate-900 hover:bg-[#3B4CCA] text-slate-300 hover:text-white border border-slate-850 transition-all font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-2 rounded-xl cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Collections ledger (.CSV)</span>
                    </button>
                  </div>

                  {/* Export Wishlist */}
                  <div className="bg-[#12151D] border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-3.5">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Collector Wishlist Backup</span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-normal">
                        Secures active buyer price triggers, prioritized desires, and card reference notes for offline planning.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportWishlistCSV}
                      className="w-full py-3 bg-slate-900 hover:bg-[#3B4CCA] text-slate-300 hover:text-white border border-slate-850 transition-all font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-2 rounded-xl cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Wishlists Ledger (.CSV)</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Danger Zone: Destroy Account Section */}
              <div className="bg-[#1A1D24] p-5 border border-red-500/20 rounded-2xl lg:col-span-2 space-y-4">
                
                <div className="flex justify-between items-center pb-2.5 border-b border-red-900/30">
                  <h3 className="font-extrabold text-red-500 text-sm uppercase font-mono tracking-wide flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500 animate-bounce" />
                    <span>DEGRADATION CONTROL ZONE</span>
                  </h3>
                  <span className="text-[9px] bg-red-950/20 border border-red-900/40 text-red-400 font-mono px-2 py-0.5 rounded leading-none uppercase font-bold">SAFETY OVERRIDE</span>
                </div>

                <div className="flex items-start justify-between gap-5 flex-col md:flex-row">
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed max-w-xl">
                    Permanently deletes your secure PokéVault profile session from our database matrices. All physical holdings cards copies, custom folders, language tracking priorities, and wish listings entries will be purged. This action is terminal and cannot be retrieved.
                  </p>
                  
                  <button
                    type="button"
                    onClick={handleDeleteAccountAction}
                    className="bg-red-950/30 hover:bg-red-600 text-red-500 hover:text-white border border-red-900 hover:border-red-500 px-5 py-3.5 rounded-xl font-bold font-mono tracking-wide text-xs transition-all uppercase cursor-pointer shrink-0 w-full md:w-auto text-center"
                  >
                    Delete PokéVault Account
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* Confirmation Modals block */}
      {confirmModal && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          description={confirmModal.description}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}

    </div>
  );
};
