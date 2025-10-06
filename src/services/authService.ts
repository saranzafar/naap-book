// src/services/authService.ts
import { supabase } from './supabaseClient';
import SessionStorage from './SessionStorage';

const TOKEN_KEY = 'SUPABASE_SESSION';

export async function signUp(name: string, email: string, password: string) {
    console.log("Signing up with:", { name, email, password });

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
    });
    console.log("Data from signUp:", data, "Error from signUp:", error);

    if (error) throw error;
    return data;
}

export async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) await SessionStorage.save(TOKEN_KEY, data.session);
    return data;
}

export async function logout() {
    await supabase.auth.signOut();
    await SessionStorage.remove(TOKEN_KEY);
}

/**
 * Send password reset (email or OTP)
 * Supabase by default sends an email with a reset link.
 * If you configured OTP-based recovery, verify using verifyRecoveryOtp().
 */
export async function resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
}

// Keep both names for clarity / backward compatibility
export const sendPasswordReset = resetPassword;

export async function verifyRecoveryOtp(email: string, token: string, context: 'signup' | 'recovery') {
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: context,
    });
    if (error) throw error;
    return data;
}

export async function updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
}

export async function getCurrentSession() {
    const stored = await SessionStorage.get<any>(TOKEN_KEY);
    if (stored?.expires_at && stored.expires_at * 1000 < Date.now()) {
        await logout();
        return null;
    }

    if (stored) return stored;

    const { data: { session } } = await supabase.auth.getSession();
    if (session) await SessionStorage.save(TOKEN_KEY, session);
    return session;
}

export function onAuthChanged(cb: (session: any | null) => void) {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) SessionStorage.save(TOKEN_KEY, session);
        else SessionStorage.remove(TOKEN_KEY);
        cb(session ?? null);
    });
    return () => subscription.subscription.unsubscribe();
}
