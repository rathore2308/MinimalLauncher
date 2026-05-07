# Minimal Launcher — Android App

A distraction-free Android home screen launcher built with React Native.

## Features
- **Text-only, monochrome interface** — no icons, no colors
- **App blocking** — shows a mindful wall instead of opening blocked apps
- **App hiding** — invisible apps on home screen
- **Screen time stats** — daily usage, per-app breakdown, weekly chart, pickup count
- **Notification filter** — only calls/SMS pass through when enabled
- **Focus mode** — mass-block all social/entertainment apps
- **Bedtime mode** — scheduled blocking
- **Uninstall guard** — confirmation before removing apps

---

## Prerequisites

Install these before building:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| Java JDK | 17 or 21 | https://adoptium.net |
| Android Studio | Latest | https://developer.android.com/studio |
| Android SDK | API 34 | Via Android Studio |

---

## Setup

### 1. Install Android Studio & SDK

1. Download and install Android Studio
2. Open Android Studio → SDK Manager
3. Install **Android 14 (API 34)** SDK
4. Install **Build Tools 34.0.0**
5. Install **NDK 26.1.10909125**
6. Set environment variables:

```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk        # macOS/Linux
# or: export ANDROID_HOME=$HOME/Library/Android/sdk  (macOS)
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 2. Install dependencies

```bash
cd MinimalLauncher
npm install
```

### 3. Generate debug keystore (if missing)

```bash
cd android/app
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore debug.keystore \
  -storepass android \
  -alias androiddebugkey \
  -keypass android \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=Android Debug,O=Android,C=US"
```

---

## Build APK

### Debug APK (for testing)

```bash
cd android
./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

---

## Install on Device

### Option A: USB (recommended)
```bash
# Enable USB debugging on your phone:
# Settings → About Phone → tap Build Number 7x → Developer Options → USB Debugging ON

adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Option B: Wireless / File transfer
Copy the APK to your phone and open it. You may need to allow "Install from unknown sources" in Settings → Security.

---

## Set as Default Launcher

After installing:
1. Press your **Home button**
2. Android will show a launcher picker — select **"Minimal Launcher"**
3. Choose **"Always"**

To revert: Settings → Apps → Default Apps → Home App → select your original launcher.

---

## Permissions Required

| Permission | Purpose |
|------------|---------|
| `QUERY_ALL_PACKAGES` | List installed apps |
| `PACKAGE_USAGE_STATS` | Screen time tracking (must be granted manually) |
| `BIND_NOTIFICATION_LISTENER_SERVICE` | Notification filtering (optional) |

### Grant Usage Stats permission:
```
Settings → Apps → Special App Access → Usage Access → Minimal Launcher → Allow
```

### Grant Notification Access (for filtering):
```
Settings → Apps → Special App Access → Notification Access → Minimal Launcher → Allow
```

---

## Development

### Run on device/emulator

```bash
# Start Metro bundler
npm start

# In another terminal:
npm run android
```

### Project Structure

```
MinimalLauncher/
├── index.js                    # App entry point
├── src/
│   ├── App.tsx                 # Navigation root
│   ├── screens/
│   │   ├── HomeScreen.tsx      # Main launcher screen
│   │   ├── BlockAppsScreen.tsx # Block/hide apps
│   │   ├── StatsScreen.tsx     # Screen time stats
│   │   ├── SettingsScreen.tsx  # Settings toggles
│   │   └── BlockedWallScreen.tsx # Shown when blocked app tapped
│   ├── hooks/
│   │   └── useInstalledApps.ts # Hook to fetch installed apps
│   └── utils/
│       ├── theme.ts            # Colors, fonts, spacing
│       └── storage.ts          # AsyncStorage helpers
└── android/
    ├── app/
    │   └── src/main/java/com/minimallauncher/app/
    │       ├── MainActivity.kt           # Launcher activity
    │       ├── MainApplication.kt        # App class
    │       ├── InstalledAppsModule.kt    # Native: list apps
    │       ├── InstalledAppsPackage.kt
    │       ├── UsageStatsModule.kt       # Native: screen time
    │       ├── UsageStatsPackage.kt
    │       ├── BootReceiver.kt           # Restore on reboot
    │       └── NotificationFilterService.kt
    └── app/src/main/AndroidManifest.xml  # Registers as HOME launcher
```

---

## Troubleshooting

**"SDK not found"**: Make sure `ANDROID_HOME` is set correctly.

**Build fails with Kotlin error**: Run `cd android && ./gradlew clean` then rebuild.

**Apps not loading**: The app uses a fallback list in dev mode. On a real device with the APK installed it will load actual apps.

**App not showing as launcher option**: Ensure the `android.intent.category.HOME` intent-filter is in the manifest (it is).

**Screen time shows 0**: Go to Settings → Apps → Special App Access → Usage Access and enable for Minimal Launcher.
