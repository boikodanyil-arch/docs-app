import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../AppContext';
import { Icon } from '../components/Icon';
import { Chip, Field, IconButton, PrimaryButton } from '../components/ui';
import { DocumentTypeId, documentTypes } from '../data/documentTypes';
import { FREE_LIMIT } from '../data/testDocuments';
import type { DocumentItem } from '../data/types';
import { useI18n } from '../i18n';
import { persistPhoto } from '../lib/files';
import { ALL_OFFSETS, ensureNotificationPermission } from '../lib/reminders';
import { formatDate, maskDateInput, parseInputDate } from '../lib/status';
import { colors, fonts, radius } from '../theme';
import type { OcrResult } from '../lib/ocr';

interface Props {
  photoUri: string | null;
  recognized: OcrResult | null;
  docId?: string;
  renewOf?: string;
}

export function ConfirmScreen({ photoUri, recognized, docId, renewOf }: Props) {
  const { t, days } = useI18n();
  const { docs, settings, saveDocument, removeDocument, reset, setTab, pop, openPaywall } = useApp();
  const editing = docs.find((d) => d.id === docId);
  // при оновленні документа беремо тип, примітку й нагадування зі старого
  const base = editing ?? docs.find((d) => d.id === renewOf);

  const [type, setType] = useState<DocumentTypeId>(editing?.type ?? recognized?.type ?? base?.type ?? 'residenceCard');
  const [typeOpen, setTypeOpen] = useState(false);
  const [issued, setIssued] = useState(
    editing?.issuedAt ? formatDate(editing.issuedAt) : recognized?.issuedAt ? formatDate(recognized.issuedAt) : '',
  );
  const [expires, setExpires] = useState(
    editing ? formatDate(editing.validUntil) : recognized?.validUntil ? formatDate(recognized.validUntil) : '',
  );
  const [note, setNote] = useState(base?.note ?? '');
  const [offsets, setOffsets] = useState<number[]>(base?.reminders ?? settings.defaultReminders);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isRecognized = !!recognized && (recognized.type || recognized.validUntil);
  const photo = editing?.photoUri ?? photoUri;
  const title = editing ? t('confirm.titleEdit') : isRecognized ? t('confirm.title') : t('confirm.manualTitle');

  function toggle(o: number) {
    setOffsets((cur) => (cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]).sort((a, b) => b - a));
  }

  async function save() {
    if (saving) return;
    const validUntil = parseInputDate(expires);
    const issuedAt = issued.trim() ? parseInputDate(issued) : null;
    if (!validUntil || (issued.trim() && !issuedAt)) return setError(t('confirm.errorDate'));
    if (issuedAt && issuedAt >= validUntil) return setError(t('confirm.errorOrder'));
    setError(null);

    if (!editing && !renewOf && !settings.unlockAll && docs.length >= FREE_LIMIT) {
      openPaywall();
      return;
    }

    setSaving(true);
    try {
      const savedPhoto = editing ? editing.photoUri : photoUri ? await persistPhoto(photoUri) : null;
      const doc: DocumentItem = {
        id: editing?.id ?? `doc-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
        type,
        issuedAt,
        validUntil,
        note: note.trim(),
        photoUri: savedPhoto,
        reminders: offsets,
        createdAt: editing?.createdAt ?? Date.now(),
      };
      if (offsets.length > 0) await ensureNotificationPermission().catch(() => false);
      await saveDocument(doc);
      if (renewOf) await removeDocument(renewOf);
      if (editing) {
        pop();
      } else {
        setTab('docs');
        reset();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <IconButton icon="chevronLeft" label={t('common.back')} onPress={pop} />
        <Text style={styles.h1} accessibilityRole="header">
          {title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {!editing && (
          <View style={styles.infoCard}>
            <View style={styles.thumb}>
              {photo ? (
                <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <Icon name="file" size={26} color="rgba(255,255,255,.7)" />
              )}
              {isRecognized && (
                <View style={styles.thumbCheck}>
                  <Icon name="check" size={12} color="#FFFFFF" strokeWidth={3.5} />
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>
                {isRecognized ? t('confirm.recognized') : t('confirm.manualCardTitle')}
              </Text>
              <Text style={styles.infoText}>
                {isRecognized ? t('confirm.recognizedText') : t('confirm.manualCardText')}
              </Text>
            </View>
          </View>
        )}

        <View style={{ gap: 6 }}>
          <Text style={styles.label}>{t('confirm.type')}</Text>
          <Pressable
            onPress={() => setTypeOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={t('confirm.type')}
            style={styles.select}
          >
            <Text style={styles.selectText}>{t(documentTypes[type].title)}</Text>
            <Icon name="chevronDown" size={18} color={colors.textSecondary} strokeWidth={2.2} />
          </Pressable>
          {typeOpen && (
            <View style={styles.options}>
              {Object.values(documentTypes).map((dt) => {
                const on = dt.id === type;
                return (
                  <Pressable
                    key={dt.id}
                    onPress={() => {
                      setType(dt.id);
                      setTypeOpen(false);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    style={[styles.option, on && { backgroundColor: '#F2F4FF' }]}
                  >
                    <Icon name={dt.icon} size={20} color={on ? colors.accent : colors.text} />
                    <Text style={[styles.optionText, on && { color: colors.accent }]}>{t(dt.title)}</Text>
                    {on && <Icon name="check" size={18} color={colors.accent} strokeWidth={2.6} />}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.row2}>
          <Field
            style={{ flex: 1 }}
            label={t('confirm.issued')}
            value={issued}
            onChangeText={(v) => setIssued(maskDateInput(v))}
            placeholder="ДД.ММ.РРРР"
            keyboardType="number-pad"
            maxLength={10}
          />
          <Field
            style={{ flex: 1 }}
            label={t('confirm.expires')}
            highlight
            value={expires}
            onChangeText={(v) => setExpires(maskDateInput(v))}
            placeholder="ДД.ММ.РРРР"
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>

        <Field
          label={t('confirm.note')}
          value={note}
          onChangeText={setNote}
          placeholder={t('confirm.notePlaceholder')}
          maxLength={80}
        />

        <View>
          <Text style={styles.label}>{t('confirm.remindMe')}</Text>
          <View style={styles.chips}>
            {ALL_OFFSETS.map((o) => (
              <Chip key={o} label={days(o)} on={offsets.includes(o)} onPress={() => toggle(o)} />
            ))}
          </View>
        </View>

        {error && (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.localRow}>
          <Icon name="lock" size={16} color={colors.textSecondary} />
          <Text style={styles.localText}>{t('confirm.localOnly')}</Text>
        </View>
        <PrimaryButton label={t('confirm.save')} onPress={save} disabled={saving} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: 54, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  h1: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, flexShrink: 1 },
  scroll: { padding: 20, gap: 14 },
  infoCard: {
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  thumb: {
    width: 64,
    height: 84,
    borderRadius: 10,
    backgroundColor: '#2C3B5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbCheck: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1B6B45',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.text },
  infoText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.textSecondary },
  select: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  options: { borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.card, overflow: 'hidden' },
  option: { minHeight: 48, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionText: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  row2: { flexDirection: 'row', gap: 10 },
  chips: { marginTop: 8, flexDirection: 'row', gap: 8 },
  error: { fontFamily: fonts.bold, fontSize: 13, color: '#B42318' },
  footer: { paddingHorizontal: 20, paddingBottom: 36, paddingTop: 8, gap: 12 },
  localRow: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  localText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
});
