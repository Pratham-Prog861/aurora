import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, radius } from '../../theme';
import { Card, SectionHeader, AuroraHeader, ProgressBar, GradientButton } from '../../components';
import { useStore } from '../../store';

const PRESET_HABITS = [
  { name: 'Meditate', icon: '🧘', color: colors.primaryLight },
  { name: 'Read', icon: '📚', color: colors.accentGold },
  { name: 'Walk', icon: '🚶', color: colors.accent },
  { name: 'Journal', icon: '✍️', color: colors.accentPink },
  { name: 'Stretch', icon: '🤸', color: colors.accentBlue },
  { name: 'Vitamins', icon: '💊', color: '#F87171' },
  { name: 'Cold Shower', icon: '🚿', color: colors.accentBlue },
  { name: 'Gratitude', icon: '🙏', color: colors.accentGold },
];

const COLORS = [colors.primaryLight, colors.accent, colors.accentBlue, colors.accentPink, colors.accentGold, '#F87171'];

export default function HabitsScreen({ navigation }) {
  const { state, dispatch } = useStore();
  const { habits } = state;
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('✅');
  const [newColor, setNewColor] = useState(colors.accent);

  const completed = habits.filter(h => h.completedToday).length;
  const totalStreak = habits.reduce((a, h) => a + h.streak, 0);

  function toggle(id) { dispatch({ type: 'TOGGLE_HABIT', payload: id }); }

  function addHabit() {
    if (!newName.trim()) return;
    dispatch({ type: 'ADD_HABIT', payload: { name: newName.trim(), icon: newIcon, color: newColor, frequency: 'daily' } });
    setNewName(''); setNewIcon('✅'); setShowAdd(false);
  }

  function usePreset(p) {
    setNewName(p.name); setNewIcon(p.icon); setNewColor(p.color);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AuroraHeader
        title="Habits"
        navigation={navigation}
        rightElement={
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Text style={styles.addBtnText}>+ New</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100 }}>

        {/* Summary */}
        <Card gradient={['rgba(52,211,153,0.15)', 'rgba(52,211,153,0.03)']} glowColor={colors.accent}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.accent }]}>{completed}/{habits.length}</Text>
              <Text style={styles.summaryLabel}>Done Today</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.accentGold }]}>{totalStreak}</Text>
              <Text style={styles.summaryLabel}>Total Streak Days</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.primaryLight }]}>{habits.length}</Text>
              <Text style={styles.summaryLabel}>Active Habits</Text>
            </View>
          </View>
          <ProgressBar value={completed} max={habits.length} color={colors.gradientMint} height={8} style={{ marginTop: 14 }} />
          <Text style={styles.progressText}>
            {completed === habits.length ? '🎉 All done today!' : `${habits.length - completed} habit${habits.length - completed !== 1 ? 's' : ''} remaining`}
          </Text>
        </Card>

        {/* Today's habits */}
        <SectionHeader title="Today's Habits" action={`${completed}/${habits.length}`} />
        {habits.map((h) => (
          <HabitCard key={h.id} habit={h} onToggle={() => toggle(h.id)} />
        ))}

        {habits.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySub}>Tap "+ New" to create your first habit</Text>
          </View>
        )}

        {/* Insights */}
        {habits.length > 0 && (
          <>
            <SectionHeader title="Habit Insights" />
            {[
              { icon: '🔥', text: `Your longest active streak is ${Math.max(...habits.map(h => h.streak))} days — keep it going!`, bg: 'rgba(251,191,36,0.12)' },
              { icon: '⏰', text: 'Morning habits are completed 40% more consistently than evening habits.', bg: 'rgba(96,165,250,0.12)' },
              { icon: '📈', text: `You've completed ${Math.round((completed / habits.length) * 100)}% of habits today. Aim for 100% to build momentum!`, bg: 'rgba(52,211,153,0.12)' },
            ].map((ins, i) => (
              <View key={i} style={[styles.insightRow, { backgroundColor: ins.bg }]}>
                <Text style={{ fontSize: 20 }}>{ins.icon}</Text>
                <Text style={styles.insightText}>{ins.text}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalCard} contentContainerStyle={{ padding: 28 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>New Habit</Text>

            {/* Presets */}
            <Text style={styles.fieldLabel}>Quick Add</Text>
            <View style={styles.presetsGrid}>
              {PRESET_HABITS.map((p, i) => (
                <TouchableOpacity key={i} style={styles.presetChip} onPress={() => usePreset(p)}>
                  <Text style={{ fontSize: 18 }}>{p.icon}</Text>
                  <Text style={styles.presetText}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Habit Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Morning Run"
              placeholderTextColor={colors.textMuted}
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.fieldLabel}>Icon</Text>
            <View style={styles.iconRow}>
              {['✅', '💧', '🧘', '📚', '🚶', '✍️', '💊', '🏃', '🎯', '🌟'].map(icon => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconOption, newIcon === icon && styles.iconOptionActive]}
                  onPress={() => setNewIcon(icon)}
                >
                  <Text style={{ fontSize: 22 }}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Color</Text>
            <View style={styles.colorRow}>
              {COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c }, newColor === c && styles.colorDotActive]}
                  onPress={() => setNewColor(c)}
                />
              ))}
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <GradientButton title="Create Habit" onPress={addHabit} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function HabitCard({ habit, onToggle }) {
  return (
    <TouchableOpacity style={styles.habitCard} onPress={onToggle} activeOpacity={0.8}>
      <LinearGradient
        colors={habit.completedToday ? [`${habit.color}25`, `${habit.color}10`] : [colors.bgCard, colors.bgElevated]}
        style={styles.habitCardInner}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      >
        <View style={[styles.habitIconWrap, { backgroundColor: habit.color + '25', borderColor: habit.completedToday ? habit.color : 'transparent', borderWidth: 2 }]}>
          <Text style={{ fontSize: 24 }}>{habit.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.habitName, habit.completedToday && { color: colors.textMuted, textDecorationLine: 'line-through' }]}>
            {habit.name}
          </Text>
          <View style={styles.habitMeta}>
            <Text style={styles.habitStreak}>🔥 {habit.streak} day streak</Text>
            <Text style={styles.habitFreq}>Daily</Text>
          </View>
        </View>
        <View style={[styles.checkCircle, { borderColor: habit.color, backgroundColor: habit.completedToday ? habit.color : 'transparent' }]}>
          {habit.completedToday && <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>✓</Text>}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  addBtn: {
    backgroundColor: 'rgba(52,211,153,0.2)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.accent,
  },
  addBtnText: { color: colors.accent, fontSize: fonts.sizes.sm, fontWeight: '700' },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  summaryItem: { alignItems: 'center', gap: 3 },
  summaryVal: { fontSize: fonts.sizes.xxl, fontWeight: '800' },
  summaryLabel: { color: colors.textMuted, fontSize: fonts.sizes.xs },
  summaryDivider: { width: 1, height: 36, backgroundColor: colors.border },
  progressText: { color: colors.textMuted, fontSize: fonts.sizes.xs, marginTop: 8, textAlign: 'center' },

  habitCard: { marginBottom: 10, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  habitCardInner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  habitIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  habitName: { color: colors.text, fontSize: fonts.sizes.md, fontWeight: '600' },
  habitMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 3 },
  habitStreak: { color: colors.accentGold, fontSize: fonts.sizes.xs, fontWeight: '600' },
  habitFreq: { color: colors.textMuted, fontSize: fonts.sizes.xs },
  checkCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },

  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: colors.text, fontSize: fonts.sizes.lg, fontWeight: '700' },
  emptySub: { color: colors.textMuted, fontSize: fonts.sizes.sm, textAlign: 'center' },

  insightRow: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.md, marginBottom: 8, alignItems: 'flex-start' },
  insightText: { flex: 1, color: colors.textSecondary, fontSize: fonts.sizes.sm, lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.bgCard, borderRadius: 28, borderWidth: 1, borderColor: colors.border, maxHeight: '90%' },
  modalTitle: { color: colors.text, fontSize: fonts.sizes.xl, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  fieldLabel: { color: colors.textSecondary, fontSize: fonts.sizes.sm, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14,
    color: colors.text, fontSize: fonts.sizes.md, marginBottom: spacing.md,
  },
  presetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  presetChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 8,
  },
  presetText: { color: colors.textSecondary, fontSize: fonts.sizes.xs, fontWeight: '500' },
  iconRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  iconOption: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  iconOptionActive: { borderColor: colors.primary },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: '#fff', transform: [{ scale: 1.2 }] },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: radius.full,
    backgroundColor: colors.bgElevated, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  cancelText: { color: colors.textMuted, fontSize: fonts.sizes.md, fontWeight: '600' },
});
