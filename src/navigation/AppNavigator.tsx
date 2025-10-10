import React, { useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

import HomeScreen from '../screens/HomeScreen';
import AddClientScreen from '../screens/AddClientScreen';
import ClientDetailScreen from '../screens/ClientDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditClientScreen from '../screens/EditClientScreen';
import { Client } from '../types/Client';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgetPasswordScreen from '../screens/auth/ForgetPasswordScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';

import ProfileScreen from '../screens/user/ProfileScreen';

// Temporary splash while we check session
const Splash = () => null;

export type RootStackParamList = {
  Home: { email?: string } | undefined;
  AddClient: { clientId?: string };
  ClientDetail: { client: Client };
  EditClient: { clientId: string; client?: Client };
  Settings: undefined;
  Profile: undefined;

  // Auth routes
  Login: undefined;
  Signup: undefined;
  ForgetPassword: undefined;
  OTPVerification: { email?: string } | undefined;
  ChangePassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Supabase session gate (login/logout/refresh)
  useEffect(() => {
    let unsub: (() => void) | undefined;

    const init = async () => {
      const {
        data: { session: current },
      } = await supabase.auth.getSession();

      const isExpired =
        !!current?.expires_at && current.expires_at * 1000 <= Date.now();

      if (isExpired) {
        const { data, error } = await supabase.auth.refreshSession();
        if (error || !data.session) {
          await supabase.auth.signOut();
          setSession(null);
        } else {
          setSession(data.session);
        }
      } else {
        setSession(current ?? null);
      }

      const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
        setSession(s ?? null);
      });
      unsub = () => sub.subscription.unsubscribe();

      setLoading(false);
    };

    init();
    return () => unsub?.();
  }, []);

  const isAuthed = useMemo(() => !!session?.user, [session]);

  if (loading) return <Splash />;

  return (
    <Stack.Navigator
      initialRouteName={isAuthed ? 'Home' : 'Login'}
      screenOptions={{
        headerShown: false, // keep hidden by default
        contentStyle: {
          backgroundColor: isDark ? '#000000' : '#f9fafb',
        },
        animation: 'slide_from_right',
      }}
    >
      {isAuthed ? (
        // ---------------- APP (PRIVATE) STACK ----------------
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'NaapBook' }}
          />

          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerShown: true,
              title: 'Profile',
              presentation: 'modal',
              animation: 'slide_from_right',
              headerStyle: {
                backgroundColor: isDark ? '#0b0b0b' : '#ffffff',
              },
              headerTitleStyle: { fontWeight: '600' },
              headerTintColor: isDark ? '#ffffff' : '#111827',
            }}
          />

          <Stack.Screen
            name="AddClient"
            component={AddClientScreen}
            options={{
              headerShown: true,
              title: 'Add Client',
              presentation: 'modal',
              animation: 'slide_from_right',
              headerStyle: {
                backgroundColor: isDark ? '#0b0b0b' : '#ffffff',
              },
              headerTitleStyle: { fontWeight: '600' },
              headerTintColor: isDark ? '#ffffff' : '#111827',
            }}
          />

          <Stack.Screen
            name="EditClient"
            component={EditClientScreen}
            options={{
              headerShown: true,
              title: 'Edit Client',
              presentation: 'modal',
              animation: 'slide_from_right',
              headerStyle: {
                backgroundColor: isDark ? '#0b0b0b' : '#ffffff',
              },
              headerTitleStyle: { fontWeight: '600' },
              headerTintColor: isDark ? '#ffffff' : '#111827',
            }}
          />

          <Stack.Screen
            name="ClientDetail"
            component={ClientDetailScreen}
            options={() => ({
              headerShown: true,
              title: 'Details',
              presentation: 'card',
              animation: 'slide_from_right',
              headerStyle: {
                backgroundColor: isDark ? '#0b0b0b' : '#ffffff',
              },
              headerTitleStyle: { fontWeight: '600' },
              headerTintColor: isDark ? '#ffffff' : '#111827', // back arrow + title 
            })}
          />

          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Settings',
              presentation: 'modal',
              animation: 'slide_from_right',
            }}
          />
        </>
      ) : (
        // ---------------- AUTH (PUBLIC) STACK ----------------
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ animationTypeForReplace: 'push', gestureEnabled: false }}
          />

          <Stack.Screen
            name="Signup"
            component={SignupScreen}
          />

          <Stack.Screen
            name="ForgetPassword"
            component={ForgetPasswordScreen}
          />

          <Stack.Screen
            name="OTPVerification"
            component={OTPVerificationScreen}
          />

          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ gestureEnabled: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
