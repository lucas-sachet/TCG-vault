/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../../services/supabaseClient';

interface ProfileHandlerDeps {
  userEmail: string;
  displayName: string;
  nickname: string;
  country: string;
  aboutMe: string;
  collectorSince: string;
  profilePic: string;
  setProfilePic: (value: string) => void;
  setDragOver: (value: boolean) => void;
  setIsSavingProfile: (value: boolean) => void;
  setSuccessBanner: (message: string | null) => void;
  setErrorBanner: (message: string | null) => void;
}

export function createSettingsProfileHandlers(deps: ProfileHandlerDeps) {
  const {
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
  } = deps;

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleImageFile(file: File) {
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
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user?.id) {
            supabase.from('profiles').update({ profile_pic: base64 }).eq('id', session.user.id).then();
          }
        });
        setSuccessBanner('Physical specimen artwork mapped successfully!');
      }
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(false);
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      handleImageFile(files[0]);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files && files[0]) {
      handleImageFile(files[0]);
    }
  }

  function selectPresetAvatar(avatarId: string) {
    setProfilePic(avatarId);
    localStorage.setItem(`pokevault_profilePic_${userEmail}`, avatarId);
  }

  function resetProfilePicToPreset() {
    selectPresetAvatar('avatar-oak');
  }

  function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (!displayName.trim()) {
      setErrorBanner('Display Name is required to save metadata profile.');
      return;
    }

    setIsSavingProfile(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        supabase
          .from('profiles')
          .update({
            display_name: displayName.trim(),
            nickname: nickname.trim(),
            country,
            about_me: aboutMe.trim(),
            collector_since: collectorSince,
            profile_pic: profilePic,
          })
          .eq('id', session.user.id)
          .then(({ error }) => {
            if (error) {
              setIsSavingProfile(false);
              setErrorBanner(error.message || 'Failed to update profile in Supabase.');
            } else {
              localStorage.setItem(`pokevault_displayName_${userEmail}`, displayName.trim());
              localStorage.setItem(`pokevault_nickname_${userEmail}`, nickname.trim());
              localStorage.setItem(`pokevault_country_${userEmail}`, country);
              localStorage.setItem(`pokevault_aboutMe_${userEmail}`, aboutMe.trim());
              localStorage.setItem(`pokevault_collectorSince_${userEmail}`, collectorSince);
              localStorage.setItem(`pokevault_profilePic_${userEmail}`, profilePic);
              setIsSavingProfile(false);
              setSuccessBanner('Profile parameters updated securely inside Supabase.');
            }
          });
      } else {
        setIsSavingProfile(false);
        setErrorBanner('No active session found.');
      }
    });
  }

  return {
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    selectPresetAvatar,
    resetProfilePicToPreset,
    handleSaveProfile,
  };
}
