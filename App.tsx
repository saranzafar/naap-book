import React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaView, StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import "./global.css"
import Toast from 'react-native-toast-message';

const App = () => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : '';

  return (
    <SafeAreaView style={{ flex: 1 }} className={`${theme} flex-1`}>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={scheme === 'dark' ? '#000000' : '#ffffff'}
      />
      <AppNavigator />
      <Toast />
    </SafeAreaView>
  );
};

export default App;
