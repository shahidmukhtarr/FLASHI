/**
 * FLASHI Push Notification Scheduler
 * 
 * This script runs inside the Capacitor WebView.
 * It fetches daily deal notifications from the API and schedules them
 * as native local notifications so they appear in the phone's notification bar,
 * even when the app is closed.
 * 
 * Schedule: 5 notifications per day at 9AM, 12PM, 3PM, 6PM, 9PM PKT
 */

(function() {
  'use strict';

  // Only run inside the Capacitor app
  if (!window.Capacitor) return;

  const SCHEDULE_KEY = 'flashi_notif_scheduled_date';
  const API_BASE = 'https://flashi.pk';

  async function initNotifications() {
    try {
      // Dynamic import — Capacitor plugins are available on the window
      const { LocalNotifications } = window.Capacitor.Plugins;
      if (!LocalNotifications) {
        console.log('[FlashiNotif] LocalNotifications plugin not available');
        return;
      }

      // Check if we already scheduled today
      const today = new Date().toDateString();
      const lastScheduled = localStorage.getItem(SCHEDULE_KEY);
      if (lastScheduled === today) {
        console.log('[FlashiNotif] Already scheduled for today, skipping');
        return;
      }

      // Request permission
      const permResult = await LocalNotifications.requestPermissions();
      if (permResult.display !== 'granted') {
        console.log('[FlashiNotif] Notification permission denied');
        return;
      }

      // Get user email
      let email = null;
      try {
        const stored = localStorage.getItem('flashi_user');
        if (stored) {
          const user = JSON.parse(stored);
          email = user.email;
        }
      } catch(e) {}

      if (!email) {
        console.log('[FlashiNotif] No logged-in user, skipping notification schedule');
        return;
      }

      // Fetch today's notifications from the API
      const res = await fetch(`${API_BASE}/api/notifications?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (!data.success || !data.notifications) {
        console.log('[FlashiNotif] API returned no notifications');
        return;
      }

      // Cancel any previously scheduled notifications
      const pending = await LocalNotifications.getPending();
      if (pending.notifications && pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }

      // Schedule hours in PKT (UTC+5)
      const scheduleHours = [9, 12, 15, 18, 21];
      const now = new Date();
      const notificationsToSchedule = [];

      // Get today's (unread) notifications
      const todayNotifs = data.notifications.filter(n => !n.read);

      for (let i = 0; i < Math.min(todayNotifs.length, 5); i++) {
        const notif = todayNotifs[i];
        const scheduleDate = new Date();
        scheduleDate.setHours(scheduleHours[i], 0, 0, 0);

        // Only schedule if the time is in the future
        if (scheduleDate <= now) {
          // If it's already past this hour, schedule for next occurrence
          // (skip — we don't want to fire past notifications)
          continue;
        }

        // Clean emoji from title for system notification (some Android versions don't render well)
        const cleanTitle = notif.title.replace(/[\u{1F600}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{FE00}-\u{FEFF}]|[\u{1FA00}-\u{1FAFF}]/gu, '').trim();

        notificationsToSchedule.push({
          id: 5000 + i,
          title: cleanTitle || 'FLASHI Deal Alert',
          body: notif.body,
          largeBody: notif.body,
          summaryText: notif.store ? `From ${notif.store}` : 'FLASHI Deals',
          schedule: { at: scheduleDate },
          sound: 'beep.wav',
          smallIcon: 'ic_stat_icon_config_sample',
          largeIcon: 'ic_launcher',
          channelId: 'flashi-deals',
          group: 'flashi-deals',
          groupSummary: false,
          actionTypeId: '',
          extra: {
            url: notif.actionUrl || '/',
            notifId: notif.id,
          },
        });
      }

      if (notificationsToSchedule.length > 0) {
        // Create notification channel (Android 8+)
        try {
          await LocalNotifications.createChannel({
            id: 'flashi-deals',
            name: 'FLASHI Deals',
            description: 'Daily deal alerts and price drops',
            importance: 4, // HIGH
            visibility: 1, // PUBLIC
            vibration: true,
            lights: true,
            lightColor: '#2e7d32',
          });
        } catch(e) {
          // Channel might already exist, that's fine
        }

        await LocalNotifications.schedule({
          notifications: notificationsToSchedule,
        });

        console.log(`[FlashiNotif] Scheduled ${notificationsToSchedule.length} notifications for today`);
      } else {
        console.log('[FlashiNotif] No future notifications to schedule today');
      }

      // Mark today as scheduled
      localStorage.setItem(SCHEDULE_KEY, today);

      // Listen for notification clicks — navigate to the deal
      LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        const url = action.notification?.extra?.url;
        if (url) {
          window.location.href = url;
        }
      });

    } catch (err) {
      console.error('[FlashiNotif] Error:', err);
    }
  }

  // Run after a short delay to let the app fully load
  if (document.readyState === 'complete') {
    setTimeout(initNotifications, 3000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(initNotifications, 3000);
    });
  }
})();
