import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, fonts, spacing, radius, shadows } from '../../theme';
import { Card, SectionHeader, AuroraHeader, ProgressBar, Badge, CircleProgress } from '../../components';
import { useStore } from '../../store';

const SLEEP_TIPS = [
  { icon: '📱', title: 'No screens 30 min before bed', text: 'Blue light suppresses melatonin by up to 50%. Try reading instead.' },
  { icon: '🌡️', title: 'Keep room at 68–70°F', text: 'A cooler environment signals your body to prepare for deep sleep.' },
  { icon: '⏰', title: 'Consistent bedtime matters', text: 'Going to bed within 30 min of the same time improves sleep quality.' },
  { icon: '☕', title: 'Avoid caffeine after 2 PM', text: 'Caffeine has a 5–7 hour half-life and can disrupt your sleep cycle.' },
];

export default function SleepScreen({ navigation }) {
  const { state, dispatch } = useStore();
  const { today, history, profile } = state;
  const [showLog, setShowLog] = useState(false);
  const [bedTime, setBedTime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [duration, setDuration] = useState('');

  const avgSleep = (history.sleep.reduce((a, b) => a + b, 0) / history.sleep.length).toFixed(1);
  const maxSleep = Math.max(...history.sleep);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function logSleep() {
    const d = parseFloat(duration) || calculateDuration(bedTime, wakeTime);
    dispatch({ type: 'LOG_SLEEP', payload: { duration: d, bedTime, wakeTime, logged: true } });
    setShowLog(false);
  }

  function calculateDuration(bed, wake) {
    try {
      const [bh, bm] = bed.split(':').map(Number);
      const [wh, wm] = wake.split(':').map(Number);
      let diff = (wh * 60 + wm) - (bh * 60 + bm);
      if (diff < 0) diff += 24 * 60;
      return parseFloat((diff / 60).toFixed(1));
    } catch { return 7; }
  }

  const sleepScore = today.sleep.logged
    ? Math.min(100, Math.round((today.sleep.duration / 8) * 100))
    : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AuroraHeader
        title="Sleep"
        navigation={navigation}
        rightElement={
          <TouchableOpacity style={styles.logBtn} onPress={() => setShowLog(true)}>
            <Text style={styles.logBtnText}>+ Log</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100 }}>

        {/* Last night */}
        <Card gradient={['rgba(124,58,237,0.2)', 'rgba(96,165,250,0.05)']} glowColor={colors.primaryLight}>
          <View style={styles.sleepHero}>
            <View>
              <Text style={styles.sleepLabel}>Last Night</Text>
              <View style={styles.sleepDurationRow}>
                <Text style={styles.sleepBig}>{today.sleep.logged ? today.sleep.duration : '—'}</Text>
                <Text style={styles.sleepUnit}>hours</Text>
              </View>
              {today.sleep.logged ? (
                <View style={{ gap: 4, marginTop: 8 }}>
                  <Text style={styles.sleepMeta}>🌙 Bedtime: {today.sleep.bedTime || '—'}</Text>
                  <Text style={styles.sleepMeta}>☀️ Wake up: {today.sleep.wakeTime || '—'}</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.logNowBtn} onPress={() => setShowLog(true)}>
                  <Text style={styles.logNowText}>Tap to log sleep →</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Sleep score ring */}
            <View style={styles.scoreWrap}>
              <CircleProgress size={90} pct={sleepScore ?? 0} color={colors.primaryLight}>
                <Text style={styles.scoreVal}>{sleepScore ?? '?'}</Text>
                <Text style={styles.scoreLabel}>score</Text>
              </CircleProgress>
            </View>
          </View>

          {today.sleep.logged && (
            <>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 14 }} />
              {/* Sleep stages estimate */}
              <Text style={styles.stagesTitle}>Estimated Sleep Stages</Text>
              <View style={styles.stagesBar}>
                {[
                  { label: 'Deep', pct: 16, color: colors.primary },
                  { label: 'REM', pct: 22, color: colors.primaryLight },
                  { label: 'Light', pct: 52, color: colors.accentBlue },
                  { label: 'Awake', pct: 10, color: 'rgba(255,255,255,0.06)' },
                ].map((s, i) => (
                  <View
                    key={i}
                    style={[
                      styles.stageSegment,
                      {
                        flex: s.pct,
                        backgroundColor: s.color,
                        borderRadius: 6,
                        borderCurve: 'continuous',
                      }
                    ]}
                  />
                ))}
              </View>
              <View style={styles.stagesLegend}>
                {[
                  { label: 'Deep 16%', color: colors.primary },
                  { label: 'REM 22%', color: colors.primaryLight },
                  { label: 'Light 52%', color: colors.accentBlue },
                  { label: 'Awake 10%', color: 'rgba(255,255,255,0.25)' },
                ].map((s, i) => (
                  <View key={i} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                    <Text style={styles.legendText}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </Card>

        {/* Weekly stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Weekly Avg', val: avgSleep + 'h', icon: '📊', color: colors.primaryLight, glow: shadows.glow },
            { label: 'Best Night', val: maxSleep + 'h', icon: '⭐', color: colors.accentGold, glow: shadows.goldGlow },
            { label: 'Goal', val: '8h', icon: '🎯', color: colors.accent, glow: shadows.mintGlow },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, s.glow]}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Weekly chart */}
        <SectionHeader title="Weekly Pattern" />
        <Card glowColor={colors.primaryLight}>
          <View style={styles.weekChart}>
            {history.sleep.slice(-7).map((v, i) => {
              const h = (v / 10) * 100;
              const isGood = v >= 7;
              return (
                <View key={i} style={styles.chartBar}>
                  <Text style={styles.chartVal}>{v}h</Text>
                  <View style={styles.chartBarBg}>
                    <LinearGradient
                      colors={isGood ? colors.gradientPrimary : colors.gradientPink}
                      style={[styles.chartBarFill, { height: `${h}%` }]}
                    />
                    {/* 7h goal line */}
                    <View style={styles.goalLine} />
                  </View>
                  <Text style={styles.chartDay}>{days[i]}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.chartHint}>— 7h recommended goal</Text>
        </Card>

        {/* Insights */}
        <SectionHeader title="Sleep Insights" />
        <BlurView tint="dark" intensity={30} style={styles.insightCard}>
          <Text style={styles.insightText}>
            {today.sleep.logged && today.sleep.duration >= 7
              ? `✨ Great sleep last night! Your ${today.sleep.duration}h is above the 7h recommended minimum.`
              : `📉 You slept ${((parseFloat(avgSleep) || 7) - (today.sleep.duration || 0)).toFixed(1)}h less than your weekly average. Try an earlier bedtime tonight.`}
          </Text>
        </BlurView>
        <BlurView tint="dark" intensity={30} style={styles.insightCard}>
          <Text style={styles.insightText}>
            💡 You sleep better on weekends. Your Saturday average is 1.4h higher than weekdays.
          </Text>
        </BlurView>

        {/* Tips */}
        <SectionHeader title="Better Sleep Tips" />
        {SLEEP_TIPS.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={styles.tipIcon}><Text style={{ fontSize: 24 }}>{tip.icon}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          </View>
        ))}

      </ScrollView>

      {/* Log Modal */}
      <Modal visible={showLog} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log Sleep</Text>

            <Text style={styles.fieldLabel}>Bedtime</Text>
            <TextInput style={styles.input} value={bedTime} onChangeText={setBedTime} placeholder="22:30" placeholderTextColor={colors.textMuted} />

            <Text style={styles.fieldLabel}>Wake Up Time</Text>
            <TextInput style={styles.input} value={wakeTime} onChangeText={setWakeTime} placeholder="06:30" placeholderTextColor={colors.textMuted} />

            <Text style={styles.fieldLabel}>Duration (hours, optional)</Text>
            <TextInput style={styles.input} value={duration} onChangeText={setDuration} placeholder="Auto-calculated" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLog(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={logSleep}>
                <LinearGradient colors={colors.gradientPrimary} style={styles.saveBtnGrad}>
                  <Text style={styles.saveText}>Save Sleep</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  logBtn: {
    backgroundColor: 'rgba(124,58,237,0.25)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.primary,
  },
  logBtnText: { color: colors.primaryLight, fontSize: fonts.sizes.sm, fontWeight: '700' },

  sleepHero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sleepLabel: { color: colors.textMuted, fontSize: fonts.sizes.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  sleepDurationRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 4 },
  sleepBig: { fontSize: 52, fontWeight: '800', color: colors.text, lineHeight: 58 },
  sleepUnit: { fontSize: fonts.sizes.lg, color: colors.textMuted, marginBottom: 8 },
  sleepMeta: { color: colors.textSecondary, fontSize: fonts.sizes.sm },
  logNowBtn: {
    marginTop: 10, backgroundColor: 'rgba(124,58,237,0.2)',
    borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: colors.primary, alignSelf: 'flex-start',
  },
  logNowText: { color: colors.primaryLight, fontSize: fonts.sizes.sm, fontWeight: '600' },

  scoreWrap: { alignItems: 'center', gap: 6 },
  scoreRing: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: colors.primaryLight + '40',
    overflow: 'hidden',
  },
  scoreRingFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scoreVal: { color: '#fff', fontSize: fonts.sizes.xxl, fontWeight: '800' },
  scoreLabel: { color: 'rgba(255,255,255,0.6)', fontSize: fonts.sizes.xs },

  stagesTitle: { color: colors.textSecondary, fontSize: fonts.sizes.sm, fontWeight: '600', marginBottom: 8 },
  stagesBar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', gap: 4 },
  stageSegment: { height: '100%' },
  stagesLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.textMuted, fontSize: fonts.sizes.xs },
 
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  statCard: {
    flex: 1, backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: 12, alignItems: 'center', gap: 4,
  },
  statIcon: { fontSize: 20 },
  statVal: { fontSize: fonts.sizes.lg, fontWeight: '800' },
  statLabel: { fontSize: fonts.sizes.xs, color: colors.textMuted, textAlign: 'center' },
 
  weekChart: { flexDirection: 'row', height: 110, gap: 6, alignItems: 'flex-end' },
  chartBar: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 4 },
  chartVal: { fontSize: 8, color: colors.textMuted },
  chartBarBg: {
    width: '70%',
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderCurve: 'continuous',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  chartBarFill: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '70%',
    height: 1.5,
    backgroundColor: 'rgba(16, 185, 129, 0.4)',
  },
  chartDay: { fontSize: 9, color: colors.textMuted },
  chartHint: { color: colors.textMuted, fontSize: fonts.sizes.xs, marginTop: 8, textAlign: 'center' },

  insightCard: {
    borderRadius: radius.md,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.15)',
    overflow: 'hidden', borderCurve: 'continuous',
  },
  insightText: { color: colors.textSecondary, fontSize: fonts.sizes.sm, lineHeight: 20 },

  tipRow: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tipIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center',
  },
  tipTitle: { color: colors.text, fontSize: fonts.sizes.sm, fontWeight: '600', marginBottom: 3 },
  tipText: { color: colors.textMuted, fontSize: fonts.sizes.xs, lineHeight: 18 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.bgCard, borderRadius: 28,
    borderWidth: 1, borderColor: colors.border,
    padding: 28, paddingBottom: 40,
  },
  modalTitle: { color: colors.text, fontSize: fonts.sizes.xl, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  fieldLabel: { color: colors.textSecondary, fontSize: fonts.sizes.sm, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14,
    color: colors.text, fontSize: fonts.sizes.md, marginBottom: spacing.md,
  },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: radius.full,
    backgroundColor: colors.bgElevated, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  cancelText: { color: colors.textMuted, fontSize: fonts.sizes.md, fontWeight: '600' },
  saveBtn: { flex: 1, borderRadius: radius.full, overflow: 'hidden' },
  saveBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: fonts.sizes.md, fontWeight: '700' },
});
