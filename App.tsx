import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { Unbounded_600SemiBold } from '@expo-google-fonts/unbounded';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { I18nProvider } from './src/i18n';
import { DocumentsScreen } from './src/screens/DocumentsScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { colors } from './src/theme';

// Поки без бібліотеки навігації: два екрани перемикаються станом.
// Коли екранів стане більше — підключимо React Navigation / expo-router.
type Screen = 'welcome' | 'documents';

export default function App() {
  const [fontsLoaded] = useFonts({
    Unbounded_600SemiBold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const [screen, setScreen] = useState<Screen>('welcome');

  if (!fontsLoaded) return <View style={styles.loading} />;

  return (
    <I18nProvider>
      <StatusBar style={screen === 'welcome' ? 'light' : 'dark'} />
      <View style={styles.frame}>
        <View style={styles.app}>
          {screen === 'welcome' ? (
            <WelcomeScreen onStart={() => setScreen('documents')} />
          ) : (
            <DocumentsScreen />
          )}
        </View>
      </View>
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.welcome },
  // У браузері тримаємо ширину як у телефона
  frame: { flex: 1, backgroundColor: '#1A1C22', alignItems: 'center' },
  app: { flex: 1, width: '100%', maxWidth: 430 },
});
