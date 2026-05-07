import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParamList} from '../App';
import {COLORS, FONTS, SPACING} from '../utils/theme';
import {getSettings, saveSettings, AppSettings, DEFAULT_SETTINGS} from '../utils/storage';

type Nav = StackNavigationProp<RootStackParamList, 'Settings'>;

interface ToggleRowProps {
  label: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({label, subtitle, value, onChange, disabled}: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, disabled && styles.rowLabelDisabled]}>{label}</Text>
        {subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{false: COLORS.bgTertiary, true: COLORS.fgDim}}
        thumbColor={value ? COLORS.fg : COLORS.fgDim}
        ios_backgroundColor={COLORS.bgTertiary}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useFocusEffect(
    useCallback(() => {
      getSettings().then(setSettings);
    }, []),
  );

  const update = async (key: keyof AppSettings, value: any) => {
    const next = {...settings, [key]: value};
    setSettings(next);
    await saveSettings(next);
  };

  const handleFocusMode = async (v: boolean) => {
    if (v) {
      Alert.alert(
        'Enable Focus Mode?',
        'This will block all social and entertainment apps until you turn it off.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Enable', onPress: () => update('focusMode', true)},
        ],
      );
    } else {
      update('focusMode', false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>settings</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.section}>display</Text>

        <ToggleRow
          label="monochrome mode"
          subtitle="removes all color from apps"
          value={settings.monochromeMode}
          onChange={v => update('monochromeMode', v)}
        />
        <ToggleRow
          label="text-only interface"
          subtitle="no icons, no visuals"
          value={settings.hideIcons}
          onChange={v => update('hideIcons', v)}
        />

        <Text style={styles.section}>focus</Text>

        <ToggleRow
          label="notification filter"
          subtitle="only calls & sms pass through"
          value={settings.notificationFilter}
          onChange={v => update('notificationFilter', v)}
        />
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowLabel}>focus mode</Text>
            <Text style={styles.rowSub}>blocks all non-essential apps</Text>
          </View>
          <Switch
            value={settings.focusMode}
            onValueChange={handleFocusMode}
            trackColor={{false: COLORS.bgTertiary, true: COLORS.fgDim}}
            thumbColor={settings.focusMode ? COLORS.fg : COLORS.fgDim}
            ios_backgroundColor={COLORS.bgTertiary}
          />
        </View>

        <Text style={styles.section}>detox</Text>

        <ToggleRow
          label="bedtime mode"
          subtitle={`starts ${settings.bedtimeStart}, ends ${settings.bedtimeEnd}`}
          value={settings.bedtimeMode}
          onChange={v => update('bedtimeMode', v)}
        />
        <ToggleRow
          label="hide blocked apps"
          subtitle="remove blocked apps from list"
          value={settings.hideBlockedApps}
          onChange={v => update('hideBlockedApps', v)}
        />
        <ToggleRow
          label="uninstall guard"
          subtitle="require confirmation to remove"
          value={settings.uninstallGuard}
          onChange={v => update('uninstallGuard', v)}
        />

        <Text style={styles.section}>about</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>minimal launcher</Text>
          <Text style={styles.rowSub2}>v1.0.0</Text>
        </View>
        <View style={[styles.row, {borderBottomWidth: 0}]}>
          <Text style={styles.rowSub}>
            a distraction-free launcher to help you use your phone less and live more.
          </Text>
        </View>

        <View style={{height: 40}} />
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
  section: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.sm,
    fontSize: 9,
    color: COLORS.fgDim,
    fontFamily: FONTS.mono,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDim,
  },
  rowLeft: {flex: 1, paddingRight: SPACING.md},
  rowLabel: {fontSize: FONTS.size.md, color: COLORS.fg, fontFamily: FONTS.mono},
  rowLabelDisabled: {color: COLORS.fgDim},
  rowSub: {fontSize: FONTS.size.xs, color: COLORS.fgDim, fontFamily: FONTS.mono, marginTop: 2, letterSpacing: 0.3},
  rowSub2: {fontSize: FONTS.size.xs, color: COLORS.fgDim, fontFamily: FONTS.mono},
});
