import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParamList} from '../App';
import {COLORS, FONTS, SPACING} from '../utils/theme';
import {getTodayScreenTime, getWeekScreenTime, getDailyGoal} from '../utils/storage';

type Nav = StackNavigationProp<RootStackParamList, 'Stats'>;

const {width: W} = Dimensions.get('window');
const BAR_MAX_HEIGHT = 80;

const TIPS = [
  'Put your phone face-down. Out of sight, out of mind.',
  'Try leaving your phone in another room while you sleep.',
  "Disable all non-essential notifications. You don't need them.",
  'Replace one phone session with a 5-minute walk.',
  'Charge your phone outside your bedroom tonight.',
  'Set a specific time to check messages — not constantly.',
];

function fmtTime(minutes: number): string {
  if (minutes === 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function StatsScreen() {
  const navigation = useNavigation<Nav>();
  const [today, setToday] = useState({totalMinutes: 84, byApp: {Messages: 38, Maps: 18, Camera: 14, Phone: 12} as Record<string, number>, pickups: 21});
  const [week, setWeek] = useState<number[]>([65, 120, 95, 140, 84, 0, 0]);
  const [dailyGoal, setDailyGoal] = useState(120);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [t, w, g] = await Promise.all([
          getTodayScreenTime(),
          getWeekScreenTime(),
          getDailyGoal(),
        ]);
        // Use real data if available, else keep mock
        if (t.totalMinutes > 0) setToday(t as any);
        if (w.length > 0) {
          const mins = w.map(d => d.totalMinutes);
          setWeek(mins);
        }
        setDailyGoal(g);
      })();
    }, []),
  );

  const todayTip = TIPS[new Date().getDay() % TIPS.length];
  const weekAvg = week.filter(v => v > 0).length > 0
    ? Math.round(week.filter(v => v > 0).reduce((a, b) => a + b, 0) / week.filter(v => v > 0).length)
    : 0;
  const weekMax = Math.max(...week, 1);
  const dayLabels = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const topApps = Object.entries(today.byApp)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topMax = topApps[0]?.[1] || 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>screen time</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Today */}
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>today</Text>
          <Text style={styles.statValue}>{fmtTime(today.totalMinutes)}</Text>
          <Text style={styles.statSub}>
            goal: {fmtTime(dailyGoal)} ·{' '}
            {today.totalMinutes <= dailyGoal
              ? `${fmtTime(dailyGoal - today.totalMinutes)} remaining`
              : `${fmtTime(today.totalMinutes - dailyGoal)} over goal`}
          </Text>
        </View>

        {/* Weekly chart */}
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>this week</Text>
          <Text style={[styles.statValue, {fontSize: FONTS.size.xxl}]}>{fmtTime(weekAvg)}</Text>
          <Text style={styles.statSub}>daily average</Text>

          <View style={styles.barChart}>
            {week.map((val, i) => (
              <View key={i} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    {height: val > 0 ? Math.max((val / weekMax) * BAR_MAX_HEIGHT, 3) : 3},
                    val > dailyGoal && styles.barOver,
                  ]}
                />
                <Text style={styles.barLabel}>{dayLabels[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pickups */}
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>pickups today</Text>
          <Text style={styles.statValue}>{today.pickups}</Text>
          <Text style={styles.statSub}>times you picked up your phone</Text>
        </View>

        {/* By app */}
        {topApps.length > 0 && (
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>by app today</Text>
            {topApps.map(([name, mins]) => (
              <View key={name} style={styles.usageRow}>
                <Text style={styles.usageApp}>{name.toLowerCase()}</Text>
                <View style={styles.usageBarTrack}>
                  <View
                    style={[
                      styles.usageBarFill,
                      {width: `${(mins / topMax) * 100}%`},
                    ]}
                  />
                </View>
                <Text style={styles.usageTime}>{fmtTime(mins)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tip */}
        <View style={styles.tipBlock}>
          <Text style={styles.tipLabel}>detox tip</Text>
          <Text style={styles.tipText}>{todayTip}</Text>
        </View>

        <View style={{height: SPACING.xxl}} />
      </ScrollView>
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
  backText: {fontSize: FONTS.size.xs, color: COLORS.fgMuted, fontFamily: FONTS.mono, letterSpacing: 0.8},
  headerTitle: {fontSize: FONTS.size.xs, color: COLORS.fgMuted, fontFamily: FONTS.mono, letterSpacing: 1.5, textTransform: 'uppercase'},
  scroll: {flex: 1},
  statBlock: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statLabel: {fontSize: FONTS.size.xs, color: COLORS.fgMuted, fontFamily: FONTS.mono, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: SPACING.sm},
  statValue: {fontSize: 36, fontWeight: '300', color: COLORS.fg, fontFamily: FONTS.mono, letterSpacing: -1, marginBottom: 4},
  statSub: {fontSize: FONTS.size.xs, color: COLORS.fgDim, fontFamily: FONTS.mono, letterSpacing: 0.4},
  barChart: {flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: SPACING.lg, height: BAR_MAX_HEIGHT + 20},
  barCol: {flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6},
  bar: {width: '100%', backgroundColor: COLORS.fgDim, borderRadius: 2},
  barOver: {backgroundColor: COLORS.fg},
  barLabel: {fontSize: 9, color: COLORS.fgDim, fontFamily: FONTS.mono},
  usageRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: SPACING.md},
  usageApp: {fontSize: FONTS.size.sm, color: COLORS.fg, fontFamily: FONTS.mono, width: 72},
  usageBarTrack: {flex: 1, height: 2, backgroundColor: COLORS.bgTertiary, borderRadius: 1, overflow: 'hidden'},
  usageBarFill: {height: '100%', backgroundColor: COLORS.fg, borderRadius: 1},
  usageTime: {fontSize: FONTS.size.xs, color: COLORS.fgMuted, fontFamily: FONTS.mono, width: 36, textAlign: 'right'},
  tipBlock: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  tipLabel: {fontSize: 9, color: COLORS.fgDim, fontFamily: FONTS.mono, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: SPACING.sm},
  tipText: {fontSize: FONTS.size.sm, color: COLORS.fgMuted, fontFamily: FONTS.mono, lineHeight: 20},
});
