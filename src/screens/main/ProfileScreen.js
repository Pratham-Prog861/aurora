import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, fonts, spacing, radius, shadows } from '../../theme';
import { Card, SectionHeader, ProgressBar } from '../../components';
import { useStore } from '../../store';

export default function ProfileScreen({ navigation }) {
  const { state, dispatch } = useStore();
  const { profile, streaks, history, habits, today } = state;

  const avgSleep = (history.sleep.reduce((a, b) => a + b, 0) / history.sleep.length).toFixed(1);
  const habitCompletion = Math.round((habits.filter(h => h.completedToday).length / Math.max(habits.length, 1)) * 100);
  const hydPct = Math.round((today.hydration.intake / today.hydration.goal) * 100);

  const healthScore = Math.round((
    Math.min(hydPct, 100) * 0.25 +
    Math.min((parseFloat(avgSleep) / 8) * 100, 100) * 0.35 +
    habitCompletion * 0.4
  ));

  function logout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch({ type: 'LOGOUT' }) },
    ]);
  }

  const settingsSections = [
    {
      title: 'Health Profile',
      items: [
        { icon: '👤', label: 'Personal Information', sub: `${profile.name} · ${profile.age || '—'} years` },
        { icon: '🎯', label: 'Health Goals', sub: `${profile.goals?.length || 0} goals selected` },
        { icon: '📏', label: 'Body Metrics', sub: `${profile.height || '—'}cm · ${profile.weight || '—'}kg` },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: '🔔', label: 'Notifications', sub: 'Reminders & insights' },
        { icon: '⏰', label: 'Sleep Schedule', sub: `${profile.wakeTime} wake · ${profile.bedTime} bed` },
        { icon: '📐', label: 'Measurement Units', sub: 'Metric (kg, cm, ml)' },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        { icon: '🔗', label: 'Connected Devices', sub: 'Apple Health, Fitbit' },
        { icon: '📊', label: 'Export Health Data', sub: 'Download your data' },
        { icon: '🔒', label: 'Privacy Settings', sub: 'Manage your data' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: '💬', label: 'Feedback', sub: 'Help us improve Aurora' },
        { icon: 'ℹ️', label: 'About Aurora', sub: 'Version 1.0.0' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile hero */}
        <LinearGradient colors={['rgba(139,92,246,0.35)', 'rgba(192,132,252,0.08)', colors.bg]} style={styles.hero}>
          <View style={styles.avatarWrap}>
            <LinearGradient colors={colors.gradientPrimary} style={styles.avatar}>
              <Text style={styles.avatarText}>{(profile.name || 'A')[0].toUpperCase()}</Text>
            </LinearGradient>
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.name}>{profile.name || 'Aurora User'}</Text>
          <Text style={styles.email}>{state.user?.email || 'user@aurora.app'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>✦ Premium</Text></View>
            <View style={[styles.badge, { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: colors.accent }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>🔥 {streaks.overall} day streak</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Habits Streak', val: streaks.habits, unit: 'days', icon: '✅', color: colors.accent, glow: shadows.mintGlow },
            { label: 'Sleep Streak', val: streaks.sleep, unit: 'days', icon: '🌙', color: colors.primaryLight, glow: shadows.glow },
            { label: 'Avg Sleep', val: avgSleep, unit: 'hrs', icon: '⭐', color: colors.accentGold, glow: shadows.goldGlow },
            { label: 'Hydration', val: hydPct, unit: '%', icon: '💧', color: colors.accentBlue, glow: shadows.blueGlow },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, s.glow]}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statVal, { color: s.color }]}>{s.val}<Text style={styles.statUnit}>{s.unit}</Text></Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Health Score */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <Card glowColor={colors.primary}>
            <View style={styles.scoreRow}>
              <View>
                <Text style={styles.scoreTitle}>Overall Health Score</Text>
                <Text style={styles.scoreSub}>Based on last 7 days</Text>
              </View>
              <View style={styles.scoreBig}>
                <Text style={[styles.scoreNum, { color: healthScore >= 70 ? colors.accent : healthScore >= 40 ? colors.accentGold : colors.error }]}>
                  {healthScore}
                </Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
            </View>
            <View style={{ gap: 10, marginTop: 14 }}>
              {[
                { label: 'Hydration', val: Math.min(hydPct, 100), color: colors.accentBlue },
                { label: 'Sleep Quality', val: Math.min(Math.round((parseFloat(avgSleep) / 8) * 100), 100), color: colors.primaryLight },
                { label: 'Habit Consistency', val: habitCompletion, color: colors.accent },
              ].map((m, i) => (
                <View key={i} style={styles.metricRow}>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <ProgressBar value={m.val} max={100} color={[m.color, m.color + '90']} height={6} style={{ flex: 1 }} />
                  <Text style={[styles.metricVal, { color: m.color }]}>{m.val}%</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Achievements */}
          <SectionHeader title="Achievements" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 4 }}>
              {[
                { icon: '🔥', label: `${streaks.overall} Day Streak`, unlocked: streaks.overall >= 1, color: colors.accentGold },
                { icon: '💧', label: 'Hydration Hero', unlocked: hydPct >= 80, color: colors.accentBlue },
                { icon: '🌙', label: 'Sleep Champion', unlocked: parseFloat(avgSleep) >= 7, color: colors.primaryLight },
                { icon: '✅', label: 'Habit Master', unlocked: habits.some(h => h.streak >= 7), color: colors.accent },
                { icon: '⭐', label: 'First Week', unlocked: streaks.overall >= 7, color: colors.accentPink },
              ].map((a, i) => (
                <BlurView
                  key={i}
                  tint="dark"
                  intensity={35}
                  style={[
                    styles.achievement,
                    !a.unlocked && styles.achievementLocked,
                    {
                      borderColor: a.unlocked ? a.color + '30' : 'rgba(255,255,255,0.06)',
                      borderWidth: 1.5,
                      overflow: 'hidden',
                      borderCurve: 'continuous',
                    }
                  ]}
                >
                  <View style={[
                    styles.achievementIconBg,
                    { backgroundColor: a.unlocked ? a.color + '15' : 'rgba(255,255,255,0.02)' }
                  ]}>
                    <Text style={{ fontSize: 26, opacity: a.unlocked ? 1 : 0.25 }}>{a.icon}</Text>
                  </View>
                  <Text style={[styles.achievementLabel, !a.unlocked && { color: colors.textMuted }]}>{a.label}</Text>
                  {!a.unlocked && <Text style={styles.achievementLock}>🔒</Text>}
                </BlurView>
              ))}
            </View>
          </ScrollView>

          {/* Settings sections */}
          {settingsSections.map((section, si) => (
            <View key={si}>
              <SectionHeader title={section.title} />
              <View style={styles.settingsCard}>
                {section.items.map((item, ii) => (
                  <TouchableOpacity key={ii} style={[styles.settingRow, ii < section.items.length - 1 && styles.settingBorder]}>
                    <View style={styles.settingIcon}>
                      <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      <Text style={styles.settingSub}>{item.sub}</Text>
                    </View>
                    <Text style={styles.settingArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Sign out */}
          <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  hero: { alignItems: 'center', paddingTop: 60, paddingBottom: 24, paddingHorizontal: spacing.lg },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center', ...shadows.glow },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '800' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.bg },
  name: { fontSize: fonts.sizes.xxl, fontWeight: '800', color: colors.text },
  email: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: 3 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  badge: { backgroundColor: 'rgba(124,58,237,0.2)', borderWidth: 1, borderColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { color: colors.primaryLight, fontSize: fonts.sizes.xs, fontWeight: '700' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  statCard: { width: '47%', backgroundColor: colors.bgCard, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: 'center', gap: 4 },
  statIcon: { fontSize: 22 },
  statVal: { fontSize: fonts.sizes.xl, fontWeight: '800' },
  statUnit: { fontSize: fonts.sizes.xs, fontWeight: '400', color: colors.textMuted },
  statLabel: { fontSize: fonts.sizes.xs, color: colors.textMuted, textAlign: 'center' },

  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreTitle: { color: colors.text, fontSize: fonts.sizes.md, fontWeight: '700' },
  scoreSub: { color: colors.textMuted, fontSize: fonts.sizes.xs, marginTop: 2 },
  scoreBig: { flexDirection: 'row', alignItems: 'flex-end' },
  scoreNum: { fontSize: 48, fontWeight: '800', lineHeight: 52 },
  scoreMax: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginBottom: 8 },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metricLabel: { color: colors.textMuted, fontSize: fonts.sizes.xs, width: 90 },
  metricVal: { fontSize: fonts.sizes.xs, fontWeight: '700', width: 32, textAlign: 'right' },

  achievement: { width: 100, backgroundColor: 'rgba(22, 17, 36, 0.6)', borderRadius: radius.md, padding: 12, alignItems: 'center', gap: 6 },
  achievementIconBg: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  achievementLocked: { opacity: 0.5 },
  achievementLabel: { color: colors.textSecondary, fontSize: 9, fontWeight: '700', textAlign: 'center', lineHeight: 13 },
  achievementLock: { fontSize: 10, position: 'absolute', top: 6, right: 6 },

  settingsCard: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden', marginBottom: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  settingIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { color: colors.text, fontSize: fonts.sizes.sm, fontWeight: '600' },
  settingSub: { color: colors.textMuted, fontSize: fonts.sizes.xs, marginTop: 2 },
  settingArrow: { color: colors.textMuted, fontSize: 20 },

  signOutBtn: { marginTop: 16, marginBottom: 8, padding: 16, borderRadius: radius.md, backgroundColor: 'rgba(248,113,113,0.12)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)', alignItems: 'center' },
  signOutText: { color: colors.error, fontSize: fonts.sizes.md, fontWeight: '700' },
});
