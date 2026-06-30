/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import type { Card, CollectionItem, WishlistItem } from '../../types';
import type { SettingsConfirmModalState, SettingsSubTabId } from './types';
import { createSettingsExportHandlers } from './settingsExportHandlers';
import { createSettingsProfileHandlers } from './settingsProfileHandlers';
import { createSettingsPreferencesHandlers } from './settingsPreferencesHandlers';

interface UseSettingsTabOptions {
  userEmail: string;
  collectionItems: CollectionItem[];
  wishlistItems: WishlistItem[];
  cards: Card[];
  onDeleteAccount?: () => void;
}

export function useSettingsTab({
  userEmail,
  collectionItems,
  wishlistItems,
  cards,
  onDeleteAccount,
}: UseSettingsTabOptions) {
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTabId>('profile');
  const [confirmModal, setConfirmModal] = useState<SettingsConfirmModalState | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

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
  const [profilePic, setProfilePic] = useState<string>(() => {
    return localStorage.getItem(`pokevault_profilePic_${userEmail}`) || 'avatar-oak';
  });
  const [dragOver, setDragOver] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
    return value !== 'false';
  });
  const [showROI, setShowROI] = useState<boolean>(() => {
    const value = localStorage.getItem(`pokevault_showROI_${userEmail}`);
    return value !== 'false';
  });
  const [showCollectionValue, setShowCollectionValue] = useState<boolean>(() => {
    const value = localStorage.getItem(`pokevault_showCollectionValue_${userEmail}`);
    return value !== 'false';
  });
  const [collectorProfile, setCollectorProfile] = useState<string>(() => {
    return localStorage.getItem(`pokevault_collectorProfile_${userEmail}`) || 'Mixed Collector';
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [pwdShow, setPwdShow] = useState(false);

  useEffect(() => {
    localStorage.setItem(`pokevault_languages_${userEmail}`, JSON.stringify(selectedLanguages));
  }, [selectedLanguages, userEmail]);

  function clearBanners() {
    setErrorBanner(null);
    setSuccessBanner(null);
  }

  function switchSubTab(subTab: SettingsSubTabId) {
    setActiveSubTab(subTab);
    clearBanners();
  }

  const {
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    selectPresetAvatar,
    resetProfilePicToPreset,
    handleSaveProfile,
  } = createSettingsProfileHandlers({
    userEmail,
    displayName,
    nickname,
    country,
    aboutMe,
    collectorSince,
    profilePic,
    setProfilePic,
    setDragOver,
    setIsSavingProfile,
    setSuccessBanner,
    setErrorBanner,
  });

  const { handleSavePreferences, handleUpdatePassword, handleToggleLanguage } =
    createSettingsPreferencesHandlers({
      userEmail,
      selectedLanguages,
      defaultCollectionId,
      showPurchasePrices,
      showROI,
      showCollectionValue,
      collectorProfile,
      currentPassword,
      newPassword,
      confirmNewPassword,
      setSelectedLanguages,
      setIsUpdatingPassword,
      setSuccessBanner,
      setErrorBanner,
      setCurrentPassword,
      setNewPassword,
      setConfirmNewPassword,
    });

  const {
    handleExportCollectionCSV,
    handleExportFullDataJson,
    handleExportWishlistCSV,
    handleDeleteAccountAction,
  } = createSettingsExportHandlers({
    userEmail,
    collectionItems,
    wishlistItems,
    cards,
    setSuccessBanner,
    setErrorBanner,
    setConfirmModal,
    onDeleteAccount,
  });

  return {
    activeSubTab,
    switchSubTab,
    confirmModal,
    setConfirmModal,
    successBanner,
    setSuccessBanner,
    errorBanner,
    setErrorBanner,
    displayName,
    setDisplayName,
    nickname,
    setNickname,
    country,
    setCountry,
    aboutMe,
    setAboutMe,
    collectorSince,
    setCollectorSince,
    profilePic,
    dragOver,
    isSavingProfile,
    selectedLanguages,
    defaultCollectionId,
    setDefaultCollectionId,
    showPurchasePrices,
    setShowPurchasePrices,
    showROI,
    setShowROI,
    showCollectionValue,
    setShowCollectionValue,
    collectorProfile,
    setCollectorProfile,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    isUpdatingPassword,
    pwdShow,
    setPwdShow,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    selectPresetAvatar,
    resetProfilePicToPreset,
    handleSaveProfile,
    handleSavePreferences,
    handleUpdatePassword,
    handleToggleLanguage,
    handleExportCollectionCSV,
    handleExportFullDataJson,
    handleExportWishlistCSV,
    handleDeleteAccountAction,
  };
}
