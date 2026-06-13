import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, fonts, spacing, radius, shadows } from '../../theme';
import { Card, SectionHeader, AuroraHeader, ProgressBar, Badge } from '../../components';
import { useStore } from '../../store';

const QUICK_AMOUNTS = [
  { label: '1 Glass', ml: 250, icon: '🥛' },
  { label: 'Water Bottle', ml: 500, icon: '💧' },
  { label: 'Big Bottle', ml: 750, icon: '🍶' },
  { label: '1 Litre', ml: 1000, icon: '🫙' },
];

export default function HydrationScreen({ navigation }) {
  const { state, dispatch } = useStore();
  const { today } = state;
  const [custom, setCustom] = useState('');
  const intake = today.hydration.intake;
  const goal = today.hydration.goal;
  const pct = Math.min(Math.round((intake / goal) * 100), 100);

  function add(ml) {
    dispatch({ type: 'ADD_HYDRATION', payload: ml });
  }

  function addCustom() {
    const ml = parseInt(custom, 10);
    if (ml > 0 && ml < 3000) { add(ml); setCustom(''); }
  }

  const history = state.history.hydration;
  const maxH = Math.max(...history);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AuroraHeader title="Hydration" navigation={navigation} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100 }}>

        {/* Big bottle visual */}
        <Card gradient={['rgba(59,130,246,0.12)', 'rgba(37,99,235,0.03)']} glowColor={colors.accentBlue}>
          <View style={styles.bottleSection}>
            <View style={styles.bottleMain}>
              {/* Bottle SVG-like */}
              <View style={styles.bigBottleCap} />
              <View style={styles.bigBottleBody}>
                <LinearGradient
                  colors={['#2563EB', '#60A5FA']}
                  style={[styles.bigBottleFill, { height: `${pct}%` }]}
                />
                {/* Bubbles */}
                {pct > 10 && <View style={[styles.bubble1, { bottom: `${pct * 0.65}%` }]} />}
                {pct > 30 && <View style={[styles.bubble2, { bottom: `${pct * 0.45}%` }]} />}
                {pct > 50 && <View style={[styles.bubble3, { bottom: `${pct * 0.25}%`, left: 24 }]} />}
                <View style={styles.bottlePctLabel}>
                  <Text style={styles.bottlePctText}>{pct}%</Text>
                </View>
              </View>
              <View style={styles.bottleBase} />
            </View>

            <View style={styles.bottleStats}>
              <View style={styles.bigStatRow}>
                <Text style={styles.bigStat}>{(intake / 1000).toFixed(2)}</Text>
                <Text style={styles.bigStatUnit}>L</Text>
              </View>
              <Text style={styles.bigStatSub}>of {(goal / 1000).toFixed(1)}L daily goal</Text>

              <View style={{ marginTop: 20, gap: 10 }}>
                <StatRow label="Remaining" val={`${Math.max(0, goal - intake)}ml`} color={colors.accentBlue} />
                <StatRow label="Goal" val={`${(goal / 1000).toFixed(1)}L`} color={colors.primaryLight} />
                <StatRow label="Today's best" val={`${intake >= goal ? '🎉 Goal hit!' : 'Keep going!'}`} color={colors.accent} />
              </View>

              {intake >= goal && <Badge label="🎉 Goal Reached!" color={colors.accentBlue} bg="rgba(96,165,250,0.15)" style={{ marginTop: 10 }} />}
            </View>
          </View>
        </Card>

        {/* Quick add */}
        <SectionHeader title="Quick Add" />
        <View style={styles.quickGrid}>
          {QUICK_AMOUNTS.map((q, i) => (
            <TouchableOpacity key={i} style={[styles.quickCard, shadows.blueGlow]} onPress={() => add(q.ml)} activeOpacity={0.75}>
              <BlurView tint="dark" intensity={30} style={styles.quickCardInner}>
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: colors.accentBlue }} />
                <Text style={styles.quickIcon}>{q.icon}</Text>
                <Text style={styles.quickLabel}>{q.label}</Text>
                <Text style={styles.quickMl}>{q.ml}ml</Text>
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom */}
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            placeholder="Custom amount (ml)"
            placeholderTextColor={colors.textMuted}
            value={custom}
            onChangeText={setCustom}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.customBtn} onPress={addCustom}>
            <LinearGradient colors={colors.gradientBlue} style={styles.customBtnGrad}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: fonts.sizes.md }}>Add</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Weekly history */}
        <SectionHeader title="This Week" />
        <Card glowColor={colors.accentBlue}>
          <View style={styles.weekChart}>
            {history.slice(-7).map((v, i) => {
              const h = (v / (maxH || 1)) * 100;
              const isGoal = v >= goal;
              return (
                <View key={i} style={styles.weekBar}>
                  <Text style={styles.weekVal}>{(v / 1000).toFixed(1)}</Text>
                  <View style={styles.weekBarBg}>
                    <LinearGradient
                      colors={isGoal ? colors.gradientMint : colors.gradientBlue}
                      style={[styles.weekBarFill, { height: `${h}%` }]}
                    />
                  </View>
                  <Text style={styles.weekDay}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.accentBlue }]} />
              <Text style={styles.legendText}>Below goal</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
              <Text style={styles.legendText}>Goal reached</Text>
            </View>
          </View>
        </Card>

        {/* Insights */}
        <SectionHeader title="Insights" />
        {[
          { icon: '💡', text: 'You tend to fall behind on hydration after 3 PM. Set a reminder?', borderColor: 'rgba(245,158,11,0.2)' },
          { icon: '📈', text: 'Your hydration consistency improved by 18% this week. Keep it up!', borderColor: 'rgba(16, 185, 129, 0.2)' },
          { icon: '🌡️', text: 'Staying well-hydrated improves sleep quality and mental clarity throughout the day.', borderColor: 'rgba(59, 130, 246, 0.2)' },
        ].map((ins, i) => (
          <BlurView key={i} tint="dark" intensity={30} style={[styles.insightRow, { borderColor: ins.borderColor, borderWidth: 1 }]}>
            <Text style={styles.insightIcon}>{ins.icon}</Text>
            <Text style={styles.insightText}>{ins.text}</Text>
          </BlurView>
        ))}
      </ScrollView>
    </View>
  );
}

