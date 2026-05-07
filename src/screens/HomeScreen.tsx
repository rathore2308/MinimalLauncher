import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  StatusBar,
  AppState,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParamList} from '../App';
import {COLORS, FONTS, SPACING} from '../utils/theme';
import {
  getBlockedApps,
  getHiddenApps,
  getSettings,
  getTodayScreenTime,
  getDailyGoal,
  AppSettings,
} from '../utils/storage';
import {useInstalledApps, InstalledApp} from '../hooks/useInstalledApps';

type Nav = StackNavigationProp<RootStackParamList, 'Home'>;

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

function useClock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setTime(`${h}:${m}`);
      const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
      const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
      setDate(`${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`);
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  return {time, date};
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const {time, date} = useClock();
  const {apps, loading, reload} = useInstalledApps();

  const [blockedApps, setBlockedApps] = useState<string[]>([]);
  const [hiddenApps, setHiddenApps] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [screenTimeMinutes, setScreenTimeMinutes] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(120);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const loadData = useCallback(async () => {
    const [blocked, hidden, s, st, goal] = await Promise.all([
      getBlockedApps(),
      getHiddenApps(),
      getSettings(),
      getTodayScreenTime(),
      getDailyGoal(),
    ]);
    setBlockedApps(blocked);
    setHiddenApps(hidden);
    setSettings(s);
    setScreenTimeMinutes(st.totalMinutes);
    setDailyGoal(goal);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
      reload();
    }, [loadData, reload]),
  );

  // Filter apps
  const visibleApps = apps.filter(app => {
    if (hiddenApps.includes(app.packageName)) {
      return false;
    }
    if (settings?.hideBlockedApps && blockedApps.includes(app.packageName)) {
      return false;
    }
    if (search.trim()) {
      return app.appName.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const handleAppPress = useCallback(
    (app: InstalledApp) => {
      if (blockedApps.includes(app.packageName)) {
        navigation.navigate('BlockedWall', {
          appName: app.appName,
          appPackage: app.packageName,
        });
        return;
      }
      // Launch the app
      try {
        Linking.openURL(`android-app://${app.packageName}`).catch(() => {
          // Fallback: try intent URL
          Linking.openURL(
            `intent://launch/#Intent;package=${app.packageName};end`,
          ).catch(err => console.log('Cannot launch app:', err));
        });
      } catch (e) {
        console.log('Launch error:', e);
      }
    },
    [blockedApps, navigation],
  );

  const goalProgress = Math.min(screenTimeMinutes / dailyGoal, 1);
  const goalHours = Math.floor(dailyGoal / 60);
  const goalMins = dailyGoal % 60;
  const stHours = Math.floor(screenTimeMinutes / 60);
  const stMins = screenTimeMinutes % 60;
  const screenTimeStr =
    stHours > 0 ? `${stHours}h ${stMins}m` : `${stMins}m`;
  const goalStr =
    goalHours > 0 ? `${goalHours}h ${goalMins > 0 ? goalMins + 'm' : ''}` : `${goalMins}m`;

  const renderApp = ({item}: {item: InstalledApp}) => {
    const isBlocked = blockedApps.includes(item.packageName);
    return (
      <TouchableOpacity
        style={styles.appRow}
        onPress={() => handleAppPress(item)}
        activeOpacity={0.6}>
        <Text style={[styles.appName, isBlocked && styles.appNameBlocked]}>
          {item.appName.toLowerCase()}
        </Text>
        {isBlocked && <Text style={styles.blockedTag}>blocked</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.inner}>
        {/* Clock */}
        <View style={styles.clockBlock}>
          <Text style={styles.clockText}>{time}</Text>
          <Text style={styles.dateText}>{date.toUpperCase()}</Text>
        </View>

        {/* Screen Time Bar */}
        <View style={styles.stBlock}>
          <View style={styles.stBarTrack}>
            <View style={[styles.stBarFill, {width: `${goalProgress * 100}%`}]} />
          </View>
          <Text style={styles.stLabel}>
            {screenTimeMinutes === 0
              ? `goal: ${goalStr} daily`
              : `${screenTimeStr} today · goal: ${goalStr}`}
          </Text>
        </View>

        {/* Search */}
        {showSearch && (
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="search apps..."
              placeholderTextColor={COLORS.fgDim}
              autoFocus
              onBlur={() => {
                if (!search) setShowSearch(false);
              }}
            />
          </View>
        )}

        {/* App List */}
        <FlatList
          data={visibleApps}
          keyExtractor={item => item.packageName}
          renderItem={renderApp}
          style={styles.appList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <Text style={styles.emptyText}>loading apps...</Text>
            ) : (
              <Text style={styles.emptyText}>no apps found</Text>
            )
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        {/* Bottom Nav */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setShowSearch(v => !v)}>
            <Text style={styles.navBtnText}>search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => navigation.navigate('Stats')}>
            <Text style={styles.navBtnText}>stats</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => navigation.navigate('BlockApps')}>
            <Text style={styles.navBtnText}>block</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.navBtnText}>settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  inner: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  clockBlock: {
    marginBottom: SPACING.xl,
  },
  clockText: {
    fontSize: 56,
    fontWeight: '300',
    color: COLORS.fg,
    letterSpacing: -2,
    fontFamily: FONTS.mono,
    includeFontPadding: false,
  },
  dateText: {
    fontSize: FONTS.size.xs,
    color: COLORS.fgMuted,
    letterSpacing: 1.5,
    fontFamily: FONTS.mono,
    marginTop: 4,
  },
  stBlock: {
    marginBottom: SPACING.xl,
  },
  stBarTrack: {
    height: 2,
    backgroundColor: COLORS.bgTertiary,
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 6,
  },
  stBarFill: {
    height: '100%',
    backgroundColor: COLORS.fg,
    borderRadius: 1,
  },
  stLabel: {
    fontSize: FONTS.size.xs,
    color: COLORS.fgMuted,
    fontFamily: FONTS.mono,
    letterSpacing: 0.5,
  },
  searchRow: {
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    fontSize: FONTS.size.md,
    color: COLORS.fg,
    fontFamily: FONTS.mono,
    paddingVertical: SPACING.sm,
    paddingHorizontal: 0,
  },
  appList: {
    flex: 1,
  },
  appRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderDim,
  },
  appName: {
    fontSize: FONTS.size.lg,
    color: COLORS.fg,
    fontFamily: FONTS.mono,
    letterSpacing: 0.2,
  },
  appNameBlocked: {
    color: COLORS.fgDim,
    textDecorationLine: 'line-through',
  },
  blockedTag: {
    fontSize: FONTS.size.xs,
    color: COLORS.blocked,
    fontFamily: FONTS.mono,
    letterSpacing: 0.8,
  },
  emptyText: {
    fontSize: FONTS.size.md,
    color: COLORS.fgMuted,
    fontFamily: FONTS.mono,
    paddingVertical: SPACING.xl,
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  navBtnText: {
    fontSize: FONTS.size.xs,
    color: COLORS.fgMuted,
    fontFamily: FONTS.mono,
    letterSpacing: 1,
  },
});
