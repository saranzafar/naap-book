// src/navigation/AppNavigator.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import AddClientScreen from '../screens/AddClientScreen';
import ClientDetailScreen from '../screens/ClientDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  AddClient: { clientId?: string };
  ClientDetail: { clientId: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, // We'll use custom headers in each screen
          contentStyle: {
            backgroundColor: isDark ? '#000000' : '#f9fafb',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'NaapBook',
          }}
        />
        <Stack.Screen
          name="AddClient"
          component={AddClientScreen}
          options={{
            title: 'Add Client',
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="ClientDetail"
          component={ClientDetailScreen}
          options={{
            title: 'Client Details',
          }}
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
    </NavigationContainer>
  );
};

export default AppNavigator;