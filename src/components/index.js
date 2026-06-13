import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, shadows, fonts } from '../theme';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// ─── GradientButton ─────────────────────────────────────────────────────────
export function GradientButton({ title, onPress, colors: btnColors, style, textStyle, disabled, loading, icon }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={[styles.btnWrap, style]}>
      <LinearGradient
        colors={disabled ? ['#3A3860', '#2A2845'] : (btnColors || colors.gradientPrimary)}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.btn}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon && <Text style={styles.btnIcon}>{icon}</Text>}
            <Text style={[styles.btnText, textStyle]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, style, gradient, onPress, glowColor }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const content = (
    <LinearGradient
      colors={gradient || colors.gradientCard}
      style={[styles.card, style]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
    >
      {/* top accent line */}
      {glowColor && (
        <LinearGradient
          colors={[glowColor, 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.cardAccent}
        />
      )}
      {children}
    </LinearGradient>
  );

  return (
    <Wrapper onPress={onPress} activeOpacity={0.85} style={[shadows.card, { borderRadius: radius.lg, marginBottom: spacing.md }]}>
      {content}
    </Wrapper>
  );
}

// ─── SectionHeader ──────────────────────────────────────────────────────────
export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, color, height = 8, style }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={[styles.progressBg, { height }, style]}>
      <LinearGradient
        colors={color || colors.gradientPrimary}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[styles.progressFill, { width: `${pct}%`, height }]}
      />
    </View>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ label, color, bg }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg || 'rgba(124,58,237,0.2)' }]}>
      <Text style={[styles.badgeText, { color: color || colors.primaryLight }]}>{label}</Text>
    </View>
  );
}

// ─── CircleProgress ──────────────────────────────────────────────────────────
export function CircleProgress({ size = 80, pct, color, children }) {
  const strokeW = 6;
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(pct / 100, 1);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute' }}
      >
        <Circle cx={size/2} cy={size/2} r={r} fill="none" stroke={colors.border} strokeWidth={strokeW} />
        <Circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color || colors.primary}
          strokeWidth={strokeW}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size/2}, ${size/2}`}
        />
      </Svg>
      {children}
    </View>
  );
}

// ─── InputField ──────────────────────────────────────────────────────────────
export function InputField({ label, ...props }) {
  const { TextInput } = require('react-native');
  return (
    <View style={styles.inputWrap}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

// ─── AuroraHeader ────────────────────────────────────────────────────────────
export function AuroraHeader({ title, subtitle, onBack, rightElement, navigation }) {
  return (
    <View style={styles.header}>
      {onBack || navigation ? (
        <TouchableOpacity style={styles.backBtn} onPress={onBack || (() => navigation?.goBack())}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      ) : <View style={{ width: 40 }} />}
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || <View style={{ width: 40 }} />}
    </View>
  );
}

// ─── EmptyState ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySub}>{subtitle}</Text>}
      {action && (
        <GradientButton title={action} onPress={onAction} style={{ marginTop: spacing.lg, width: 180 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Button
  btnWrap: { borderRadius: radius.full },
  btn: {
    height: 54,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.xl,
  },
  btnText: { color: '#fff', fontSize: fonts.sizes.md, fontWeight: '700', letterSpacing: 0.3 },
  btnIcon: { fontSize: 18 },

  // Card
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 2,
    borderRadius: radius.lg,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  sectionTitle: { color: colors.text, fontSize: fonts.sizes.lg, fontWeight: '700' },
  sectionAction: { color: colors.primaryLight, fontSize: fonts.sizes.sm, fontWeight: '600' },

  // Progress
  progressBg: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: { borderRadius: radius.full },

  // Badge
  badge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: fonts.sizes.xs, fontWeight: '700' },

  // Input
  inputWrap: { marginBottom: spacing.md },
  inputLabel: { color: colors.textSecondary, fontSize: fonts.sizes.sm, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fonts.sizes.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.bgElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: colors.text, fontSize: 20 },
  headerTitle: { color: colors.text, fontSize: fonts.sizes.lg, fontWeight: '700' },
  headerSubtitle: { color: colors.textMuted, fontSize: fonts.sizes.sm, marginTop: 1 },

  // Empty
  empty: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { color: colors.text, fontSize: fonts.sizes.lg, fontWeight: '700', marginBottom: spacing.sm },
  emptySub: { color: colors.textMuted, fontSize: fonts.sizes.sm, textAlign: 'center', paddingHorizontal: spacing.xl },
});
