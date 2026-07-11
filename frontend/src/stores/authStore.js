import { writable } from 'svelte/store';
import { supabase } from '../lib/supabase.js';

export const user = writable(null);
export const session = writable(null);
export const authLoading = writable(true);
export const authError = writable('');

let initialized = false;

export async function initializeAuth() {
  if (initialized) return;

  initialized = true;
  authLoading.set(true);
  authError.set('');

  const {
    data: { session: currentSession },
    error
  } = await supabase.auth.getSession();

  if (error) {
    authError.set(error.message);
  }

  session.set(currentSession);
  user.set(currentSession?.user ?? null);
  authLoading.set(false);

  supabase.auth.onAuthStateChange(
    (_event, nextSession) => {
      session.set(nextSession);
      user.set(nextSession?.user ?? null);
      authLoading.set(false);
    }
  );
}

export async function signUp({
  name,
  email,
  password
}) {
  authLoading.set(true);
  authError.set('');

  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        },
        emailRedirectTo: window.location.origin
      }
    });

  if (error) {
    authError.set(error.message);
    authLoading.set(false);

    return {
      success: false,
      error
    };
  }

  authLoading.set(false);

  return {
    success: true,
    data
  };
}

export async function signIn({
  email,
  password
}) {
  authLoading.set(true);
  authError.set('');

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    authError.set(error.message);
    authLoading.set(false);

    return {
      success: false,
      error
    };
  }

  authLoading.set(false);

  return {
    success: true,
    data
  };
}

export async function signOut() {
  authLoading.set(true);
  authError.set('');

  const { error } =
    await supabase.auth.signOut();

  if (error) {
    authError.set(error.message);
    authLoading.set(false);

    return {
      success: false,
      error
    };
  }

  user.set(null);
  session.set(null);
  authLoading.set(false);

  return {
    success: true
  };
}

export function clearAuthError() {
  authError.set('');
}