import React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaView, StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import "./global.css"

const App = () => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : '';

  return (
    <SafeAreaView style={{ flex: 1 }} className={`${theme} flex-1`}>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </SafeAreaView>
  );
};

export default App;
