// services/supabaseClient.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';

// MMKV adapter with the Web Storage-like interface Supabase expects
const mmkv = new MMKV({ id: 'naapbook-auth' });
const mmkvAdapter = {
    getItem: (key: string) => mmkv.getString(key) ?? null,
    setItem: (key: string, value: string) => { mmkv.set(key, value); },
    removeItem: (key: string) => { mmkv.delete(key); },
};

// Put your real values here (Project Settings → API in Supabase dashboard)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ijkrzixcbsocayacsxrd.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqa3J6aXhjYnNvY2F5YWNzeHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NDM1MjksImV4cCI6MjA3NTMxOTUyOX0.nmp_PH4i_cAlK1IE5Q4jDCXXQgMw9YPi_5dP5j_HNjc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: mmkvAdapter as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
