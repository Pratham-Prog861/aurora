import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radius } from '../theme';
import { useStore } from '../store';

// Screens
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import UserSetupScreen from '../screens/onboarding/UserSetupScreen';
import HomeScreen from '../screens/main/HomeScreen';
import AIScreen from '../screens/main/AIScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import HydrationScreen from '../screens/modules/HydrationScreen';
import SleepScreen from '../screens/modules/SleepScreen';
import HabitsScreen from '../screens/modules/HabitsScreen';
import NutritionScreen from '../screens/modules/NutritionScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: { active: '🏠', inactive: '🏠', label: 'Home' },
  Aurora: { active: '✦', inactive: '✦', label: 'Aurora' },
  Hydration: { active: '💧', inactive: '💧', label: 'Water' },
  Sleep: { active: '🌙', inactive: '🌙', label: 'Sleep' },
  Profile: { active: '👤', inactive: '👤', label: 'Me' },
};

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarWrap}>
      <LinearGradient colors={['rgba(10,9,20,0.97)', 'rgba(10,9,20,1)']} style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const tab = TAB_ICONS[route.name];
          const isAurora = route.name === 'Aurora';

          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.tabItem, isAurora && styles.tabItemCenter]}
              onPress={() => {
                if (!isFocused) navigation.navigate(route.name);
              }}
              activeOpacity={0.7}
            >
              {isAurora ? (
                <LinearGradient colors={colors.gradientPrimary} style={styles.auroraBtn}>
                  <Text style={styles.auroraBtnIcon}>✦</Text>
                </LinearGradient>
              ) : (
                <>
                  <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>{tab?.active}</Text>
                  <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{tab?.label}</Text>
                  {isFocused && <View style={styles.tabDot} />}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Hydration" component={HydrationScreen} />
      <Tab.Screen name="Aurora" component={AIScreen} />
      <Tab.Screen name="Sleep" component={SleepScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="Habits" component={HabitsScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Nutrition" component={NutritionScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { state } = useStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
        {!state.isAuthenticated ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="UserSetup" component={UserSetupScreen} />
          </>
        ) : !state.hasOnboarded ? (
          <Stack.Screen name="UserSetup" component={UserSetupScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabBar: {
    flexDirection: 'row',
    paddingBottom: 24,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
    position: 'relative',
  },
  tabItemCenter: {
    justifyContent: 'flex-start',
    paddingTop: 0,
    marginTop: -18,
  },
  tabIcon: { fontSize: 22, opacity: 0.4 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '500' },
  tabLabelActive: { color: colors.primaryLight, fontWeight: '700' },
  tabDot: {
    position: 'absolute',
    bottom: -4,
    width: 4, height: 4,
    borderRadius: 2,
    backgroundColor: colors.primaryLight,
  },
  auroraBtn: {
    width: 54, height: 54, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  auroraBtnIcon: { color: '#fff', fontSize: 22, fontWeight: '800' },
});
