import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar} from 'react-native';
import HomeScreen from './screens/HomeScreen';
import StatsScreen from './screens/StatsScreen';
import BlockAppsScreen from './screens/BlockAppsScreen';
import SettingsScreen from './screens/SettingsScreen';
import BlockedWallScreen from './screens/BlockedWallScreen';

export type RootStackParamList = {
  Home: undefined;
  Stats: undefined;
  BlockApps: undefined;
  Settings: undefined;
  BlockedWall: {appName: string; appPackage: string};
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: {backgroundColor: '#0a0a0a'},
          animationEnabled: true,
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
        <Stack.Screen name="BlockApps" component={BlockAppsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="BlockedWall" component={BlockedWallScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
