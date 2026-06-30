/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from 'react';

export type AppTabId = 'collection' | 'settings';

export interface AppHeaderProps {
  activeTab: AppTabId;
  onChangeTab: (tab: AppTabId) => void;
  onOpenAddModal: () => void;
  profileName: string;
  userEmail: string;
  profilePic: string;
  onSignOut: () => void;
  renderAvatar: (sizeClass?: string) => ReactNode;
}
