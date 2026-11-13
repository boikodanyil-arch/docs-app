import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { Unbounded_600SemiBold } from '@expo-google-fonts/unbounded';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, BackHandler, Platform, StyleSheet, View } from 'react-native';
import { AppProvider, useApp } from './src/AppContext';
import { store } from './src/data/store';
import type { DocumentItem } from './src/data/types';
import { I18nProvider, Lang } from './src/i18n';
import { ConfirmScreen } from './src/screens/ConfirmScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { LockScreen } from './src/screens/LockScreen';
import { MainShell } from './src/screens/MainShell';
import { PaywallSheet } from './src/screens/PaywallSheet';
import { ScanScreen } from './src/screens/ScanScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { colors } from './src/theme';

interface Loaded {
  docs: DocumentItem[];
  settings: Record<string, string>;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Unbounded_600SemiBold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [lang, setLangState] = useState<Lang>('uk');

  useEffect(() => {
    Promise.all([store.loadDocs(), store.loadSettings()])
      .then(([docs, settings]) => {
        if (settings.lang === 'uk' || settings.lang === 'pl') setLangState(settings.lang);
        setLoaded({ docs, settings });
      })
      .catch(() => setLoaded({ docs: [], settings: {} }));
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    store.setSetting('lang', l).catch(() => {});
  }, []);

  if (!fontsLoaded || !loaded) return <View style={styles.loading} />;

  return (
    <I18nProvider lang={lang} setLang={setLang}>
      <AppProvider initialDocs={loaded.docs} initialSettings={loaded.settings}>
        <Shell />
      </AppProvider>
    </I18nProvider>
  );
}

function Shell() {
  const { settings, updateSetting, route, pop, paywallOpen, closePaywall } = useApp();
  const [locked, setLocked] = useState(settings.lock && Platform.OS !== 'web');
  const lockRef = useRef(settings.lock);
  lockRef.current = settings.lock;

  // Блокуємо, коли застосунок йде у фон
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background' && lockRef.current) setLocked(true);
    });
    return () => sub.remove();
  }, []);

  // Кнопка «назад» на Android
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (paywallOpen) {
        closePaywall();
        return true;
      }
      if (route.name !== 'main') {
        pop();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [paywallOpen, route, pop, closePaywall]);

  const welcome = !settings.welcomeSeen;
  const dark = welcome || route.name === 'scan';

  let content: React.ReactNode;
  if (welcome) {
    content = <WelcomeScreen onStart={() => updateSetting('welcomeSeen', true)} />;
  } else if (route.name === 'scan') {
    content = <ScanScreen renewOf={route.renewOf} />;
  } else if (route.name === 'confirm') {
    content = (
      <ConfirmScreen
        photoUri={route.photoUri}
        recognized={route.recognized}
        docId={route.docId}
        renewOf={route.renewOf}
      />
    );
  } else if (route.name === 'detail') {
    content = <DetailScreen docId={route.docId} />;
  } else {
    content = <MainShell />;
  }

  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <View style={styles.frame}>
        <View style={styles.app}>
          {content}
          {paywallOpen && !welcome && <PaywallSheet />}
          {locked && settings.lock && <LockScreen onUnlock={() => setLocked(false)} />}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.welcome },
  // У браузері тримаємо ширину як у телефона
  frame: { flex: 1, backgroundColor: '#1A1C22', alignItems: 'center' },
  app: { flex: 1, width: '100%', maxWidth: 430, overflow: 'hidden' },
});
