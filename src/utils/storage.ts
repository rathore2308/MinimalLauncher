import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  BLOCKED_APPS: 'blocked_apps',
  HIDDEN_APPS: 'hidden_apps',
  SETTINGS: 'settings',
  SCREEN_TIME: 'screen_time',
  DAILY_GOAL_MINUTES: 'daily_goal_minutes',
};

export interface AppSettings {
  monochromeMode: boolean;
  hideIcons: boolean;
  notificationFilter: boolean;
  focusMode: boolean;
  bedtimeMode: boolean;
  bedtimeStart: string;
  bedtimeEnd: string;
  uninstallGuard: boolean;
  hideBlockedApps: boolean;
  dailyGoalMinutes: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  monochromeMode: true,
  hideIcons: true,
  notificationFilter: false,
  focusMode: false,
  bedtimeMode: false,
  bedtimeStart: '22:00',
  bedtimeEnd: '07:00',
  uninstallGuard: false,
  hideBlockedApps: false,
  dailyGoalMinutes: 120,
};

export async function getBlockedApps(): Promise<string[]> {
  try {
    const val = await AsyncStorage.getItem(KEYS.BLOCKED_APPS);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export async function saveBlockedApps(apps: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.BLOCKED_APPS, JSON.stringify(apps));
}

export async function getHiddenApps(): Promise<string[]> {
  try {
    const val = await AsyncStorage.getItem(KEYS.HIDDEN_APPS);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export async function saveHiddenApps(apps: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.HIDDEN_APPS, JSON.stringify(apps));
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const val = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!val) return DEFAULT_SETTINGS;
    return {...DEFAULT_SETTINGS, ...JSON.parse(val)};
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function getDailyGoal(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(KEYS.DAILY_GOAL_MINUTES);
    return val ? parseInt(val, 10) : 120;
  } catch {
    return 120;
  }
}

export async function saveDailyGoal(minutes: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.DAILY_GOAL_MINUTES, String(minutes));
}

export interface DailyScreenTime {
  date: string;
  totalMinutes: number;
  byApp: Record<string, number>;
  pickups: number;
}

export async function getTodayScreenTime(): Promise<DailyScreenTime> {
  const today = new Date().toISOString().split('T')[0];
  try {
    const val = await AsyncStorage.getItem(`${KEYS.SCREEN_TIME}_${today}`);
    if (!val) return {date: today, totalMinutes: 0, byApp: {}, pickups: 0};
    return JSON.parse(val);
  } catch {
    return {date: today, totalMinutes: 0, byApp: {}, pickups: 0};
  }
}

export async function getWeekScreenTime(): Promise<DailyScreenTime[]> {
  const results: DailyScreenTime[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split('T')[0];
    try {
      const val = await AsyncStorage.getItem(`${KEYS.SCREEN_TIME}_${date}`);
      if (val) results.push(JSON.parse(val));
    } catch {}
  }
  return results;
}
