import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { UserAPI } from '../api/endpoints';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    // Push tokens only work on physical devices / real builds, not simulators.
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E63E9',
    });
  }

  const tokenResponse = await Notifications.getDevicePushTokenAsync();
  return tokenResponse.data;
}

/**
 * Registers this device for push notifications once the user is
 * authenticated, syncs the token to the backend, and routes the user
 * to the right screen when they tap a notification.
 */
export function usePushNotifications(isAuthenticated: boolean) {
  const router = useRouter();
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token && !cancelled) {
          await UserAPI.updateFcmToken(token);
        }
      } catch {
        // Non-fatal: app works fine without push, just no device token synced.
      }
    })();

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as
        | { bookingId?: string; type?: string }
        | undefined;
      if (data?.bookingId) {
        router.push({ pathname: '/booking/[id]', params: { id: data.bookingId } });
      } else {
        router.push('/(tabs)/notifications');
      }
    });

    return () => {
      cancelled = true;
      responseListener.current?.remove();
    };
  }, [isAuthenticated]);
}
