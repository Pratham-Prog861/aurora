import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, fonts, spacing, radius, shadows } from '../../theme';
import { Card, SectionHeader, AuroraHeader, ProgressBar, GradientButton, CircleProgress } from '../../components';
import { useStore } from '../../store';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: '🍳', time: 'Morning' },
  { id: 'lunch', label: 'Lunch', icon: '🥗', time: 'Midday' },
  { id: 'dinner', label: 'Dinner', icon: '🍛', time: 'Evening' },
  { id: 'snack', label: 'Snack', icon: '🍎', time: 'Anytime' },
];

const QUICK_FOODS = [
  { name: 'Oatmeal', cal: 150, protein: 5, carbs: 27, fat: 3, icon: '🥣' },
  { name: 'Eggs (2)', cal: 140, protein: 12, carbs: 1, fat: 10, icon: '🍳' },
  { name: 'Banana', cal: 89, protein: 1, carbs: 23, fat: 0, icon: '🍌' },
  { name: 'Chicken Breast', cal: 165, protein: 31, carbs: 0, fat: 4, icon: '🍗' },
  { name: 'Brown Rice', cal: 215, protein: 5, carbs: 45, fat: 2, icon: '🍚' },
  { name: 'Salad', cal: 120, protein: 3, carbs: 10, fat: 7, icon: '🥗' },
];

