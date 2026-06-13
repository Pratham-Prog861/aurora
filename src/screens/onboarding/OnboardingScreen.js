import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  FlatList, Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing, radius } from '../../theme';
import { GradientButton } from '../../components';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    headline: 'Understand yourself\nbetter every day.',
    sub: 'Your personal AI health companion, designed to help you thrive.',
    emoji: '✨',
    bg: ['#0A0914', '#1a0a2e'],
    accent: '#A78BFA',
  },
  {
    id: '2',
    headline: 'Meet your personal\nhealth companion.',
    sub: 'Aurora learns your patterns, understands your body, and guides you toward better health.',
    emoji: '🌟',
    bg: ['#0A0914', '#0a1a1a'],
    accent: '#34D399',
  },
  {
    id: '3',
    headline: 'Track hydration,\nsleep & habits.',
    sub: 'Everything in one place. Simple logging, beautiful insights, zero overwhelm.',
    emoji: '💧',
    bg: ['#0A0914', '#0a0e1a'],
    accent: '#60A5FA',
  },
  {
    id: '4',
    headline: 'Receive personalized\ndaily insights.',
    sub: '"You slept better when you had no screens after 10 PM." Aurora notices what you miss.',
    emoji: '💡',
    bg: ['#0A0914', '#1a0a14'],
    accent: '#F472B6',
  },
  {
    id: '5',
    headline: 'Build healthier\nroutines, daily.',
    sub: 'Small, consistent actions compound into the healthiest version of you.',
    emoji: '🌱',
    bg: ['#0A0914', '#0a140a'],
    accent: '#34D399',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [current, setCurrent] = useState(0);
  const flatRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  function next() {
    if (current < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1 });
      setCurrent(current + 1);
    } else {
      navigation.replace('Auth');
    }
  }

  function skip() {
    navigation.replace('Auth');
  }

  const slide = slides[current];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={slide.bg} style={StyleSheet.absoluteFill} />

      {/* Skip */}
      {current < slides.length - 1 && (
        <TouchableOpacity style={styles.skip} onPress={skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={i => i.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Glowing orb */}
            <View style={[styles.orb, { backgroundColor: item.accent + '30' }]} />
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={[styles.headline, { color: colors.text }]}>{item.headline}</Text>
            <Text style={styles.sub}>{item.sub}</Text>
          </View>
        )}
      />

      {/* Bottom */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === current ? slide.accent : colors.border,
                  width: i === current ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <GradientButton
          title={current === slides.length - 1 ? 'Get Started →' : 'Continue'}
          onPress={next}
          colors={[slide.accent + 'CC', slide.accent]}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  skip: { position: 'absolute', top: 56, right: 24, zIndex: 10 },
  skipText: { color: colors.textMuted, fontSize: fonts.sizes.sm, fontWeight: '600' },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  orb: {
    width: 280,
    height: 280,
    borderRadius: 140,
    position: 'absolute',
    top: height * 0.15,
    alignSelf: 'center',
  },
  emoji: { fontSize: 80, marginBottom: spacing.xl },
  headline: {
    fontSize: fonts.sizes.xxxl,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottom: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    gap: spacing.lg,
  },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { height: 8, borderRadius: 4 },
});
