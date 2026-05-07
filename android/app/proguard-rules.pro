-keep class com.minimallauncher.app.** { *; }
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}
-dontwarn com.facebook.**