export default function NutritionScreen({ navigation }) {
  const { state, dispatch } = useStore();
  const { today } = state;
  const [showAdd, setShowAdd] = useState(false);
  const [mealType, setMealType] = useState('breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const meals = today.meals || [];
  const totalCal = meals.reduce((a, m) => a + (m.calories || 0), 0);
  const totalProtein = meals.reduce((a, m) => a + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((a, m) => a + (m.carbs || 0), 0);
  const totalFat = meals.reduce((a, m) => a + (m.fat || 0), 0);

  const calGoal = 2000;

  function logMeal(food) {
    dispatch({
      type: 'LOG_MEAL',
      payload: {
        id: Date.now().toString(),
        type: mealType,
        name: food?.name || foodName || 'Meal',
        calories: food?.cal || parseInt(calories) || 0,
        protein: food?.protein || parseInt(protein) || 0,
        carbs: food?.carbs || parseInt(carbs) || 0,
        fat: food?.fat || parseInt(fat) || 0,
        icon: food?.icon || '🍽️',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    });
    setFoodName(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
    setShowAdd(false);
  }

  const mealsByType = MEAL_TYPES.map(mt => ({
    ...mt,
    items: meals.filter(m => m.type === mt.id),
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AuroraHeader
        title="Nutrition"
        navigation={navigation}
        rightElement={
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Text style={styles.addBtnText}>+ Log</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100 }}>

        {/* Calories overview */}
        <Card gradient={['rgba(251,191,36,0.15)', 'rgba(245,158,11,0.05)']} glowColor={colors.accentGold}>
          <View style={styles.calRow}>
            <View>
              <Text style={styles.calLabel}>Calories Today</Text>
              <View style={styles.calNumRow}>
                <Text style={styles.calBig}>{totalCal}</Text>
                <Text style={styles.calUnit}> / {calGoal} kcal</Text>
              </View>
              <Text style={styles.calRemain}>
                {calGoal - totalCal > 0 ? `${calGoal - totalCal} kcal remaining` : 'Daily goal reached!'}
              </Text>
            </View>
            <View style={styles.calRing}>
              <CircleProgress size={82} pct={Math.min(Math.round((totalCal / calGoal) * 100), 100)} color={colors.accentGold}>
                <Text style={styles.calPct}>{Math.min(Math.round((totalCal / calGoal) * 100), 100)}%</Text>
              </CircleProgress>
            </View>
          </View>
          <ProgressBar value={totalCal} max={calGoal} color={colors.gradientGold} height={8} style={{ marginTop: 14 }} />
        </Card>

        {/* Macros */}
        <View style={styles.macroRow}>
          {[
            { label: 'Protein', val: totalProtein, unit: 'g', goal: 120, color: colors.accentPink, icon: '💪', glow: shadows.glow },
            { label: 'Carbs', val: totalCarbs, unit: 'g', goal: 250, color: colors.accentBlue, icon: '⚡', glow: shadows.blueGlow },
            { label: 'Fat', val: totalFat, unit: 'g', goal: 65, color: colors.accentGold, icon: '🥑', glow: shadows.goldGlow },
          ].map((m, i) => (
            <View key={i} style={[styles.macroCard, m.glow]}>
              <Text style={styles.macroIcon}>{m.icon}</Text>
              <Text style={[styles.macroVal, { color: m.color }]}>{m.val}<Text style={styles.macroUnit}>{m.unit}</Text></Text>
              <Text style={styles.macroLabel}>{m.label}</Text>
              <ProgressBar value={m.val} max={m.goal} color={[m.color, m.color + '90']} height={4} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>

        {/* Meals by type */}
        {mealsByType.map(mt => (
          <View key={mt.id}>
            <View style={styles.mealTypeHeader}>
              <Text style={styles.mealTypeIcon}>{mt.icon}</Text>
              <Text style={styles.mealTypeLabel}>{mt.label}</Text>
              <Text style={styles.mealTypeTime}>{mt.time}</Text>
              <TouchableOpacity onPress={() => { setMealType(mt.id); setShowAdd(true); }}>
                <Text style={styles.mealTypeAdd}>+ Add</Text>
              </TouchableOpacity>
            </View>
            {mt.items.length === 0 ? (
              <View style={styles.emptyMeal}>
                <Text style={styles.emptyMealText}>Nothing logged yet</Text>
              </View>
            ) : (
              mt.items.map(item => (
                <View key={item.id} style={styles.mealItem}>
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mealName}>{item.name}</Text>
                    <Text style={styles.mealMacros}>{item.calories} kcal · P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g</Text>
                  </View>
                  <Text style={styles.mealTime}>{item.time}</Text>
                </View>
              ))
            )}
          </View>
        ))}

        {/* Insights */}
        <SectionHeader title="Nutrition Tips" />
        {[
          { icon: '🥗', text: 'Focus on whole foods first. Protein and fiber help you stay full and energized.', borderColor: 'rgba(16, 185, 129, 0.2)' },
          { icon: '⏰', text: 'Eating within a consistent window (e.g. 8am–8pm) supports better metabolism.', borderColor: 'rgba(139, 92, 246, 0.2)' },
          { icon: '💧', text: 'Sometimes hunger is actually thirst. Try drinking water before reaching for a snack.', borderColor: 'rgba(59, 130, 246, 0.2)' },
        ].map((tip, i) => (
          <BlurView key={i} tint="dark" intensity={30} style={[styles.tipRow, { borderColor: tip.borderColor, borderWidth: 1 }]}>
            <Text style={{ fontSize: 20 }}>{tip.icon}</Text>
            <Text style={styles.tipText}>{tip.text}</Text>
          </BlurView>
        ))}
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalCard} contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>Log a Meal</Text>

            {/* Meal type picker */}
            <View style={styles.typeRow}>
              {MEAL_TYPES.map(mt => (
                <TouchableOpacity
                  key={mt.id}
                  style={[styles.typeChip, mealType === mt.id && styles.typeChipActive]}
                  onPress={() => setMealType(mt.id)}
                >
                  <Text style={{ fontSize: 16 }}>{mt.icon}</Text>
                  <Text style={[styles.typeChipText, mealType === mt.id && { color: colors.text }]}>{mt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick foods */}
            <Text style={styles.fieldLabel}>Quick Add</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {QUICK_FOODS.map((f, i) => (
                  <TouchableOpacity key={i} style={styles.quickFood} onPress={() => logMeal(f)}>
                    <Text style={{ fontSize: 22 }}>{f.icon}</Text>
                    <Text style={styles.quickFoodName}>{f.name}</Text>
                    <Text style={styles.quickFoodCal}>{f.cal} kcal</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.fieldLabel}>Food Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Grilled Chicken" placeholderTextColor={colors.textMuted} value={foodName} onChangeText={setFoodName} />

            <View style={styles.macroInputRow}>
              {[
                { label: 'Calories', state: calories, set: setCalories, unit: 'kcal' },
                { label: 'Protein', state: protein, set: setProtein, unit: 'g' },
                { label: 'Carbs', state: carbs, set: setCarbs, unit: 'g' },
                { label: 'Fat', state: fat, set: setFat, unit: 'g' },
              ].map(f => (
                <View key={f.label} style={{ width: '48%' }}>
                  <Text style={styles.fieldLabel}>{f.label} ({f.unit})</Text>
                  <TextInput style={styles.input} placeholder="0" placeholderTextColor={colors.textMuted} value={f.state} onChangeText={f.set} keyboardType="numeric" />
                </View>
              ))}
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <GradientButton
                title="Log Meal"
                onPress={() => logMeal(null)}
                colors={colors.gradientGold}
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  addBtn: { backgroundColor: 'rgba(251,191,36,0.2)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1, borderColor: colors.accentGold },
  addBtnText: { color: colors.accentGold, fontSize: fonts.sizes.sm, fontWeight: '700' },

  calRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calLabel: { color: colors.textMuted, fontSize: fonts.sizes.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  calNumRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 },
  calBig: { fontSize: 44, fontWeight: '800', color: colors.text, lineHeight: 50 },
  calUnit: { fontSize: fonts.sizes.sm, color: colors.textMuted, marginBottom: 8 },
  calRemain: { color: colors.textMuted, fontSize: fonts.sizes.sm, marginTop: 2 },
  calRing: { alignItems: 'center', justifyContent: 'center' },
  calPct: { color: '#fff', fontSize: fonts.sizes.lg, fontWeight: '800' },

  macroRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  macroCard: { flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 12, alignItems: 'center', gap: 3 },
  macroIcon: { fontSize: 20 },
  macroVal: { fontSize: fonts.sizes.xl, fontWeight: '800' },
  macroUnit: { fontSize: fonts.sizes.xs, color: colors.textMuted, fontWeight: '400' },
  macroLabel: { fontSize: fonts.sizes.xs, color: colors.textMuted },

  mealTypeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  mealTypeIcon: { fontSize: 20 },
  mealTypeLabel: { color: colors.text, fontSize: fonts.sizes.md, fontWeight: '700', flex: 1 },
  mealTypeTime: { color: colors.textMuted, fontSize: fonts.sizes.xs },
  mealTypeAdd: { color: colors.primaryLight, fontSize: fonts.sizes.sm, fontWeight: '600', marginLeft: 8 },
  emptyMeal: { paddingVertical: 10, paddingLeft: 28 },
  emptyMealText: { color: colors.textMuted, fontSize: fonts.sizes.sm },
  mealItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingLeft: 8, borderBottomWidth: 1, borderBottomColor: colors.border + '80' },
  mealName: { color: colors.text, fontSize: fonts.sizes.sm, fontWeight: '600' },
  mealMacros: { color: colors.textMuted, fontSize: fonts.sizes.xs, marginTop: 2 },
  mealTime: { color: colors.textMuted, fontSize: fonts.sizes.xs },

  tipRow: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.md, marginBottom: 8, alignItems: 'flex-start', overflow: 'hidden', borderCurve: 'continuous' },
  tipText: { flex: 1, color: colors.textSecondary, fontSize: fonts.sizes.sm, lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.bgCard, borderRadius: 28, borderWidth: 1, borderColor: colors.border, maxHeight: '90%' },
  modalTitle: { color: colors.text, fontSize: fonts.sizes.xl, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 7 },
  typeChipActive: { borderColor: colors.accentGold, backgroundColor: 'rgba(251,191,36,0.15)' },
  typeChipText: { color: colors.textMuted, fontSize: fonts.sizes.xs, fontWeight: '600' },
  quickFood: { backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, alignItems: 'center', gap: 4, width: 80 },
  quickFoodName: { color: colors.text, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  quickFoodCal: { color: colors.accentGold, fontSize: 10, fontWeight: '700' },
  fieldLabel: { color: colors.textSecondary, fontSize: fonts.sizes.sm, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 13, color: colors.text, fontSize: fonts.sizes.md, marginBottom: 12 },
  macroInputRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: radius.full, backgroundColor: colors.bgElevated, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  cancelText: { color: colors.textMuted, fontSize: fonts.sizes.md, fontWeight: '600' },
});
