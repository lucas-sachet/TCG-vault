/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { ConfirmationModal } from '../../components/ConfirmationModal';
import type { SettingsTabProps } from './types';
import { useSettingsTab } from './useSettingsTab';
import { SettingsHeader } from './SettingsHeader';
import { SettingsBanners } from './SettingsBanners';
import { SettingsSubTabs } from './SettingsSubTabs';
import { SettingsProfilePanel } from './SettingsProfilePanel';
import { SettingsPreferencesPanel } from './SettingsPreferencesPanel';
import { SettingsAccountPanel } from './SettingsAccountPanel';

export function SettingsTabContent({
  binders,
  selectedCurrency,
  onSelectCurrency,
  userEmail,
  onSignOut,
  collectionItems = [],
  wishlistItems = [],
  cards = [],
  onDeleteAccount,
}: SettingsTabProps) {
  const settings = useSettingsTab({
    userEmail,
    collectionItems,
    wishlistItems,
    cards,
    onDeleteAccount,
  });

  return (
    <div className="space-y-6 pb-24 md:pb-6 select-none animate-fadeIn">
      <SettingsHeader />

      <SettingsBanners
        successBanner={settings.successBanner}
        errorBanner={settings.errorBanner}
        onDismissSuccess={() => settings.setSuccessBanner(null)}
        onDismissError={() => settings.setErrorBanner(null)}
      />

      <SettingsSubTabs activeSubTab={settings.activeSubTab} onSelectSubTab={settings.switchSubTab} />

      <div className="space-y-6">
        {settings.activeSubTab === 'profile' && (
          <SettingsProfilePanel
            userEmail={userEmail}
            selectedCurrency={selectedCurrency}
            onSelectCurrency={onSelectCurrency}
            displayName={settings.displayName}
            setDisplayName={settings.setDisplayName}
            nickname={settings.nickname}
            setNickname={settings.setNickname}
            country={settings.country}
            setCountry={settings.setCountry}
            aboutMe={settings.aboutMe}
            setAboutMe={settings.setAboutMe}
            collectorSince={settings.collectorSince}
            setCollectorSince={settings.setCollectorSince}
            profilePic={settings.profilePic}
            dragOver={settings.dragOver}
            isSavingProfile={settings.isSavingProfile}
            onSubmit={settings.handleSaveProfile}
            onDragOver={settings.handleDragOver}
            onDragLeave={settings.handleDragLeave}
            onDrop={settings.handleDrop}
            onFileChange={settings.handleFileChange}
            onSelectPresetAvatar={settings.selectPresetAvatar}
            onResetProfilePic={settings.resetProfilePicToPreset}
          />
        )}

        {settings.activeSubTab === 'preferences' && (
          <SettingsPreferencesPanel
            binders={binders}
            selectedLanguages={settings.selectedLanguages}
            defaultCollectionId={settings.defaultCollectionId}
            setDefaultCollectionId={settings.setDefaultCollectionId}
            showPurchasePrices={settings.showPurchasePrices}
            setShowPurchasePrices={settings.setShowPurchasePrices}
            showROI={settings.showROI}
            setShowROI={settings.setShowROI}
            showCollectionValue={settings.showCollectionValue}
            setShowCollectionValue={settings.setShowCollectionValue}
            collectorProfile={settings.collectorProfile}
            setCollectorProfile={settings.setCollectorProfile}
            onToggleLanguage={settings.handleToggleLanguage}
            onSavePreferences={settings.handleSavePreferences}
          />
        )}

        {settings.activeSubTab === 'account' && (
          <SettingsAccountPanel
            userEmail={userEmail}
            onSignOut={onSignOut}
            collectionItems={collectionItems}
            currentPassword={settings.currentPassword}
            setCurrentPassword={settings.setCurrentPassword}
            newPassword={settings.newPassword}
            setNewPassword={settings.setNewPassword}
            confirmNewPassword={settings.confirmNewPassword}
            setConfirmNewPassword={settings.setConfirmNewPassword}
            isUpdatingPassword={settings.isUpdatingPassword}
            pwdShow={settings.pwdShow}
            setPwdShow={settings.setPwdShow}
            onUpdatePassword={settings.handleUpdatePassword}
            onExportCollectionCSV={settings.handleExportCollectionCSV}
            onExportWishlistCSV={settings.handleExportWishlistCSV}
            onExportFullDataJson={settings.handleExportFullDataJson}
            onDeleteAccount={settings.handleDeleteAccountAction}
            onNintendoConnect={() => settings.setSuccessBanner('Authorized Nintendo ID handshake link.')}
            onClearPasswordError={() => settings.setErrorBanner(null)}
          />
        )}
      </div>

      {settings.confirmModal && (
        <ConfirmationModal
          isOpen={settings.confirmModal.isOpen}
          title={settings.confirmModal.title}
          description={settings.confirmModal.description}
          confirmText={settings.confirmModal.confirmText}
          cancelText={settings.confirmModal.cancelText}
          type={settings.confirmModal.type}
          onConfirm={settings.confirmModal.onConfirm}
          onClose={() => settings.setConfirmModal(null)}
        />
      )}
    </div>
  );
}
