import { supabase } from '@/src/services/supabaseClient';
import {
  buildDefaultBinderId,
  DEFAULT_BINDER_DESCRIPTION,
  DEFAULT_BINDER_NAME,
} from '@/src/constants/defaultBinder';

export async function ensureUserProfile(userId: string): Promise<void> {
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existingProfile) {
    return;
  }

  const { error } = await supabase.from('profiles').insert({
    id: userId,
    onboarded: true,
    languages: [],
  });

  if (error) {
    console.error('Error creating user profile:', error);
  }
}

export async function ensureDefaultBinder(userId: string): Promise<void> {
  const { data: defaultBinder, error: defaultBinderLookupError } = await supabase
    .from('binders')
    .select('id')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle();

  if (defaultBinderLookupError) {
    console.error('Error looking up default binder:', defaultBinderLookupError);
    return;
  }

  if (defaultBinder) {
    return;
  }

  const defaultBinderId = buildDefaultBinderId(userId);
  const { data: binderById } = await supabase
    .from('binders')
    .select('id')
    .eq('id', defaultBinderId)
    .maybeSingle();

  if (binderById) {
    const { error } = await supabase
      .from('binders')
      .update({ is_default: true })
      .eq('id', defaultBinderId);

    if (error) {
      console.error('Error marking existing binder as default:', error);
    }
    return;
  }

  const { error } = await supabase.from('binders').insert({
    id: defaultBinderId,
    user_id: userId,
    name: DEFAULT_BINDER_NAME,
    description: DEFAULT_BINDER_DESCRIPTION,
    is_default: true,
  });

  if (error) {
    console.error('Error creating default binder:', error);
  }
}
