import { Alert, Platform } from 'react-native';

/** Повідомлення (у браузері — window.alert). */
export function info(title: string, message?: string) {
  if (Platform.OS === 'web') {
    globalThis.alert?.(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

/** Питання "так/ні". Повертає true, якщо користувач підтвердив. */
export function ask(opts: {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
}): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(!!globalThis.confirm?.(opts.message ? `${opts.title}\n\n${opts.message}` : opts.title));
  }
  return new Promise((resolve) => {
    Alert.alert(
      opts.title,
      opts.message,
      [
        { text: opts.cancelLabel, style: 'cancel', onPress: () => resolve(false) },
        { text: opts.confirmLabel, style: opts.destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
