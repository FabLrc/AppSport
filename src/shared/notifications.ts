import * as Notifications from 'expo-notifications';

import { buildNotificationSpecs } from '@/domain/reminders';
import { getAllRappels, updateRappel } from '@/db/repositories/journalRappelRepository';
import { getMacroplanning } from '@/db/repositories/macroPlanningRepository';
import type { RappelType } from '@/db/repositories/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.DEFAULT,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function specTrigger(
  spec: ReturnType<typeof buildNotificationSpecs>[number],
): Notifications.NotificationTriggerInput {
  const t = spec.trigger;
  if (t.type === 'daily') {
    return {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: t.hour,
      minute: t.minute,
    };
  }
  return {
    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
    weekday: t.weekday,
    hour: t.hour,
    minute: t.minute,
  };
}

/** Cancel + reschedule all active reminders from DB. Called on app start. */
export async function syncAllReminders(): Promise<void> {
  const [rappels, planning] = await Promise.all([getAllRappels(), getMacroplanning()]);

  for (const rappel of rappels) {
    for (const id of rappel.notification_ids) {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
    }

    const specs = buildNotificationSpecs(rappel, planning);
    const ids: string[] = [];

    for (const spec of specs) {
      const id = await Notifications.scheduleNotificationAsync({
        identifier: spec.identifier,
        content: { title: spec.title, body: spec.body },
        trigger: specTrigger(spec),
      }).catch(() => null);
      if (id) ids.push(id);
    }

    await updateRappel(rappel.type as RappelType, { notification_ids: ids });
  }
}

/** Sync a single reminder type (when user toggles or changes time). */
export async function syncRappel(type: RappelType): Promise<void> {
  const [rappels, planning] = await Promise.all([getAllRappels(), getMacroplanning()]);
  const rappel = rappels.find((r) => r.type === type);
  if (!rappel) return;

  for (const id of rappel.notification_ids) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
  }

  const specs = buildNotificationSpecs(rappel, planning);
  const ids: string[] = [];

  for (const spec of specs) {
    const id = await Notifications.scheduleNotificationAsync({
      identifier: spec.identifier,
      content: { title: spec.title, body: spec.body },
      trigger: specTrigger(spec),
    }).catch(() => null);
    if (id) ids.push(id);
  }

  await updateRappel(type, { notification_ids: ids });
}

/** One-shot notification for rest timer end (background). */
export async function scheduleRestEndNotification(restSeconds: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: 'rest_timer_end',
    content: {
      title: 'Repos terminé',
      body: 'Lance ta prochaine série 💪',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: restSeconds,
      repeats: false,
    },
  }).catch(() => undefined);
}

export async function cancelRestEndNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync('rest_timer_end').catch(() => undefined);
}
