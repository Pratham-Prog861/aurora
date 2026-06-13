import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, fonts, spacing, radius, shadows } from '../../theme';
import { Card, SectionHeader, ProgressBar, Badge } from '../../components';
import { useStore } from '../../store';

const { width } = Dimensions.get('window');

function getGreeting(name) {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${g}${name ? ', ' + name.split(' ')[0] : ''} 👋`;
}

function getDayInsight(state) {
  const { today, history } = state;
  const avgSleep = history.sleep.reduce((a, b) => a + b, 0) / history.sleep.length;
  const hydPct = (today.hydration.intake / today.hydration.goal) * 100;
  const completedHabits = state.habits.filter(h => h.completedToday).length;

  if (!today.sleep.logged) return "Log last night's sleep to unlock your personalized daily insight.";
  if (today.sleep.duration < avgSleep - 0.5)
    return `You slept ${(avgSleep - today.sleep.duration).toFixed(1)}h less than your weekly average. Prioritize hydration and short breaks today. 💧`;
  if (hydPct < 40 && new Date().getHours() > 14)
    return `You're only ${Math.round(hydPct)}% through your water goal. Time to hydrate! 💦`;
  if (completedHabits === state.habits.length)
    return `🎉 All habits done! You're on a roll. Keep this momentum going tomorrow.`;
  return `You're doing well today. ${completedHabits}/${state.habits.length} habits done — stay consistent! ✨`;
}

export default function HomeScreen({ navigation }) {
  const { state } = useStore();
  const { profile, today, habits, streaks } = state;
  const completedHabits = habits.filter(h => h.completedToday).length;
  const hydPct = Math.round((today.hydration.intake / today.hydration.goal) * 100);
  const avgSleep = (state.history.sleep.reduce((a, b) => a + b, 0) / state.history.sleep.length).toFixed(1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={colors.gradientNight} style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting(profile.name)}</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
            <LinearGradient colors={colors.gradientPrimary} style={styles.avatarGrad}>
              <Text style={styles.avatarText}>{(profile.name || 'A')[0].toUpperCase()}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Daily Insight (Glassmorphism) */}
        <BlurView
          tint="dark"
          intensity={40}
          style={styles.insightCard}
        >
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>✦ Daily Insight</Text>
            <Badge label="Personalized" color={colors.primaryLight} bg="rgba(139, 92, 246, 0.2)" />
          </View>
          <Text style={styles.insightText}>{getDayInsight(state)}</Text>
        </BlurView>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Streak', val: streaks.overall, unit: 'days', icon: '🔥', color: '#FBBF24', glow: shadows.goldGlow },
            { label: 'Habits', val: `${completedHabits}/${habits.length}`, unit: 'done', icon: '✅', color: colors.accent, glow: shadows.mintGlow },
            { label: 'Hydration', val: hydPct, unit: '%', icon: '💧', color: colors.accentBlue, glow: shadows.blueGlow },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, s.glow]}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statVal, { color: s.color }]}>{s.val}<Text style={styles.statUnit}>{s.unit}</Text></Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Hydration */}
        <SectionHeader title="Hydration" action="Track →" onAction={() => navigation.navigate('Hydration')} />
        <Card glowColor={colors.accentBlue} onPress={() => navigation.navigate('Hydration')}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardBig}>{(today.hydration.intake / 1000).toFixed(1)}<Text style={styles.cardUnit}>L</Text></Text>
              <Text style={styles.cardSub}>of {(today.hydration.goal / 1000).toFixed(1)}L goal</Text>
            </View>
            {/* Mini bottle */}
            <WaterBottle pct={hydPct} />
          </View>
          <ProgressBar value={today.hydration.intake} max={today.hydration.goal} color={colors.gradientBlue} height={8} style={{ marginTop: 12 }} />
          <Text style={styles.cardHint}>{today.hydration.goal - today.hydration.intake > 0 ? `${today.hydration.goal - today.hydration.intake}ml remaining` : '🎉 Goal reached!'}</Text>
        </Card>

        {/* Sleep */}
        <SectionHeader title="Sleep" action="Log →" onAction={() => navigation.navigate('Sleep')} />
        <Card glowColor={colors.primaryLight} onPress={() => navigation.navigate('Sleep')}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardBig}>{today.sleep.logged ? today.sleep.duration : '—'}<Text style={styles.cardUnit}>h</Text></Text>
              <Text style={styles.cardSub}>Weekly avg: {avgSleep}h</Text>
            </View>
            <MiniSleepChart data={state.history.sleep} />
          </View>
          {!today.sleep.logged && (
            <View style={styles.logPrompt}>
              <Text style={styles.logPromptText}>Tap to log last night's sleep</Text>
            </View>
          )}
        </Card>

        {/* Habits */}
        <SectionHeader title="Habits" action="All →" onAction={() => navigation.navigate('Habits')} />
        <Card glowColor={colors.accent} onPress={() => navigation.navigate('Habits')}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardBig}>{completedHabits}<Text style={styles.cardUnit}>/{habits.length}</Text></Text>
              <Text style={styles.cardSub}>completed today</Text>
            </View>
            <View style={styles.habitDots}>
              {habits.slice(0, 4).map(h => (
                <View
                  key={h.id}
                  style={[
                    styles.habitDot,
                    {
                      backgroundColor: h.completedToday ? h.color + '20' : 'rgba(255,255,255,0.02)',
                      borderColor: h.completedToday ? h.color : 'rgba(255,255,255,0.08)',
                      borderWidth: 1.5,
                      borderCurve: 'continuous',
                    }
                  ]}
                >
                  <Text style={{ fontSize: 14 }}>{h.icon}</Text>
                </View>
              ))}
            </View>
          </View>
          <ProgressBar value={completedHabits} max={habits.length} color={colors.gradientMint} height={8} style={{ marginTop: 12 }} />
        </Card>

        {/* Nutrition */}
        <SectionHeader title="Nutrition" action="Log →" onAction={() => navigation.navigate('Nutrition')} />
        <Card glowColor={colors.accentGold} onPress={() => navigation.navigate('Nutrition')}>
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardBig}>{state.today.meals.length}<Text style={styles.cardUnit}> meals</Text></Text>
              <Text style={styles.cardSub}>logged today</Text>
            </View>
            <View style={styles.mealBadgesRow}>
              {['🍳', '🥗', '🍛', '🍎'].map((e, i) => (
                <View
                  key={i}
                  style={[
                    styles.mealBadge,
                    {
                      backgroundColor: i < state.today.meals.length ? colors.accentGold + '20' : 'rgba(255,255,255,0.02)',
                      borderColor: i < state.today.meals.length ? colors.accentGold : 'rgba(255,255,255,0.08)',
                      borderWidth: 1.5,
                      borderCurve: 'continuous',
                    }
                  ]}
                >
                  <Text style={{ fontSize: 16, opacity: i < state.today.meals.length ? 1 : 0.35 }}>{e}</Text>
                </View>
              ))}
            </View>
          </View>
          {state.today.meals.length === 0 && (
            <View style={styles.logPrompt}>
              <Text style={styles.logPromptText}>No meals logged yet — tap to add</Text>
            </View>
          )}
        </Card>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// Mini water bottle visual
