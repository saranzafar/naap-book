import React from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import './global.css';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <GestureHandlerRootView  className='flex-1r'>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#000000' : '#ffffff'}
        />
        {/* Apply theme at the very top */}
        <AppThemeWrapper isDark={isDark}>
          <AppNavigator />
        </AppThemeWrapper>
        <Toast topOffset={50} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const AppThemeWrapper = ({ isDark, children }: { isDark: boolean; children: React.ReactNode }) => (
  <GestureHandlerRootView className={`${isDark ? 'dark' : ''} flex-1 bg-white dark:bg-black`}>
    {children}
  </GestureHandlerRootView>
);

export default App;
