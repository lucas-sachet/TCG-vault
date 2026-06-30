/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Camera,
  Check,
  Sparkles,
  Lock,
  Globe,
  Coins,
  Calendar,
  Loader2,
} from 'lucide-react';
import { COUNTRY_OPTIONS, PRESET_AVATARS } from './settingsConstants';

interface SettingsProfilePanelProps {
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
  dragOver: boolean;
  isSavingProfile: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectPresetAvatar: (avatarId: string) => void;
  onResetProfilePic: () => void;
}

export function SettingsProfilePanel({
  userEmail,
  selectedCurrency,
  onSelectCurrency,
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
  onSubmit,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onSelectPresetAvatar,
  onResetProfilePic,
}: SettingsProfilePanelProps) {
  const activePreset = PRESET_AVATARS.find((avatar) => avatar.id === profilePic);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          <div className="flex flex-col items-center justify-center py-4 space-y-3 bg-[#111319] border border-slate-850 rounded-2xl">
            {profilePic.startsWith('data:') ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md">
                <img src={profilePic} alt="Uploaded Specimen Badge" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={onResetProfilePic}
                  className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] font-mono py-1 font-bold text-red-400 hover:text-red-300"
                >
                  Reset Preset
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl shadow-inner relative">
                {activePreset?.label || '👴'}
                <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1 border border-slate-900">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">
              {profilePic.startsWith('data:') ? 'Custom Asset Mapped' : activePreset?.name || 'Default Oakley'}
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[9px] text-slate-500 font-mono block uppercase font-bold text-center">Fast Avatar Presets</span>
            <div className="grid grid-cols-4 gap-1.5">
              {PRESET_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => onSelectPresetAvatar(avatar.id)}
                  className={`py-3 bg-[#111319] border rounded-xl text-xl hover:bg-[#1E2129] transition-all flex items-center justify-center cursor-pointer ${
                    profilePic === avatar.id ? 'border-[#FFCB05] bg-[#3B4CCA]/5 text-white' : 'border-slate-850 text-slate-400'
                  }`}
                  title={avatar.name}
                >
                  {avatar.label}
                </button>
              ))}
            </div>
          </div>

          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              dragOver ? 'border-[#FFCB05] bg-[#FFCB05]/5' : 'border-slate-800 bg-[#12151D] hover:bg-slate-900'
            }`}
          >
            <input type="file" id="profile-upload" accept="image/*" onChange={onFileChange} className="hidden" />
            <label htmlFor="profile-upload" className="cursor-pointer block space-y-1.5">
              <Camera className="w-5 h-5 mx-auto text-indigo-400" />
              <span className="block text-[10px] font-bold text-slate-300 font-mono uppercase tracking-wider">
                Drag & drop specimen here
              </span>
              <span className="block text-[9px] text-slate-500 font-semibold leading-normal">
                Or click to select image copy (Max 2MB)
              </span>
            </label>
          </div>
        </div>

        <div className="bg-[#1A1D24] p-5 border border-slate-800 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80">
            <h3 className="font-bold text-slate-100 text-sm uppercase font-mono tracking-wide flex items-center gap-2">
              <User className="w-4 h-4 text-[#FFCB05]" />
              <span>Collector Coordinates</span>
            </h3>
            <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded leading-none uppercase font-bold">
              Metadata ID
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Display Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20 font-mono"
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
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="Oaky"
                  className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20 font-mono"
                />
              </div>
            </div>

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

            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Country Coordinates</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20 font-mono appearance-none"
                >
                  {COUNTRY_OPTIONS.map((countryOption) => (
                    <option key={countryOption} value={countryOption} className="bg-slate-900 text-slate-200">
                      {countryOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Exchange Index Currency</label>
              <div className="relative">
                <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={selectedCurrency}
                  onChange={(event) => onSelectCurrency(event.target.value)}
                  className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20 font-mono appearance-none"
                >
                  <option value="USD">USD (US Dollars - $)</option>
                  <option value="EUR">EUR (European Euros - €)</option>
                  <option value="BRL">BRL (Brazilian Real - R$)</option>
                  <option value="JPY">JPY (Japanese Yen - ¥)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Collector Commencement Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={collectorSince}
                  onChange={(event) => setCollectorSince(event.target.value)}
                  className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Optional About Me / Bio</label>
            <textarea
              rows={3}
              placeholder="Provide a short synopsis describing your target card sets, vintage grading pursuits, or dynamic market desires here..."
              value={aboutMe}
              onChange={(event) => setAboutMe(event.target.value.slice(0, 150))}
              className="w-full bg-[#111319] border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl p-3.5 focus:outline-none focus:border-indigo-500 transition-all focus:ring-1 focus:ring-indigo-500/20 font-sans leading-relaxed"
            />
            <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
              <span>Limit details to 150 characters.</span>
              <span className="font-bold">{aboutMe.length} / 150 TOKENS</span>
            </div>
          </div>

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
  );
}
