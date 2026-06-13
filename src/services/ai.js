import * as Speech from 'expo-speech';

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'REPLACE_WITH_YOUR_GEMINI_API_KEY';

export function buildSystemPrompt(state) {
  const { profile, today, habits, aiMemory, streaks, history } = state;
  const completedHabits = habits.filter(h => h.completedToday).length;
  const hydrationPct = Math.round((today.hydration.intake / today.hydration.goal) * 100);
  const avgSleep = history.sleep.length
    ? (history.sleep.reduce((a, b) => a + b, 0) / history.sleep.length).toFixed(1)
    : 'unknown';

  return `You are Aurora, a warm, empathetic, and intelligent personal health companion app. You are NOT a generic chatbot — you are deeply integrated with the user's health data and can take real actions.

USER PROFILE:
- Name: ${profile.name || 'User'}
- Age: ${profile.age || 'unknown'}, Gender: ${profile.gender || 'unknown'}
- Height: ${profile.height || 'unknown'} cm, Weight: ${profile.weight || 'unknown'} kg
- Wake time: ${profile.wakeTime}, Bedtime: ${profile.bedTime}
- Activity level: ${profile.activityLevel}
- Goals: ${profile.goals?.join(', ') || 'general wellness'}

TODAY'S DATA (${new Date().toLocaleDateString()}):
- Hydration: ${today.hydration.intake}ml of ${today.hydration.goal}ml goal (${hydrationPct}%)
- Sleep last night: ${today.sleep.logged ? today.sleep.duration + 'h' : 'not logged yet'}
- Habits: ${completedHabits}/${habits.length} completed today
- Meals logged: ${today.meals.length}
- Mood: ${today.mood || 'not set'}

WEEKLY AVERAGES:
- Avg sleep: ${avgSleep}h
- Hydration history (last 7 days ml): ${history.hydration.join(', ')}

ACTIVE HABITS:
${habits.map(h => `- ${h.name} (streak: ${h.streak} days, ${h.completedToday ? 'done ✓' : 'pending'})`).join('\n')}

STREAKS:
- Overall: ${streaks.overall} days, Habits: ${streaks.habits} days, Sleep: ${streaks.sleep} days

AURORA'S MEMORY (observations from previous sessions):
${aiMemory.slice(0, 5).map(m => `- ${m}`).join('\n')}

CAPABILITIES (you can trigger these actions by including JSON in your response):
- Add hydration: respond with ACTION:{"type":"ADD_HYDRATION","amount":500}
- Log sleep: respond with ACTION:{"type":"LOG_SLEEP","duration":7.5}
- Complete habit: respond with ACTION:{"type":"TOGGLE_HABIT","habitId":"1"}
- Add new habit: respond with ACTION:{"type":"ADD_HABIT","name":"Meditate","icon":"🧘","color":"#A78BFA"}
- Store memory: respond with ACTION:{"type":"ADD_MEMORY","text":"observation about user"}

BEHAVIOR RULES:
1. Keep responses SHORT (2-4 sentences max) — optimized for voice
2. Be warm, encouraging, and personal — use their name (${profile.name || 'friend'})
3. When user logs data via conversation, confirm it and execute the action
4. Give specific, data-driven insights based on their actual numbers
5. After every action, give a brief encouraging response
6. If asked "how am I doing", summarize their day positively
7. Never give medical diagnoses. Recommend doctors for health concerns.
8. Speak naturally — responses will be read aloud by text-to-speech

TONE: Warm coach, not a chatbot. Personal, intelligent, supportive.`;
}

export async function sendToAurora(messages, state) {
  try {
    const systemPrompt = buildSystemPrompt(state);
    
    // Format messages for OpenAI compatibility layer
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role, // already 'user' or 'assistant'
        content: m.content
      }))
    ];

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        messages: formattedMessages,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return `I encountered an API error: ${data.error.message || JSON.stringify(data.error)}`;
    }

    const text = data.choices?.[0]?.message?.content || "I'm here for you! Could you say that again?";
    return text;
  } catch (e) {
    console.error('sendToAurora error:', e);
    return "I had trouble connecting. Please check your internet and try again!";
  }
}

export function parseActions(text) {
  const actions = [];
  const regex = /ACTION:(\{[^}]+\})/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    try {
      actions.push(JSON.parse(match[1]));
    } catch (e) {}
  }
  return actions;
}

export function cleanResponse(text) {
  return text.replace(/ACTION:\{[^}]+\}/g, '').trim();
}

// Text-to-Speech
export async function speak(text) {
  const clean = cleanResponse(text);
  await Speech.speak(clean, {
    language: 'en-US',
    pitch: 1.0,
    rate: 0.92,
    onDone: () => {},
  });
}

export function stopSpeaking() {
  Speech.stop();
}

export function isSpeaking() {
  return Speech.isSpeakingAsync();
}
