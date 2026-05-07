import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParamList} from '../App';
import {COLORS, FONTS, SPACING} from '../utils/theme';

type Nav = StackNavigationProp<RootStackParamList, 'BlockedWall'>;
type Route = RouteProp<RootStackParamList, 'BlockedWall'>;

const MESSAGES = [
  'You blocked this app to reduce mindless scrolling.\n\nPick up a book instead.',
  "This app is designed to steal your attention.\n\nYou chose to take it back.",
  'Every minute you don't open this app\nis a minute you own.',
  'Your past self blocked this for a reason.\nTrust them.',
  'Nothing important is happening there right now.\nYou know this.',
];

function getMessage(packageName: string): string {
  let hash = 0;
  for (let i = 0; i < packageName.length; i++) {
    hash = (hash << 5) - hash + packageName.charCodeAt(i);
    hash |= 0;
  }
  return MESSAGES[Math.abs(hash) % MESSAGES.length];
}

export default function BlockedWallScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {appName, appPackage} = route.params;

  const message = getMessage(appPackage);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.topSection}>
          <Text style={styles.appName}>{appName.toLowerCase()}</Text>
          <View style={styles.divider} />
          <Text style={styles.blockedLabel}>app blocked</Text>
        </View>

        <View style={styles.messageSection}>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.backBtnText}>← go back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('BlockApps')}
            activeOpacity={0.7}>
            <Text style={styles.settingsBtnText}>manage blocked apps</Text>
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
    paddingHorizontal: SPACING.xxl,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: SPACING.xxl,
  },
  topSection: {
    alignItems: 'flex-start',
  },
  appName: {
    fontSize: 32,
    color: COLORS.fgMuted,
    fontFamily: FONTS.mono,
    fontWeight: '300',
    letterSpacing: -1,
    textDecorationLine: 'line-through',
    marginBottom: SPACING.xl,
  },
  divider: {
    width: 32,
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  blockedLabel: {
    fontSize: FONTS.size.xs,
    color: COLORS.fgDim,
    fontFamily: FONTS.mono,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  messageSection: {
    flex: 1,
    justifyContent: 'center',
  },
  messageText: {
    fontSize: FONTS.size.lg,
    color: COLORS.fgMuted,
    fontFamily: FONTS.mono,
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  bottomSection: {
    gap: SPACING.md,
  },
  backBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: FONTS.size.sm,
    color: COLORS.fgMuted,
    fontFamily: FONTS.mono,
    letterSpacing: 1,
  },
  settingsBtn: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  settingsBtnText: {
    fontSize: FONTS.size.xs,
    color: COLORS.fgDim,
    fontFamily: FONTS.mono,
    letterSpacing: 0.8,
  },
});
