import React, { useEffect } from 'react';
import { useColorScheme, StatusBar, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import RNBootSplash from "react-native-bootsplash";

import './global.css';
import AppNavigator from './src/navigation/AppNavigator';

const AppThemeWrapper = ({ isDark, children }: { isDark: boolean; children: React.ReactNode }) => (
  <View className={`${isDark ? 'dark' : ''} flex-1 bg-white dark:bg-black`}>{children}</View>
);

export default function App() {
  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    const init = async () => {
      // Load storage, theme, fonts, etc. if needed
      await new Promise(resolve => setTimeout(resolve, 500)); // simulate loading
    };

    init().finally(() => {
      RNBootSplash.hide({ fade: true }); // 👈 hides splash with fade effect
    });
  }, []);

  return (
    <GestureHandlerRootView className="flex-1">{/* fixed typo */}
      <SafeAreaProvider>
        <NavigationContainer>
          <BottomSheetModalProvider>
            <StatusBar
              barStyle={isDark ? 'light-content' : 'dark-content'}
              backgroundColor={isDark ? '#000000' : '#ffffff'}
            />
            <AppThemeWrapper isDark={isDark}>
              <AppNavigator />
            </AppThemeWrapper>
            <Toast topOffset={50} />
          </BottomSheetModalProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