function WaterBottle({ pct }) {
  const fill = Math.min(pct, 100);
  return (
    <View style={styles.bottle}>
      <View style={styles.bottleCap} />
      <View style={styles.bottleBody}>
        <View style={[styles.bottleFill, { height: `${fill}%`, backgroundColor: colors.accentBlue + 'CC' }]} />
      </View>
      <Text style={styles.bottlePct}>{fill}%</Text>
    </View>
  );
}

// Mini 7-day sleep bars
function MiniSleepChart({ data }) {
  const max = 10;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <View style={styles.miniChart}>
      {data.slice(-7).map((v, i) => (
        <View key={i} style={styles.miniBarWrap}>
          <View style={[styles.miniBar, { height: `${(v / max) * 100}%`, backgroundColor: i === 6 ? colors.primaryLight : colors.border }]} />
          <Text style={styles.miniBarLabel}>{days[i]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 100 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: 8,
  },
  greeting: { fontSize: fonts.sizes.xl, fontWeight: '800', color: colors.text },
  date: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: 2 },
  avatar: { ...shadows.card },
  avatarGrad: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: fonts.sizes.lg, fontWeight: '800' },

  insightCard: {
    marginHorizontal: spacing.lg, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)',
    overflow: 'hidden', borderCurve: 'continuous',
  },
  insightRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  insightLabel: { color: colors.primaryLight, fontSize: fonts.sizes.xs, fontWeight: '700', letterSpacing: 0.5 },
  insightText: { color: colors.text, fontSize: fonts.sizes.sm, lineHeight: 22 },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  statCard: {
    flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: 12, alignItems: 'center', gap: 3,
  },
  statIcon: { fontSize: 20 },
  statVal: { fontSize: fonts.sizes.lg, fontWeight: '800' },
  statUnit: { fontSize: fonts.sizes.xs, fontWeight: '400', color: colors.textMuted },
  statLabel: { fontSize: fonts.sizes.xs, color: colors.textMuted },

  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBig: { fontSize: fonts.sizes.xxxl, fontWeight: '800', color: colors.text },
  cardUnit: { fontSize: fonts.sizes.md, fontWeight: '400', color: colors.textMuted },
  cardSub: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginTop: 2 },
  cardHint: { fontSize: fonts.sizes.xs, color: colors.textMuted, marginTop: 8 },

  logPrompt: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radius.sm,
    padding: 10, marginTop: 10, alignItems: 'center',
  },
  logPromptText: { color: colors.textMuted, fontSize: fonts.sizes.sm },

  // Bottle
  bottle: { alignItems: 'center', gap: 4 },
  bottleCap: { width: 16, height: 6, backgroundColor: colors.border, borderRadius: 3 },
  bottleBody: {
    width: 32, height: 60, backgroundColor: 'rgba(96,165,250,0.1)',
    borderRadius: 8, borderWidth: 1, borderColor: colors.accentBlue + '60',
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  bottleFill: { width: '100%', borderRadius: 7 },
  bottlePct: { fontSize: fonts.sizes.xs, color: colors.accentBlue, fontWeight: '700' },

  // Mini chart
  miniChart: { flexDirection: 'row', alignItems: 'flex-end', height: 56, gap: 4 },
  miniBarWrap: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 3 },
  miniBar: { width: '100%', borderRadius: 3, minHeight: 4 },
  miniBarLabel: { fontSize: 8, color: colors.textMuted },

  // Habit dots
  habitDots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: 80 },
  habitDot: {
    width: 36, height: 36, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  mealBadgesRow: { flexDirection: 'row', gap: 6 },
  mealBadge: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
});
