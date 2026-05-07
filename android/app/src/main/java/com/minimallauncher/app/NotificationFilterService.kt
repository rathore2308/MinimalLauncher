package com.minimallauncher.app

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.content.SharedPreferences

class NotificationFilterService : NotificationListenerService() {

    private val PREFS = "MinimalLauncherPrefs"
    private val KEY_FILTER_ENABLED = "notificationFilterEnabled"
    private val ALLOWED_PKGS = setOf(
        "com.android.dialer",
        "com.android.phone",
        "com.android.mms",
        "com.google.android.dialer",
        "com.samsung.android.dialer",
    )

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val prefs: SharedPreferences = applicationContext.getSharedPreferences(PREFS, MODE_PRIVATE)
        val filterEnabled = prefs.getBoolean(KEY_FILTER_ENABLED, false)

        if (filterEnabled && !ALLOWED_PKGS.contains(sbn.packageName)) {
            cancelNotification(sbn.key)
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {}
}
