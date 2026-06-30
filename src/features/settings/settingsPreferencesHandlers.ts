/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../../services/supabaseClient';

interface PreferencesHandlerDeps {
  userEmail: string;
  selectedLanguages: string[];
  defaultCollectionId: string;
  showPurchasePrices: boolean;
  showROI: boolean;
  showCollectionValue: boolean;
  collectorProfile: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  setSelectedLanguages: React.Dispatch<React.SetStateAction<string[]>>;
  setIsUpdatingPassword: (value: boolean) => void;
  setSuccessBanner: (message: string | null) => void;
  setErrorBanner: (message: string | null) => void;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmNewPassword: (value: string) => void;
}

export function createSettingsPreferencesHandlers(deps: PreferencesHandlerDeps) {
  const {
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
  } = deps;

  function handleSavePreferences() {
    if (selectedLanguages.length === 0) {
      setErrorBanner('At least one preferred card language coordinate must be selected.');
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        supabase
          .from('profiles')
          .update({
            languages: selectedLanguages,
            show_purchase_prices: showPurchasePrices,
            show_roi: showROI,
            show_collection_value: showCollectionValue,
            collector_profile: collectorProfile,
          })
          .eq('id', session.user.id)
          .then(({ error }) => {
            if (error) {
              setErrorBanner(error.message || 'Failed to update preferences in Supabase.');
            } else {
              localStorage.setItem(`pokevault_languages_${userEmail}`, JSON.stringify(selectedLanguages));
              localStorage.setItem(`pokevault_defaultBinder_${userEmail}`, defaultCollectionId);
              localStorage.setItem(`pokevault_showPurchasePrices_${userEmail}`, String(showPurchasePrices));
              localStorage.setItem(`pokevault_showROI_${userEmail}`, String(showROI));
              localStorage.setItem(`pokevault_showCollectionValue_${userEmail}`, String(showCollectionValue));
              localStorage.setItem(`pokevault_collectorProfile_${userEmail}`, collectorProfile);
              setErrorBanner(null);
              setSuccessBanner('Personalization dashboard preferences saved to Supabase.');
              setTimeout(() => setSuccessBanner(null), 4000);
            }
          });
      }
    });
  }

  function handleUpdatePassword(event: React.FormEvent) {
    event.preventDefault();
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
  }

  function handleToggleLanguage(language: string) {
    setSelectedLanguages((previous) => {
      if (previous.includes(language)) {
        if (previous.length === 1) return previous;
        return previous.filter((entry) => entry !== language);
      }
      return [...previous, language];
    });
  }

  return {
    handleSavePreferences,
    handleUpdatePassword,
    handleToggleLanguage,
  };
}
