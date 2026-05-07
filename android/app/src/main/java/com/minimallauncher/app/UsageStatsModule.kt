package com.minimallauncher.app

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.*
import java.util.Calendar

class UsageStatsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "UsageStats"

    private fun hasUsagePermission(): Boolean {
        val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            android.os.Process.myUid(),
            reactContext.packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    @ReactMethod
    fun checkPermission(promise: Promise) {
        promise.resolve(hasUsagePermission())
    }

    @ReactMethod
    fun requestPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_PERMISSION", e.message, e)
        }
    }

    @ReactMethod
    fun getTodayUsage(promise: Promise) {
        if (!hasUsagePermission()) {
            promise.reject("ERR_PERMISSION", "Usage stats permission not granted")
            return
        }

        try {
            val usageStatsManager =
                reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

            val cal = Calendar.getInstance()
            cal.set(Calendar.HOUR_OF_DAY, 0)
            cal.set(Calendar.MINUTE, 0)
            cal.set(Calendar.SECOND, 0)
            cal.set(Calendar.MILLISECOND, 0)
            val startTime = cal.timeInMillis
            val endTime = System.currentTimeMillis()

            val statsMap = usageStatsManager.queryAndAggregateUsageStats(startTime, endTime)
            val pm = reactContext.packageManager

            val result = Arguments.createArray()
            val selfPkg = reactContext.packageName

            statsMap.entries
                .filter { (pkg, stats) ->
                    pkg != selfPkg && stats.totalTimeInForeground > 0
                }
                .sortedByDescending { it.value.totalTimeInForeground }
                .take(20)
                .forEach { (pkg, stats) ->
                    val appName = try {
                        pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString()
                    } catch (e: Exception) { pkg }

                    val map = Arguments.createMap()
                    map.putString("packageName", pkg)
                    map.putString("appName", appName)
                    map.putDouble("totalMinutes", stats.totalTimeInForeground / 60000.0)
                    result.pushMap(map)
                }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERR_USAGE", e.message, e)
        }
    }

    @ReactMethod
    fun getPickupCount(promise: Promise) {
        if (!hasUsagePermission()) {
            promise.resolve(0)
            return
        }

        try {
            val usageStatsManager =
                reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

            val cal = Calendar.getInstance()
            cal.set(Calendar.HOUR_OF_DAY, 0)
            cal.set(Calendar.MINUTE, 0)
            cal.set(Calendar.SECOND, 0)
            cal.set(Calendar.MILLISECOND, 0)

            val events = usageStatsManager.queryEvents(cal.timeInMillis, System.currentTimeMillis())
            var pickups = 0
            val event = UsageEvents.Event()

            while (events.hasNextEvent()) {
                events.getNextEvent(event)
                if (event.eventType == UsageEvents.Event.SCREEN_INTERACTIVE) {
                    pickups++
                }
            }

            promise.resolve(pickups)
        } catch (e: Exception) {
            promise.resolve(0)
        }
    }
}
