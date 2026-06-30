import { ISettingsService } from '@/src/services/interfaces';
import { supabase } from '@/src/services/supabaseClient';
import type { ProfileRow } from '@/lib/supabase/database.types';

export class SupabaseSettingsService implements ISettingsService {
  private preferSpecimenPhoto = false;
  private onboarded = false;
  private languages: string[] = [];

  getPreferSpecimenPhoto(): boolean {
    return this.preferSpecimenPhoto;
  }

  setPreferSpecimenPhoto(value: boolean): void {
    this.preferSpecimenPhoto = value;
    localStorage.setItem('preferSpecimenPhoto', String(value));
    void this.saveSettings();
  }

  getOnboarded(): boolean {
    return this.onboarded;
  }

  setOnboarded(value: boolean): void {
    this.onboarded = value;
    void this.saveSettings();
  }

  getLanguages(): string[] {
    return this.languages;
  }

  setLanguages(value: string[]): void {
    this.languages = value;
    void this.saveSettings();
  }

  setProfile(profile: Pick<ProfileRow, 'prefer_specimen_photo' | 'onboarded' | 'languages'>): void {
    this.preferSpecimenPhoto = profile.prefer_specimen_photo ?? false;
    this.onboarded = profile.onboarded ?? false;
    this.languages = profile.languages || [];
    localStorage.setItem('preferSpecimenPhoto', String(profile.prefer_specimen_photo));
  }

  async saveSettings(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return;
    }

    try {
      await supabase.from('profiles').update({
        prefer_specimen_photo: this.preferSpecimenPhoto,
        onboarded: this.onboarded,
        languages: this.languages,
      }).eq('id', session.user.id);
    } catch (error) {
      console.error('Error updating settings in Supabase:', error);
    }
  }

  resetSettings(): void {
    this.preferSpecimenPhoto = false;
    this.onboarded = false;
    this.languages = [];
    localStorage.removeItem('preferSpecimenPhoto');
  }
}

export const supabaseSettingsService = new SupabaseSettingsService();
