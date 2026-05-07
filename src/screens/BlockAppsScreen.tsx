import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParamList} from '../App';
import {COLORS, FONTS, SPACING} from '../utils/theme';
import {getBlockedApps, saveBlockedApps, getHiddenApps, saveHiddenApps} from '../utils/storage';
import {useInstalledApps, InstalledApp} from '../hooks/useInstalledApps';

type Nav = StackNavigationProp<RootStackParamList, 'BlockApps'>;

type TabType = 'block' | 'hide';

const PROTECTED = ['com.android.dialer', 'com.android.mms', 'com.android.settings'];

export default function BlockAppsScreen() {
  const navigation = useNavigation<Nav>();
  const {apps} = useInstalledApps();
  const [blockedApps, setBlockedApps] = useState<string[]>([]);
  const [hiddenApps, setHiddenApps] = useState<string[]>([]);
  const [tab, setTab] = useState<TabType>('block');
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [b, h] = await Promise.all([getBlockedApps(), getHiddenApps()]);
        setBlockedApps(b);
        setHiddenApps(h);
      })();
    }, []),
  );

  const toggleBlocked = useCallback(
    async (pkg: string) => {
      if (PROTECTED.includes(pkg)) return;
      let next: string[];
      if (blockedApps.includes(pkg)) {
        next = blockedApps.filter(a => a !== pkg);
      } else {
        next = [...blockedApps, pkg];
      }
      setBlockedApps(next);
      await saveBlockedApps(next);
    },
    [blockedApps],
  );

  const toggleHidden = useCallback(
    async (pkg: string) => {
      if (PROTECTED.includes(pkg)) return;
      let next: string[];
      if (hiddenApps.includes(pkg)) {
        next = hiddenApps.filter(a => a !== pkg);
      } else {
        next = [...hiddenApps, pkg];
      }
      setHiddenApps(next);
      await saveHiddenApps(next);
    },
    [hiddenApps],
  );

  const filtered = apps.filter(a =>
    search ? a.appName.toLowerCase().includes(search.toLowerCase()) : true,
  );

  const renderApp = ({item}: {item: InstalledApp}) => {
    const isActive =
      tab === 'block'
        ? blockedApps.includes(item.packageName)
        : hiddenApps.includes(item.packageName);
    const isProtected = PROTECTED.includes(item.packageName);

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() =>
          tab === 'block'
            ? toggleBlocked(item.packageName)
            : toggleHidden(item.packageName)
        }
        activeOpacity={isProtected ? 1 : 0.7}>
        <View style={styles.rowLeft}>
          <View style={[styles.dot, isActive && styles.dotActive]} />
          <Text style={[styles.appName, isProtected && styles.appNameProtected]}>
            {item.appName.toLowerCase()}
          </Text>
        </View>
        <Text style={[styles.statusText, isActive && styles.statusActive]}>
          {isProtected
            ? 'protected'
            : isActive
            ? tab === 'block'
              ? 'blocked'
              : 'hidden'
            : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {tab === 'block' ? 'block apps' : 'hide apps'}
        </Text>
      </View>

      {/* Tab */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'block' && styles.tabActive]}
          onPress={() => setTab('block')}>
          <Text style={[styles.tabText, tab === 'block' && styles.tabTextActive]}>
            block
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'hide' && styles.tabActive]}
          onPress={() => setTab('hide')}>
          <Text style={[styles.tabText, tab === 'hide' && styles.tabTextActive]}>
            hide
          </Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View style={styles.desc}>
        <Text style={styles.descText}>
          {tab === 'block'
            ? 'blocked apps show a wall instead of opening.'
            : 'hidden apps are invisible on the home screen.'}
        </Text>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {tab === 'block'
            ? `${blockedApps.length} app${blockedApps.length !== 1 ? 's' : ''} blocked`
            : `${hiddenApps.length} app${hiddenApps.length !== 1 ? 's' : ''} hidden`}
        </Text>
      </View>

      {/* App List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.packageName}
        renderItem={renderApp}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.bg},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backText: {
    fontSize: FONTS.size.xs,
    color: COLORS.fgMuted,
    fontFamily: FONTS.mono,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: FONTS.size.xs,
    color: COLORS.fgMuted,
    fontFamily: FONTS.mono,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  tab: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  tabActive: {
    borderColor: COLORS.fg,
  },
  tabText: {
    fontSize: FONTS.size.xs,
    color: COLORS.fgMuted,
    fontFamily: FONTS.mono,
    letterSpacing: 0.8,
  },
  tabTextActive: {color: COLORS.fg},
  desc: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.sm,
  },
  descText: {
    fontSize: FONTS.size.xs,
    color: COLORS.fgDim,
    fontFamily: FONTS.mono,
    letterSpacing: 0.4,
  },
  summary: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryText: {
    fontSize: FONTS.size.xs,
    color: COLORS.fgMuted,
    fontFamily: FONTS.mono,
    letterSpacing: 0.6,
  },
  list: {flex: 1},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  separator: {height: 1, backgroundColor: COLORS.borderDim},
  rowLeft: {flexDirection: 'row', alignItems: 'center', gap: SPACING.md},
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.bgTertiary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dotActive: {backgroundColor: COLORS.fg, borderColor: COLORS.fg},
  appName: {
    fontSize: FONTS.size.md,
    color: COLORS.fg,
    fontFamily: FONTS.mono,
  },
  appNameProtected: {color: COLORS.fgDim},
  statusText: {
    fontSize: FONTS.size.xs,
    color: 'transparent',
    fontFamily: FONTS.mono,
    letterSpacing: 0.6,
  },
  statusActive: {color: COLORS.fgDim},
});
