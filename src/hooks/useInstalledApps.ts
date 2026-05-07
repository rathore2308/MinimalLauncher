import {useState, useEffect, useCallback} from 'react';
import {NativeModules, NativeEventEmitter} from 'react-native';

export interface InstalledApp {
  packageName: string;
  appName: string;
  isSystemApp: boolean;
}

// Fallback list used in dev/emulator mode
const FALLBACK_APPS: InstalledApp[] = [
  {packageName: 'com.android.dialer', appName: 'Phone', isSystemApp: true},
  {packageName: 'com.android.mms', appName: 'Messages', isSystemApp: true},
  {packageName: 'com.google.android.apps.maps', appName: 'Maps', isSystemApp: false},
  {packageName: 'com.android.camera2', appName: 'Camera', isSystemApp: true},
  {packageName: 'com.google.android.gm', appName: 'Gmail', isSystemApp: false},
  {packageName: 'com.google.android.apps.photos', appName: 'Photos', isSystemApp: false},
  {packageName: 'com.instagram.android', appName: 'Instagram', isSystemApp: false},
  {packageName: 'com.zhiliaoapp.musically', appName: 'TikTok', isSystemApp: false},
  {packageName: 'com.twitter.android', appName: 'Twitter', isSystemApp: false},
  {packageName: 'com.google.android.youtube', appName: 'YouTube', isSystemApp: false},
  {packageName: 'com.reddit.frontpage', appName: 'Reddit', isSystemApp: false},
  {packageName: 'com.facebook.katana', appName: 'Facebook', isSystemApp: false},
  {packageName: 'com.whatsapp', appName: 'WhatsApp', isSystemApp: false},
  {packageName: 'com.spotify.music', appName: 'Spotify', isSystemApp: false},
  {packageName: 'com.netflix.mediaclient', appName: 'Netflix', isSystemApp: false},
  {packageName: 'com.android.chrome', appName: 'Chrome', isSystemApp: false},
  {packageName: 'com.google.android.calculator', appName: 'Calculator', isSystemApp: true},
  {packageName: 'com.android.settings', appName: 'Settings', isSystemApp: true},
];

export function useInstalledApps() {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApps = useCallback(async () => {
    setLoading(true);
    try {
      // Try native module first
      const {InstalledApps} = NativeModules;
      if (InstalledApps && InstalledApps.getApps) {
        const list = await InstalledApps.getApps();
        const parsed: InstalledApp[] = list.map((a: any) => ({
          packageName: a.packageName,
          appName: a.label || a.appName || a.packageName,
          isSystemApp: a.isSystemApp || false,
        }));
        // Filter out self
        const filtered = parsed.filter(
          a => a.packageName !== 'com.minimallauncher.app',
        );
        filtered.sort((a, b) => a.appName.localeCompare(b.appName));
        setApps(filtered);
      } else {
        // Use fallback in dev/emulator
        setApps(FALLBACK_APPS);
      }
    } catch (e) {
      setApps(FALLBACK_APPS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  return {apps, loading, reload: loadApps};
}
