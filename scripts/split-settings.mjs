/** Split SettingsTab into src/features/settings/ */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const license = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

`;
const created = [];
const sDir = 'src/features/settings';
const lines = fs.readFileSync(path.join(root, 'src/components/_SettingsTab.backup.tsx'), 'utf8').split('\n');

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  const count = content.split('\n').length;
  created.push({ path: rel, lines: count });
  if (count > 300) console.warn(`WARN ${count}L ${rel}`);
}

function slice(a, b) { return lines.slice(a - 1, b).join('\n'); }

write(`${sDir}/types.ts`, `${license}import type { Binder, PriceNotification, CollectionItem, WishlistItem, Card } from '../../types';

export interface SettingsTabProps {
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
  collectionItems?: CollectionItem[];
  wishlistItems?: WishlistItem[];
  cards?: Card[];
  onDeleteAccount?: () => void;
}

export type SubTabId = 'profile' | 'preferences' | 'account';

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}
`);

write(`${sDir}/settingsConstants.ts`, `${license}export const PRESET_AVATARS = [
  { id: 'avatar-oak', name: 'Professor Oak', label: '👴' },
  { id: 'avatar-ash', name: 'Trainer Red', label: '🧢' },
  { id: 'avatar-misty', name: 'Leader Misty', label: '💧' },
  { id: 'avatar-pikachu', name: 'Pikachu Fan', label: '⚡' },
];
`);

// Hook part 1: state (86-177) + effect (175-177) + preset (179-185 moved to constants)
write(`${sDir}/useSettingsState.ts`, `${license}'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import type { SettingsTabProps, ConfirmModalState, SubTabId } from './types';
import { PRESET_AVATARS } from './settingsConstants';

