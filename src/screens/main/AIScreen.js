import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Animated, Easing, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Speech from 'expo-speech';
import { colors, fonts, spacing, radius, shadows } from '../../theme';
import { sendToAurora, parseActions, cleanResponse, speak, stopSpeaking } from '../../services/ai';
import { useStore } from '../../store';

const QUICK = [
  "How am I doing today?",
  "Log 500ml water",
  "I slept 7.5 hours",
  "Create a meditation habit",
  "Any health tips for me?",
  "What's my hydration status?",
];

function TypingDots() {
  const anims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    anims.forEach((a, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(a, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.ease }),
          Animated.timing(a, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();
    });
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 4, paddingVertical: 4 }}>
      {anims.map((a, i) => (
        <Animated.View key={i} style={[styles.dot, { transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }]} />
      ))}
    </View>
  );
}

// Pulsing orb for voice mode
function VoiceOrb({ active, listening }) {
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (listening || active) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale1, { toValue: 1.35, duration: 800, useNativeDriver: true }),
            Animated.timing(scale1, { toValue: 1.0, duration: 800, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(250),
            Animated.timing(scale2, { toValue: 1.6, duration: 800, useNativeDriver: true }),
            Animated.timing(scale2, { toValue: 1.0, duration: 800, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1.0, duration: 800, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
          ])
        ])
      ).start();
    } else {
      scale1.setValue(1);
      scale2.setValue(1);
      opacity.setValue(0.6);
    }
  }, [listening, active]);

  return (
    <View style={styles.orbWrap}>
      <View style={{ position: 'relative', width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
        {/* Pulsing ring 2 */}
        {(listening || active) && (
          <Animated.View style={[styles.orbRing, { transform: [{ scale: scale2 }], opacity: opacity.interpolate({ inputRange: [0.4, 1], outputRange: [0.05, 0.2] }), borderColor: listening ? colors.accentPink : colors.primaryLight }]} />
        )}
        {/* Pulsing ring 1 */}
        {(listening || active) && (
          <Animated.View style={[styles.orbRing, { transform: [{ scale: scale1 }], opacity: opacity.interpolate({ inputRange: [0.4, 1], outputRange: [0.15, 0.4] }), borderColor: colors.primary }]} />
        )}
        
        {/* Main Orb */}
        <Animated.View style={[styles.orbOuter, { transform: [{ scale: scale1 }], opacity }]}>
          <LinearGradient colors={listening ? [colors.accentPink, colors.primary] : colors.gradientPrimary} style={styles.orbInner}>
            <Text style={styles.orbIcon}>{listening ? '🎙️' : active ? '🔊' : '✦'}</Text>
          </LinearGradient>
        </Animated.View>
      </View>
      <Text style={styles.orbHint}>
        {listening ? 'Listening...' : active ? 'Speaking...' : 'Aurora AI'}
      </Text>
    </View>
  );
}

export default function AIScreen({ navigation }) {
  const { state, dispatch } = useStore();
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Hi ${state.profile.name || 'there'}! 🌟 I'm Aurora, your personal health companion.\n\nYou can talk to me or type. Try asking:\n• "How am I doing today?"\n• "Log 500ml water"\n• "I slept 7.5 hours last night"`,
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  async function handleSend(text) {
    const q = (text || input).trim();
    if (!q) return;
    setInput('');

    const userMsg = { role: 'user', text: q, time: new Date() };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    const history = [...messages, userMsg]
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));

    try {
      const raw = await sendToAurora(history, state);
      const clean = cleanResponse(raw);
      const actions = parseActions(raw);

      // Execute agent actions
      actions.forEach(action => {
        if (action.type === 'ADD_HYDRATION') dispatch({ type: 'ADD_HYDRATION', payload: action.amount });
        else if (action.type === 'LOG_SLEEP') dispatch({ type: 'LOG_SLEEP', payload: { duration: action.duration, logged: true } });
        else if (action.type === 'TOGGLE_HABIT') dispatch({ type: 'TOGGLE_HABIT', payload: action.habitId });
        else if (action.type === 'ADD_HABIT') dispatch({ type: 'ADD_HABIT', payload: { name: action.name, icon: action.icon || '✅', color: action.color || colors.accent, frequency: 'daily' } });
        else if (action.type === 'ADD_MEMORY') dispatch({ type: 'ADD_MEMORY', payload: action.text });
      });

      const aiMsg = { role: 'ai', text: clean, time: new Date(), hasActions: actions.length > 0 };
      setMessages(m => [...m, aiMsg]);

      // Speak if voice enabled
      if (voiceEnabled) {
        setSpeaking(true);
        await speak(clean);
        setSpeaking(false);
      }
    } catch (e) {
      setMessages(m => [...m, { role: 'ai', text: "I had trouble connecting. Please try again!", time: new Date() }]);
    } finally {
      setLoading(false);
    }
  }

  function toggleVoice() {
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    setVoiceEnabled(!voiceEnabled);
  }

  function simulateVoiceInput() {
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    setListening(true);
    setTimeout(() => {
      setListening(false);
      // Simulate captured speech
      const phrases = [
        "How am I doing today?",
        "I drank 300ml of water",
        "Log my sleep as 7 hours",
        "Give me a health tip",
      ];
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      handleSend(phrase);
    }, 2000);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={colors.gradientNight} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Aurora AI</Text>
          <View style={styles.statusDot}>
            <View style={[styles.dot2, { backgroundColor: colors.accent }]} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.voiceBtn, voiceEnabled && styles.voiceBtnActive]} onPress={toggleVoice}>
          <Text style={styles.voiceBtnIcon}>{voiceEnabled ? '🔊' : '🔇'}</Text>
        </TouchableOpacity>
      </View>

      {/* Quick prompts */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}>
        {QUICK.map((q, i) => (
          <TouchableOpacity key={i} style={styles.quickChip} onPress={() => handleSend(q)}>
            <Text style={styles.quickChipText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Messages */}
      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 20, gap: 14 }}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.msgRow, m.role === 'user' && styles.msgRowUser]}>
            {m.role === 'ai' && (
              <LinearGradient colors={colors.gradientPrimary} style={styles.msgAvatar}>
                <Text style={{ fontSize: 14 }}>✦</Text>
              </LinearGradient>
            )}
            {m.role === 'user' ? (
              <LinearGradient colors={colors.gradientPrimary} style={[styles.bubble, styles.bubbleUser]}>
                <Text style={styles.bubbleTextUser}>{m.text}</Text>
                <Text style={styles.bubbleTimeUser}>{m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.bubble, styles.bubbleAi]}>
                <Text style={styles.bubbleText}>{m.text}</Text>
                {m.hasActions && (
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionBadgeText}>✓ Action taken</Text>
                  </View>
                )}
                <Text style={styles.bubbleTime}>{m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            )}
          </View>
        ))}

        {loading && (
          <View style={styles.msgRow}>
            <LinearGradient colors={colors.gradientPrimary} style={styles.msgAvatar}>
              <Text style={{ fontSize: 14 }}>✦</Text>
            </LinearGradient>
            <View style={styles.bubbleAi}>
              <TypingDots />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Voice Indicator Overlay */}
      {(listening || speaking) && (
        <View style={StyleSheet.absoluteFill}>
          <BlurView tint="dark" intensity={70} style={styles.voiceOverlay}>
            <VoiceOrb active={speaking} listening={listening} />
            {speaking && (
              <TouchableOpacity style={styles.skipVoiceBtn} onPress={() => { stopSpeaking(); setSpeaking(false); }}>
                <Text style={styles.skipVoiceText}>Skip Listening</Text>
              </TouchableOpacity>
            )}
          </BlurView>
        </View>
      )}

      {/* Input Row wrapped in Glassmorphism BlurView */}
      <BlurView tint="dark" intensity={60} style={styles.inputRow}>
        <TouchableOpacity style={styles.micBtn} onPress={simulateVoiceInput}>
          <LinearGradient colors={listening ? [colors.accentPink, colors.primary] : colors.gradientPrimary} style={styles.micGrad}>
            <Text style={{ fontSize: 20 }}>🎙️</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Ask Aurora anything..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()} disabled={!input.trim() || loading}>
          <LinearGradient colors={colors.gradientPrimary} style={styles.sendGrad}>
            <Text style={{ fontSize: 18, color: '#fff' }}>➤</Text>
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: 8,
  },
  headerTitle: { color: colors.text, fontSize: fonts.sizes.lg, fontWeight: '800' },
  statusDot: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dot2: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: fonts.sizes.xs, color: colors.textMuted },
  voiceBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center',
  },
  voiceBtnActive: { backgroundColor: 'rgba(124,58,237,0.3)' },
  voiceBtnIcon: { fontSize: 20 },

  // Orb
  orbWrap: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  orbRing: {
    position: 'absolute',
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2.5,
  },
  orbOuter: { ...shadows.glow },
  orbInner: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: 'center', justifyContent: 'center',
  },
  orbIcon: { fontSize: 36 },
  orbHint: { color: colors.textMuted, fontSize: fonts.sizes.sm },

  quickScroll: { maxHeight: 44, marginBottom: 4 },
  quickChip: {
    backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8,
  },
  quickChipText: { color: colors.textSecondary, fontSize: fonts.sizes.xs, fontWeight: '500' },

  messages: { flex: 1 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgAvatar: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  bubble: { maxWidth: '78%', borderRadius: 20, padding: 13 },
  bubbleAi: {
    backgroundColor: 'rgba(17, 13, 29, 0.7)',
    borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.15)',
    borderBottomLeftRadius: 4,
    borderCurve: 'continuous',
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
    borderCurve: 'continuous',
  },
  bubbleText: { color: colors.text, fontSize: fonts.sizes.sm, lineHeight: 21 },
  bubbleTextUser: { color: '#ffffff', fontSize: fonts.sizes.sm, lineHeight: 21 },
  bubbleTime: { color: 'rgba(255,255,255,0.3)', fontSize: 9, marginTop: 4, textAlign: 'right' },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.6)', fontSize: 9, marginTop: 4, textAlign: 'right' },
  actionBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 6, alignSelf: 'flex-start',
  },
  actionBadgeText: { color: colors.accent, fontSize: 10, fontWeight: '700' },

  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.primaryLight },

  inputRow: {
    flexDirection: 'row', gap: 10, padding: 14, paddingBottom: 14,
    marginBottom: 80, // Sit above the absolute custom tab bar
    borderTopWidth: 1, borderTopColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  input: {
    flex: 1, backgroundColor: colors.bgElevated,
    borderWidth: 1, borderColor: colors.border, borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 12,
    color: colors.text, fontSize: fonts.sizes.sm, maxHeight: 100,
  },
  micBtn: {},
  micGrad: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  sendBtn: { opacity: 1 },
  sendGrad: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  voiceOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  skipVoiceBtn: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radius.full,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipVoiceText: {
    color: colors.text,
    fontSize: fonts.sizes.sm,
    fontWeight: '700',
  },
});
