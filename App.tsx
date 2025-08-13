import React from 'react';
import { useColorScheme, StatusBar, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator'; // screens only, no container
import './global.css';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

const AppThemeWrapper = ({ isDark, children }: { isDark: boolean; children: React.ReactNode }) => (
  <View className={`${isDark ? 'dark' : ''} flex-1 bg-white dark:bg-black`}>{children}</View>
);

export default function App() {
  const isDark = useColorScheme() === 'dark';

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