export function useSettingsState(props: SettingsTabProps) {
  const {
    userEmail,
    onSelectCurrency,
    selectedCurrency,
    collectionItems = [],
    wishlistItems = [],
    cards = [],
    onDeleteAccount,
    binders,
  } = props;

${slice(86, 177)}

  useEffect(() => {
    localStorage.setItem(\`pokevault_languages_\${userEmail}\`, JSON.stringify(selectedLanguages));
  }, [selectedLanguages, userEmail]);

  const presetAvatars = PRESET_AVATARS;

${slice(190, 500)}

  return {
    activeSubTab, setActiveSubTab,
    confirmModal, setConfirmModal,
    successBanner, setSuccessBanner,
    errorBanner, setErrorBanner,
    displayName, setDisplayName,
    nickname, setNickname,
    country, setCountry,
    aboutMe, setAboutMe,
    collectorSince, setCollectorSince,
    profilePic, setProfilePic,
    dragOver, setDragOver,
    isSavingProfile,
    selectedLanguages, setSelectedLanguages,
    defaultCollectionId, setDefaultCollectionId,
    showPurchasePrices, setShowPurchasePrices,
    showROI, setShowROI,
    showCollectionValue, setShowCollectionValue,
    collectorProfile, setCollectorProfile,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmNewPassword, setConfirmNewPassword,
    isUpdatingPassword,
    pwdShow, setPwdShow,
    presetAvatars,
    handleDragOver, handleDragLeave, handleDrop, handleFileChange,
    handleSaveProfile, handleSavePreferences, handleUpdatePassword,
    handleToggleLanguage,
    handleExportCollectionCSV, handleExportFullDataJson, handleExportWishlistCSV,
    handleDeleteAccountAction,
    userEmail, selectedCurrency, onSelectCurrency, collectionItems, binders, onSignOut: props.onSignOut,
  };
}
`);

write(`${sDir}/SettingsHeader.tsx`, `${license}'use client';

import { CheckCircle2, Lock, ShieldAlert, Sliders, User, X } from 'lucide-react';
import type { SubTabId } from './types';

export interface SettingsHeaderProps {
  successBanner: string | null;
  errorBanner: string | null;
  onDismissSuccess: () => void;
  onDismissError: () => void;
  activeSubTab: SubTabId;
  onSubTabChange: (tab: SubTabId) => void;
  onClearBanners: () => void;
}

export function SettingsHeader({
  successBanner, errorBanner, onDismissSuccess, onDismissError,
  activeSubTab, onSubTabChange, onClearBanners,
}: SettingsHeaderProps) {
  return (
    <>
${slice(506, 518)}
${slice(521, 543).replace(/setSuccessBanner\(null\)/g, 'onDismissSuccess()').replace(/setErrorBanner\(null\)/g, 'onDismissError()')}
${slice(546, 582).replace(/setActiveSubTab\('profile'\); setErrorBanner\(null\); setSuccessBanner\(null\);/g, "onSubTabChange('profile'); onClearBanners();").replace(/setActiveSubTab\('preferences'\); setErrorBanner\(null\); setSuccessBanner\(null\);/g, "onSubTabChange('preferences'); onClearBanners();").replace(/setActiveSubTab\('account'\); setErrorBanner\(null\); setSuccessBanner\(null\);/g, "onSubTabChange('account'); onClearBanners();")}
    </>
  );
}
`);

write(`${sDir}/SettingsProfilePanel.tsx`, `${license}'use client';

import {
  Calendar, Camera, Check, Coins, Globe, Loader2, Lock, Sparkles, User,
} from 'lucide-react';

export interface SettingsProfilePanelProps {
  userEmail: string;
  selectedCurrency: string;
  onSelectCurrency: (currency: string) => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  nickname: string;
  setNickname: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  aboutMe: string;
  setAboutMe: (value: string) => void;
  collectorSince: string;
  setCollectorSince: (value: string) => void;
  profilePic: string;
  setProfilePic: (value: string) => void;
  dragOver: boolean;
  isSavingProfile: boolean;
  presetAvatars: Array<{ id: string; name: string; label: string }>;
  handleDragOver: (event: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (event: React.DragEvent) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProfile: (event: React.FormEvent) => void;
}

export function SettingsProfilePanel(props: SettingsProfilePanelProps) {
  const {
    userEmail, selectedCurrency, onSelectCurrency,
    displayName, setDisplayName, nickname, setNickname,
    country, setCountry, aboutMe, setAboutMe,
    collectorSince, setCollectorSince, profilePic, setProfilePic,
    dragOver, isSavingProfile, presetAvatars,
    handleDragOver, handleDragLeave, handleDrop, handleFileChange, handleSaveProfile,
  } = props;

  return (
${slice(589, 826)}
  );
}
`);

write(`${sDir}/SettingsPreferencesPanel.tsx`, `${license}'use client';

import { Check, FolderHeart, Languages, Sliders, Sparkles } from 'lucide-react';
import type { Binder } from '../../types';

export interface SettingsPreferencesPanelProps {
  binders: Binder[];
  selectedLanguages: string[];
  defaultCollectionId: string;
  setDefaultCollectionId: (value: string) => void;
  showPurchasePrices: boolean;
  setShowPurchasePrices: (value: boolean) => void;
  showROI: boolean;
  setShowROI: (value: boolean) => void;
  showCollectionValue: boolean;
  setShowCollectionValue: (value: boolean) => void;
  collectorProfile: string;
  setCollectorProfile: (value: string) => void;
  handleToggleLanguage: (lang: string) => void;
  handleSavePreferences: () => void;
}

export function SettingsPreferencesPanel(props: SettingsPreferencesPanelProps) {
  const {
    binders, selectedLanguages, defaultCollectionId, setDefaultCollectionId,
    showPurchasePrices, setShowPurchasePrices, showROI, setShowROI,
    showCollectionValue, setShowCollectionValue, collectorProfile, setCollectorProfile,
    handleToggleLanguage, handleSavePreferences,
  } = props;

  return (
${slice(831, 1028)}
  );
}
`);

write(`${sDir}/SettingsAccountPanel.tsx`, `${license}'use client';

import { Check, Download, Key, Loader2, Lock, Trash2 } from 'lucide-react';

export interface SettingsAccountPanelProps {
  userEmail: string;
  onSignOut?: () => void;
  collectionItems: { length: number };
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmNewPassword: string;
  setConfirmNewPassword: (value: string) => void;
  isUpdatingPassword: boolean;
  pwdShow: boolean;
  setPwdShow: (value: boolean) => void;
  setSuccessBanner: (value: string) => void;
  setErrorBanner: (value: string | null) => void;
  handleUpdatePassword: (event: React.FormEvent) => void;
  handleExportCollectionCSV: () => void;
  handleExportWishlistCSV: () => void;
  handleExportFullDataJson: () => void;
  handleDeleteAccountAction: () => void;
}

export function SettingsAccountPanel(props: SettingsAccountPanelProps) {
  const {
    userEmail, onSignOut, collectionItems,
    currentPassword, setCurrentPassword, newPassword, setNewPassword,
    confirmNewPassword, setConfirmNewPassword, isUpdatingPassword,
    pwdShow, setPwdShow, setSuccessBanner, setErrorBanner,
    handleUpdatePassword, handleExportCollectionCSV, handleExportWishlistCSV,
    handleExportFullDataJson, handleDeleteAccountAction,
  } = props;

  return (
${slice(1033, 1313)}
  );
}
`);

write(`${sDir}/SettingsTabContent.tsx`, `${license}'use client';

import { ConfirmationModal } from '../../components/ConfirmationModal';
import type { SettingsTabProps } from './types';
import { useSettingsState } from './useSettingsState';
import { SettingsHeader } from './SettingsHeader';
import { SettingsProfilePanel } from './SettingsProfilePanel';
import { SettingsPreferencesPanel } from './SettingsPreferencesPanel';
import { SettingsAccountPanel } from './SettingsAccountPanel';

export function SettingsTabContent(props: SettingsTabProps) {
  const state = useSettingsState(props);

  return (
    <div className="space-y-6 pb-24 md:pb-6 select-none animate-fadeIn">
      <SettingsHeader
        successBanner={state.successBanner}
        errorBanner={state.errorBanner}
        onDismissSuccess={() => state.setSuccessBanner(null)}
        onDismissError={() => state.setErrorBanner(null)}
        activeSubTab={state.activeSubTab}
        onSubTabChange={state.setActiveSubTab}
        onClearBanners={() => { state.setErrorBanner(null); state.setSuccessBanner(null); }}
      />
      <div className="space-y-6">
        {state.activeSubTab === 'profile' && (
          <SettingsProfilePanel
            userEmail={state.userEmail}
            selectedCurrency={state.selectedCurrency}
            onSelectCurrency={state.onSelectCurrency}
            displayName={state.displayName}
            setDisplayName={state.setDisplayName}
            nickname={state.nickname}
            setNickname={state.setNickname}
            country={state.country}
            setCountry={state.setCountry}
            aboutMe={state.aboutMe}
            setAboutMe={state.setAboutMe}
            collectorSince={state.collectorSince}
            setCollectorSince={state.setCollectorSince}
            profilePic={state.profilePic}
            setProfilePic={state.setProfilePic}
            dragOver={state.dragOver}
            isSavingProfile={state.isSavingProfile}
            presetAvatars={state.presetAvatars}
            handleDragOver={state.handleDragOver}
            handleDragLeave={state.handleDragLeave}
            handleDrop={state.handleDrop}
            handleFileChange={state.handleFileChange}
            handleSaveProfile={state.handleSaveProfile}
          />
        )}
        {state.activeSubTab === 'preferences' && (
          <SettingsPreferencesPanel
            binders={state.binders}
            selectedLanguages={state.selectedLanguages}
            defaultCollectionId={state.defaultCollectionId}
            setDefaultCollectionId={state.setDefaultCollectionId}
            showPurchasePrices={state.showPurchasePrices}
            setShowPurchasePrices={state.setShowPurchasePrices}
            showROI={state.showROI}
            setShowROI={state.setShowROI}
            showCollectionValue={state.showCollectionValue}
            setShowCollectionValue={state.setShowCollectionValue}
            collectorProfile={state.collectorProfile}
            setCollectorProfile={state.setCollectorProfile}
            handleToggleLanguage={state.handleToggleLanguage}
            handleSavePreferences={state.handleSavePreferences}
          />
        )}
        {state.activeSubTab === 'account' && (
          <SettingsAccountPanel
            userEmail={state.userEmail}
            onSignOut={state.onSignOut}
            collectionItems={state.collectionItems}
            currentPassword={state.currentPassword}
            setCurrentPassword={state.setCurrentPassword}
            newPassword={state.newPassword}
            setNewPassword={state.setNewPassword}
            confirmNewPassword={state.confirmNewPassword}
            setConfirmNewPassword={state.setConfirmNewPassword}
            isUpdatingPassword={state.isUpdatingPassword}
            pwdShow={state.pwdShow}
            setPwdShow={state.setPwdShow}
            setSuccessBanner={state.setSuccessBanner}
            setErrorBanner={state.setErrorBanner}
            handleUpdatePassword={state.handleUpdatePassword}
            handleExportCollectionCSV={state.handleExportCollectionCSV}
            handleExportWishlistCSV={state.handleExportWishlistCSV}
            handleExportFullDataJson={state.handleExportFullDataJson}
            handleDeleteAccountAction={state.handleDeleteAccountAction}
          />
        )}
      </div>
      {state.confirmModal && (
        <ConfirmationModal
          isOpen={state.confirmModal.isOpen}
          title={state.confirmModal.title}
          description={state.confirmModal.description}
          confirmText={state.confirmModal.confirmText}
          cancelText={state.confirmModal.cancelText}
          type={state.confirmModal.type}
          onConfirm={state.confirmModal.onConfirm}
          onClose={() => state.setConfirmModal(null)}
        />
      )}
    </div>
  );
}
`);

write(`${sDir}/index.ts`, `${license}export type { SettingsTabProps } from './types';
export { SettingsTabContent } from './SettingsTabContent';
export { SettingsHeader } from './SettingsHeader';
export { SettingsProfilePanel } from './SettingsProfilePanel';
export { SettingsPreferencesPanel } from './SettingsPreferencesPanel';
export { SettingsAccountPanel } from './SettingsAccountPanel';
export { useSettingsState } from './useSettingsState';
`);

write('src/components/SettingsTab.tsx', `${license}'use client';

export { SettingsTabContent as SettingsTab } from '../features/settings';
export type { SettingsTabProps } from '../features/settings';
`);

console.log('Settings files:');
created.forEach(f => console.log(`${f.lines}\t${f.path}`));
