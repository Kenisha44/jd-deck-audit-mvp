import { supabase } from '../supabase.js';

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    return {
      success: false,
      error
    };
  }

  return {
    success: true,
    data
  };
}

export async function createProfile(user) {
  const profile = {
    id: user.id,
    full_name:
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'JD User',
    company: '',
    avatar_url: ''
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error
    };
  }

  return {
    success: true,
    data
  };
}

export async function ensureProfile(user) {
  if (!user?.id) {
    return {
      success: false,
      error: new Error('No authenticated user was provided.')
    };
  }

  const existing = await getProfile(user.id);

  if (!existing.success) {
    return existing;
  }

  if (existing.data) {
    return existing;
  }

  return createProfile(user);
}

export async function updateProfile(userId, updates) {
  const allowedUpdates = {
    full_name: updates.full_name,
    company: updates.company,
    avatar_url: updates.avatar_url
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(allowedUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error
    };
  }

  return {
    success: true,
    data
  };
}