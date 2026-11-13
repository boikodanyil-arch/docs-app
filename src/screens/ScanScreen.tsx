import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../AppContext';
import { Icon } from '../components/Icon';
import { useI18n } from '../i18n';
import { info } from '../lib/dialog';
import { recognizeDocument } from '../lib/ocr';
import { colors, fonts } from '../theme';

export function ScanScreen({ renewOf }: { renewOf?: string }) {
  const { t } = useI18n();
  const { push, pop } = useApp();
  const [perm, requestPerm] = useCameraPermissions();
  const camRef = useRef<CameraView>(null);
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);

  async function goConfirm(photoUri: string | null) {
    setBusy(true);
    const recognized = photoUri ? await recognizeDocument(photoUri).catch(() => null) : null;
    setBusy(false);
    // замінюємо екран сканування на екран підтвердження
    pop();
    push({ name: 'confirm', photoUri, recognized, renewOf });
  }

  async function shoot() {
    if (busy || !camRef.current) return;
    try {
      const photo = await camRef.current.takePictureAsync({ quality: 0.7 });
      await goConfirm(photo.uri);
    } catch {
      info(t('scan.error'));
    }
  }

  async function pickFromGallery() {
    if (busy) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled && res.assets[0]) await goConfirm(res.assets[0].uri);
  }

  const granted = perm?.granted;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <RoundBtn icon="close" label={t('scan.close')} onPress={pop} />
        <Text style={styles.title}>{t('scan.title')}</Text>
        <RoundBtn icon="flash" label={t('scan.torch')} onPress={() => setTorch((v) => !v)} active={torch} />
      </View>

      <View style={styles.frameWrap}>
        {granted ? (
          <CameraView ref={camRef} style={styles.camera} facing="back" enableTorch={torch} />
        ) : (
          <View style={[styles.camera, styles.permBox]}>
            {perm === null ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon name="scan" size={36} color="#8EA2FF" />
                <Text style={styles.permTitle}>{t('scan.permTitle')}</Text>
                <Text style={styles.permText}>{t('scan.permText')}</Text>
                <Pressable
                  accessibilityRole="button"
                  style={styles.permBtn}
                  onPress={() => (perm.canAskAgain ? requestPerm() : Linking.openSettings())}
                >
                  <Text style={styles.permBtnText}>
                    {perm.canAskAgain ? t('scan.permButton') : t('scan.permSettings')}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        )}
        <View style={styles.corners} pointerEvents="none">
          <View style={[styles.corner, { left: 0, top: 0, borderLeftWidth: 4, borderTopWidth: 4, borderTopLeftRadius: 18 }]} />
          <View style={[styles.corner, { right: 0, top: 0, borderRightWidth: 4, borderTopWidth: 4, borderTopRightRadius: 18 }]} />
          <View style={[styles.corner, { left: 0, bottom: 0, borderLeftWidth: 4, borderBottomWidth: 4, borderBottomLeftRadius: 18 }]} />
          <View style={[styles.corner, { right: 0, bottom: 0, borderRightWidth: 4, borderBottomWidth: 4, borderBottomRightRadius: 18 }]} />
        </View>
      </View>

      <Text style={styles.hint}>{busy ? '…' : t('scan.hint')}</Text>

      <View style={{ flex: 1 }} />

      <View style={styles.controls}>
        <Pressable
          onPress={pickFromGallery}
          accessibilityRole="button"
          accessibilityLabel={t('scan.gallery')}
          style={styles.sideBtn}
        >
          <Icon name="gallery" size={22} color="#FFFFFF" />
        </Pressable>
        <Pressable
          onPress={shoot}
          disabled={!granted || busy}
          accessibilityRole="button"
          accessibilityLabel={t('scan.shutter')}
          style={[styles.shutter, !granted && { opacity: 0.4 }]}
        >
          <View style={styles.shutterInner} />
        </Pressable>
        <Pressable
          onPress={() => goConfirm(null)}
          accessibilityRole="button"
          style={styles.manualBtn}
        >
          <Text style={styles.manualText}>{t('scan.manual')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function RoundBtn({
  icon,
  label,
  onPress,
  active,
}: {
  icon: 'close' | 'flash';
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.round, active && { backgroundColor: '#FFFFFF' }]}
    >
      <Icon name={icon} size={20} color={active ? '#07080C' : '#FFFFFF'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07080C' },
  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.extrabold, fontSize: 15, color: '#FFFFFF' },
  frameWrap: { marginTop: 32, width: 310, height: 420, alignSelf: 'center' },
  camera: { position: 'absolute', left: 6, right: 6, top: 14, bottom: 14, borderRadius: 14, overflow: 'hidden', backgroundColor: '#14161B' },
  permBox: { alignItems: 'center', justifyContent: 'center', padding: 20, gap: 10 },
  permTitle: { fontFamily: fonts.extrabold, fontSize: 16, color: '#FFFFFF', textAlign: 'center' },
  permText: { fontFamily: fonts.regular, fontSize: 13, color: '#C9CCD8', textAlign: 'center', lineHeight: 18 },
  permBtn: { marginTop: 6, minHeight: 44, paddingHorizontal: 18, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  permBtnText: { fontFamily: fonts.extrabold, fontSize: 14, color: '#FFFFFF' },
  corners: { position: 'absolute', left: 6, right: 6, top: 14, bottom: 14 },
  corner: { position: 'absolute', width: 42, height: 42, borderColor: '#FFFFFF' },
  hint: { marginTop: 18, textAlign: 'center', fontFamily: fonts.bold, fontSize: 15, color: '#FFFFFF' },
  controls: {
    paddingHorizontal: 36,
    paddingBottom: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.25)',
    backgroundColor: 'rgba(255,255,255,.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' },
  manualBtn: {
    minWidth: 52,
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualText: { fontFamily: fonts.extrabold, fontSize: 15, color: '#FFFFFF' },
});
