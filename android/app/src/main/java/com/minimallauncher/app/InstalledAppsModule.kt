package com.minimallauncher.app

import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.Drawable
import android.util.Base64
import com.facebook.react.bridge.*
import java.io.ByteArrayOutputStream

class InstalledAppsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "InstalledApps"

    @ReactMethod
    fun getApps(promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val intent = Intent(Intent.ACTION_MAIN, null)
            intent.addCategory(Intent.CATEGORY_LAUNCHER)

            val resolveInfoList = pm.queryIntentActivities(intent, 0)
            val selfPkg = reactContext.packageName

            val result = Arguments.createArray()

            resolveInfoList
                .filter { it.activityInfo.packageName != selfPkg }
                .sortedBy { pm.getApplicationLabel(it.activityInfo.applicationInfo).toString() }
                .forEach { resolveInfo ->
                    val appInfo = resolveInfo.activityInfo.applicationInfo
                    val pkg = appInfo.packageName
                    val label = pm.getApplicationLabel(appInfo).toString()
                    val isSystem = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0

                    val map = Arguments.createMap()
                    map.putString("packageName", pkg)
                    map.putString("appName", label)
                    map.putBoolean("isSystemApp", isSystem)
                    result.pushMap(map)
                }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERR_APPS", e.message, e)
        }
    }

    @ReactMethod
    fun launchApp(packageName: String, promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val launchIntent = pm.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(launchIntent)
                promise.resolve(true)
            } else {
                promise.reject("ERR_LAUNCH", "No launch intent found for $packageName")
            }
        } catch (e: Exception) {
            promise.reject("ERR_LAUNCH", e.message, e)
        }
    }
}
