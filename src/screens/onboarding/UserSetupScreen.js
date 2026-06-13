import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, radius } from '../../theme';
import { GradientButton, ProgressBar } from '../../components';
import { useStore } from '../../store';

const { width } = Dimensions.get('window');

const GOALS = [
  { id: 'hydration', label: 'Improve Hydration', icon: '💧' },
  { id: 'sleep', label: 'Sleep Better', icon: '🌙' },
  { id: 'habits', label: 'Build Better Habits', icon: '✅' },
  { id: 'nutrition', label: 'Eat Healthier', icon: '🥗' },
  { id: 'energy', label: 'Improve Energy', icon: '⚡' },
  { id: 'consistency', label: 'Be More Consistent', icon: '🎯' },
];

const ACTIVITY = [
  { id: 'sedentary', label: 'Sedentary', sub: 'Little or no exercise', icon: '🪑' },
  { id: 'light', label: 'Lightly Active', sub: '1–3 days/week', icon: '🚶' },
  { id: 'moderate', label: 'Moderately Active', sub: '3–5 days/week', icon: '🏃' },
  { id: 'very', label: 'Very Active', sub: '6–7 days/week', icon: '💪' },
];

const STEPS = 4;

export default function UserSetupScreen({ navigation }) {
  const { dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '', age: '', gender: '', height: '', weight: '',
    wakeTime: '07:00', bedTime: '22:30',
    activityLevel: 'moderate',
    goals: [],
    notifications: { hydration: true, sleep: true, habits: true, insights: true },
  });

  function set(key, val) { setData(d => ({ ...d, [key]: val })); }
  function toggleGoal(id) {
    setData(d => ({
      ...d,
      goals: d.goals.includes(id) ? d.goals.filter(g => g !== id) : [...d.goals, id],
    }));
  }
  function toggleNotif(key) {
    setData(d => ({ ...d, notifications: { ...d.notifications, [key]: !d.notifications[key] } }));
  }

  function next() {
    if (step < STEPS - 1) setStep(s => s + 1);
    else {
      dispatch({ type: 'COMPLETE_ONBOARDING', payload: data });
    }
  }

  function back() { if (step > 0) setStep(s => s - 1); }

  const titles = ['Personal Info', 'Lifestyle', 'Your Goals', 'Notifications'];

  return (
    <LinearGradient colors={['#0A0914', '#0f0a20']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        {step > 0 ? (
          <TouchableOpacity onPress={back} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.stepLabel}>Step {step + 1} of {STEPS}</Text>
          <Text style={styles.title}>{titles[step]}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={{ paddingHorizontal: 28, marginBottom: 20 }}>
        <ProgressBar value={step + 1} max={STEPS} height={4} color={colors.gradientPrimary} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 100 }}>

        {/* Step 0: Personal */}
        {step === 0 && (
          <View style={styles.stepContent}>
            {[
              { key: 'name', label: 'Full Name', placeholder: 'Alex Morgan', keyboard: 'default' },
              { key: 'age', label: 'Age', placeholder: '28', keyboard: 'numeric' },
            ].map(f => (
              <Field key={f.key} label={f.label} placeholder={f.placeholder}
                value={data[f.key]} onChangeText={v => set(f.key, v)}
                keyboardType={f.keyboard} />
            ))}

            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.optionRow}>
              {['Male', 'Female', 'Other'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.optionChip, data.gender === g && styles.optionChipActive]}
                  onPress={() => set('gender', g)}
                >
                  <Text style={[styles.optionChipText, data.gender === g && styles.optionChipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rowFields}>
              <View style={{ flex: 1 }}>
                <Field label="Height (cm)" placeholder="175" value={data.height}
                  onChangeText={v => set('height', v)} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Weight (kg)" placeholder="70" value={data.weight}
                  onChangeText={v => set('weight', v)} keyboardType="numeric" />
              </View>
            </View>
          </View>
        )}

        {/* Step 1: Lifestyle */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.rowFields}>
              <View style={{ flex: 1 }}>
                <Field label="Wake Up Time" placeholder="07:00" value={data.wakeTime}
                  onChangeText={v => set('wakeTime', v)} />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Bed Time" placeholder="22:30" value={data.bedTime}
                  onChangeText={v => set('bedTime', v)} />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Activity Level</Text>
            {ACTIVITY.map(a => (
              <TouchableOpacity
                key={a.id}
                style={[styles.activityCard, data.activityLevel === a.id && styles.activityCardActive]}
                onPress={() => set('activityLevel', a.id)}
              >
                <Text style={styles.activityIcon}>{a.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activityLabel, data.activityLevel === a.id && { color: colors.text }]}>{a.label}</Text>
                  <Text style={styles.activitySub}>{a.sub}</Text>
                </View>
                {data.activityLevel === a.id && <Text style={{ color: colors.accent, fontSize: 20 }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepDesc}>Select all that apply. Aurora will personalize your experience around these goals.</Text>
            <View style={styles.goalsGrid}>
              {GOALS.map(g => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.goalCard, data.goals.includes(g.id) && styles.goalCardActive]}
                  onPress={() => toggleGoal(g.id)}
                >
                  <Text style={styles.goalIcon}>{g.icon}</Text>
                  <Text style={[styles.goalLabel, data.goals.includes(g.id) && styles.goalLabelActive]}>{g.label}</Text>
                  {data.goals.includes(g.id) && (
                    <View style={styles.goalCheck}><Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>✓</Text></View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Notifications */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepDesc}>Aurora will send you gentle, personalized reminders to keep you on track.</Text>
            {[
              { key: 'hydration', icon: '💧', label: 'Hydration Reminders', sub: "When you're behind on water intake" },
              { key: 'sleep', icon: '🌙', label: 'Sleep Reminders', sub: 'Around your bedtime routine' },
              { key: 'habits', icon: '✅', label: 'Habit Reminders', sub: 'For habits due today' },
              { key: 'insights', icon: '💡', label: 'Daily Insights', sub: 'Personalized health observations' },
            ].map(n => (
              <View key={n.key} style={styles.notifRow}>
                <Text style={styles.notifIcon}>{n.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifLabel}>{n.label}</Text>
                  <Text style={styles.notifSub}>{n.sub}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, data.notifications[n.key] && styles.toggleOn]}
                  onPress={() => toggleNotif(n.key)}
                >
                  <View style={[styles.toggleThumb, data.notifications[n.key] && styles.toggleThumbOn]} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <GradientButton
          title={step === STEPS - 1 ? "Let's Begin ✨" : 'Continue →'}
          onPress={next}
          style={{ width: '100%' }}
        />
      </View>
    </LinearGradient>
  );
}

function Field({ label, ...props }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: colors.text, fontSize: 20 },
  stepLabel: { color: colors.textMuted, fontSize: fonts.sizes.xs, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: fonts.sizes.xl, fontWeight: '800', marginTop: 2 },
  scroll: { flex: 1 },
  stepContent: { paddingTop: 8 },
  stepDesc: { color: colors.textSecondary, fontSize: fonts.sizes.sm, lineHeight: 22, marginBottom: 20 },

  fieldLabel: { color: colors.textSecondary, fontSize: fonts.sizes.sm, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14,
    color: colors.text, fontSize: fonts.sizes.md,
  },
  rowFields: { flexDirection: 'row', gap: 12 },
  optionRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  optionChip: {
    flex: 1, paddingVertical: 12, borderRadius: radius.md,
    backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center',
  },
  optionChipActive: { borderColor: colors.primary, backgroundColor: 'rgba(124,58,237,0.2)' },
  optionChipText: { color: colors.textMuted, fontSize: fonts.sizes.sm, fontWeight: '600' },
  optionChipTextActive: { color: colors.text },

  activityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: 16, marginBottom: 10,
  },
  activityCardActive: { borderColor: colors.primary, backgroundColor: 'rgba(124,58,237,0.15)' },
  activityIcon: { fontSize: 28 },
  activityLabel: { color: colors.textSecondary, fontSize: fonts.sizes.md, fontWeight: '600' },
  activitySub: { color: colors.textMuted, fontSize: fonts.sizes.xs, marginTop: 2 },

  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goalCard: {
    width: (width - 56 - 10) / 2,
    backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: 16, alignItems: 'flex-start', position: 'relative',
  },
  goalCardActive: { borderColor: colors.primary, backgroundColor: 'rgba(124,58,237,0.2)' },
  goalIcon: { fontSize: 28, marginBottom: 8 },
  goalLabel: { color: colors.textSecondary, fontSize: fonts.sizes.sm, fontWeight: '600', lineHeight: 18 },
  goalLabelActive: { color: colors.text },
  goalCheck: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },

  notifRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  notifIcon: { fontSize: 24 },
  notifLabel: { color: colors.text, fontSize: fonts.sizes.md, fontWeight: '600' },
  notifSub: { color: colors.textMuted, fontSize: fonts.sizes.xs, marginTop: 2 },
  toggle: {
    width: 44, height: 24, borderRadius: 12,
    backgroundColor: colors.border, justifyContent: 'center', padding: 2,
  },
  toggleOn: { backgroundColor: colors.accent },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleThumbOn: { alignSelf: 'flex-end' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 28, paddingBottom: 40, backgroundColor: 'rgba(10,9,20,0.9)' },
});