function StatRow({ label, val, color }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.xs }}>{label}</Text>
      <Text style={{ color: color, fontSize: fonts.sizes.xs, fontWeight: '700' }}>{val}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  bottleSection: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  bottleMain: { alignItems: 'center', gap: 4 },
  bigBottleCap: { width: 28, height: 10, backgroundColor: colors.accentBlue, borderRadius: 4 },
  bigBottleBody: {
    width: 65, height: 145,
    backgroundColor: 'rgba(96,165,250,0.04)',
    borderRadius: 16,
    borderWidth: 2.5, borderColor: 'rgba(59, 130, 246, 0.35)',
    justifyContent: 'flex-end', overflow: 'hidden', position: 'relative',
    borderCurve: 'continuous',
  },
  bigBottleFill: { width: '100%', borderRadius: 13 },
  bubble1: { position: 'absolute', left: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)' },
  bubble2: { position: 'absolute', right: 12, width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(255,255,255,0.2)' },
  bubble3: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)' },
  bottlePctLabel: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  bottlePctText: { color: '#fff', fontSize: fonts.sizes.sm, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 4 },
  bigBottleBase: { width: 70, height: 8, backgroundColor: colors.accentBlue + '40', borderRadius: 4 },
  bottleBase: { width: 68, height: 8, backgroundColor: colors.accentBlue + '30', borderRadius: 4 },

  bottleStats: { flex: 1 },
  bigStatRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  bigStat: { fontSize: 44, fontWeight: '800', color: colors.text, lineHeight: 48 },
  bigStatUnit: { fontSize: fonts.sizes.xl, color: colors.textMuted, marginBottom: 6 },
  bigStatSub: { color: colors.textMuted, fontSize: fonts.sizes.sm },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: spacing.md, justifyContent: 'space-between' },
  quickCard: { width: '48%', borderRadius: radius.md, overflow: 'hidden', borderCurve: 'continuous' },
  quickCardInner: {
    padding: 16, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.15)', borderRadius: radius.md,
    overflow: 'hidden', borderCurve: 'continuous',
  },
  quickIcon: { fontSize: 28 },
  quickLabel: { color: colors.text, fontSize: fonts.sizes.sm, fontWeight: '600' },
  quickMl: { color: colors.accentBlue, fontSize: fonts.sizes.xs, fontWeight: '700' },

  customRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.md },
  customInput: {
    flex: 1, backgroundColor: colors.bgInput,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 12,
    color: colors.text, fontSize: fonts.sizes.md,
  },
  customBtn: { borderRadius: radius.md, overflow: 'hidden' },
  customBtnGrad: { paddingHorizontal: 24, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },

  weekChart: { flexDirection: 'row', height: 100, gap: 8, alignItems: 'flex-end' },
  weekBar: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 4 },
  weekVal: { fontSize: 8, color: colors.textMuted },
  weekBarBg: { width: '100%', flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  weekBarFill: { width: '100%', borderRadius: 4 },
  weekDay: { fontSize: 10, color: colors.textMuted },
  legendRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.textMuted, fontSize: fonts.sizes.xs },

  insightRow: {
    flexDirection: 'row', gap: 12, padding: 14,
    borderRadius: radius.md, marginBottom: 8, alignItems: 'flex-start',
    overflow: 'hidden', borderCurve: 'continuous',
  },
  insightIcon: { fontSize: 20 },
  insightText: { flex: 1, color: colors.textSecondary, fontSize: fonts.sizes.sm, lineHeight: 20 },
});
