/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Key, Lock, Check, Loader2 } from 'lucide-react';
import { isMvpFeatureEnabled } from '../../config/mvpFeatures';
import type { CollectionItem } from '../../types';
import { SettingsAccountExportPanel } from './SettingsAccountExportPanel';
import { SettingsAccountDangerZone } from './SettingsAccountDangerZone';
interface SettingsAccountPanelProps {
  userEmail: string;
  onSignOut?: () => void;
  collectionItems: CollectionItem[];
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmNewPassword: string;
  setConfirmNewPassword: (value: string) => void;
  isUpdatingPassword: boolean;
  pwdShow: boolean;
  setPwdShow: (value: boolean) => void;
  onUpdatePassword: (event: React.FormEvent) => void;
  onExportCollectionCSV: () => void;
  onExportWishlistCSV: () => void;
  onExportFullDataJson: () => void;
  onDeleteAccount: () => void;
  onNintendoConnect: () => void;
  onClearPasswordError: () => void;
}

export function SettingsAccountPanel({
  userEmail,
  onSignOut,
  collectionItems,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  isUpdatingPassword,
  pwdShow,
  setPwdShow,
  onUpdatePassword,
  onExportCollectionCSV,
  onExportWishlistCSV,
  onExportFullDataJson,
  onDeleteAccount,
  onNintendoConnect,
  onClearPasswordError,
}: SettingsAccountPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
              <h3 className="font-bold text-slate-100 text-sm uppercase font-mono tracking-wide flex items-center gap-2">
                <Key className="w-4 h-4 text-[#FFCB05]" />
                <span>Connected SSO Accounts</span>
              </h3>
              <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded leading-none uppercase font-bold">
                Connected
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Verify connected external accounts linked to this PokéVault workspace session. Connected accounts can bypass keycard access.
            </p>

            <div className="space-y-3.5 pt-1">
              <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <div>
                    <span className="block text-xs font-bold text-slate-100">Google Credentials</span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                      {userEmail.includes('@') ? userEmail : 'Google Federated OAuth 2.0'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20 text-[8px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                  <Check className="w-3 h-3 shrink-0" />
                  <span>Connected</span>
                </div>
              </div>

              <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-slate-100">PokéVault ID Keycard</span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">SHA-256 local verification security</span>
                  </div>
                </div>
                <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[8px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                  Active
                </span>
              </div>

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
                  onClick={onNintendoConnect}
                  className="text-[9px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg font-bold uppercase transition-all"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>

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

        <form onSubmit={onUpdatePassword} className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
              <h3 className="font-bold text-slate-100 text-sm uppercase font-mono tracking-wide flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-400" />
                <span>Password Keycard Management</span>
              </h3>
              <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded leading-none uppercase font-bold">
                Cipher
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Mutate your profile decryption keycard safely. Keep passwords secure and distinct.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Current Password</label>
                <input
                  type={pwdShow ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event) => {
                    setCurrentPassword(event.target.value);
                    onClearPasswordError();
                  }}
                  placeholder="••••••••"
                  className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl px-3.5 py-3 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">New Vault Password</label>
                <input
                  type={pwdShow ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    onClearPasswordError();
                  }}
                  placeholder="Minimum 6 tokens"
                  className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl px-3.5 py-3 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Confirm New Password</label>
                <input
                  type={pwdShow ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(event) => {
                    setConfirmNewPassword(event.target.value);
                    onClearPasswordError();
                  }}
                  placeholder="••••••••"
                  className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl px-3.5 py-3 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

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

        {isMvpFeatureEnabled('settingsExport') && (
          <SettingsAccountExportPanel
            collectionItems={collectionItems}
            onExportCollectionCSV={onExportCollectionCSV}
            onExportWishlistCSV={onExportWishlistCSV}
            onExportFullDataJson={onExportFullDataJson}
          />
        )}

        <SettingsAccountDangerZone onDeleteAccount={onDeleteAccount} />
      </div>
    </div>
  );
}