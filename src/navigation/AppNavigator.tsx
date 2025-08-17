// navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import AddClientScreen from '../screens/AddClientScreen';
import ClientDetailScreen from '../screens/ClientDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditClientScreen from '../screens/EditClientScreen';
import { Client } from '../types/Client';

export type RootStackParamList = {
  Home: undefined;
  AddClient: { clientId?: string };
  ClientDetail: { client: Client };
  EditClient: { clientId: string; client?: Client };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false, // keep hidden by default
        contentStyle: {
          backgroundColor: isDark ? '#000000' : '#f9fafb',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'NaapBook' }}
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
    </Stack.Navigator>
  );
};

export default AppNavigator;
