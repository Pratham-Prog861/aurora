# ✦ Aurora — Mobile Health Companion

> *Understand yourself better every day.*

A premium, AI-powered mobile health companion built with **React Native + Expo SDK 56** featuring a cyber-dark wellness design.

---

## 🌟 Features

### Core Screens & Premium Redesigns

| Screen | Description |
|--------|-------------|
| **Onboarding** | 5-slide premium introduction flow with smooth transitions |
| **Auth** | Unified Sign-in/Sign-up screen using state-driven React Navigation routing transitions |
| **User Setup** | 4-step personalized profile onboarding (personal info, lifestyle habits, health goals, bedtime schedule) |
| **Home Dashboard** | Frosted glassmorphic habit check-off dots, weekly progress visualizers, and macro badges |
| **Aurora AI** | Universal voice + text inputs with real-time TTS speech toggles, animated glowing visual feedback, and agentic actions |
| **Hydration** | Shaded capsule liquid bottle indicator, blue glassmorphic quick-add grid, and daily goal calculator |
| **Sleep** | Multi-segmented sleep stage breakdown pills, rounded sleep-pattern vertical analytics, and glowing weekly statistics |
| **Profile / Me** | Frosted achievements carousel, glowing stats grid cards, overall health score, and settings panel |

### AI Agent Capabilities

Aurora's AI agent can **perform real-time updates** to your health metrics directly through natural conversation:
- `"I drank 500ml water"` → Updates hydration tracker instantly
- `"I slept 7.5 hours"` → Logs sleep and computes sleep score
- `"Create a meditation habit"` → Adds to your daily habit routine list
- `"How am I doing today?"` → Analyzes active state for a data-driven personal progress summary
- **Voice Mode**: Speaks responses aloud using device-level Text-to-Speech (TTS), with a dedicated listening orb visualization

---

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device (iOS/Android)

### Installation
1. Clone the repository and navigate into the project directory:
   ```bash
   git clone 
   cd aurora
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Add your Gemini API Key
Aurora uses the **Google Gemini 2.5 Flash** model. 
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```
*(Get your key from [Google AI Studio](https://aistudio.google.com/))*

### Start the Application
```bash
npm start
```
Scan the QR code displayed in your terminal using the Expo Go app on your phone.

---

## 🏗️ Architecture & Stack

```
aurora/
├── App.js                          # Main entry point
├── app.json                        # Expo configuration
├── .env                            # Local environment keys
├── src/
│   ├── theme/index.js              # Theme design tokens & glow definitions
│   ├── store/index.js              # Global Redux-like context store
│   ├── services/ai.js              # Gemini 2.5 Flash integration, TTS, & action extraction
│   ├── navigation/index.js         # React Navigation Stack + Custom Absolute Tab Bar
│   ├── components/index.js         # Glassmorphic, custom SVG Progress and reusable components
│   └── screens/
│       ├── onboarding/             # Onboarding and UserSetup screens
│       ├── auth/                   # Authentication screen
│       ├── main/                   # Home, AIScreen, and Profile (Me)
│       └── modules/                # Hydration, Sleep, Habits, and Nutrition
```

### Tech Stack
| Layer | Choice |
|-------|--------|
| Framework | React Native + Expo SDK 56 |
| Navigation | React Navigation v7 (Stack & Custom Tab Bar) |
| State | React Context + useReducer + AsyncStorage persistence |
| AI Model | Google Gemini 2.5 Flash (via OpenAI Compatibility Endpoint) |
| Voice TTS | expo-speech |
| UI & Vector | react-native-svg (Custom SVG Progress rings) |
| Styling | StyleSheet + custom spatial glow tokens (Zero external UI kits) |

---

## 🎨 Design System

**Visual Aesthetic**
- **Spatial Background**: Deep velvet night gradients (`#0A0914` to `#131224`)
- **Cyber Glows**: High-contrast, glowing neon halos representing vitals:
  - primary / sleep: `#7C3AED` (neon purple)
  - hydration: `#60A5FA` (cyber blue)
  - habits / mint: `#34D399` (neon mint)
- **Glassmorphism**: Heavy use of custom `BlurView` panels with HSL borders overlaying glowing drop shadows.

---

## 🎙️ Agent Action Protocol

When chatting with the AI, the Gemini model decides when to dispatch an action using custom JSON protocols:

```
ACTION:{"type":"ADD_HYDRATION","amount":500}
ACTION:{"type":"LOG_SLEEP","duration":7.5}
ACTION:{"type":"TOGGLE_HABIT","habitId":"habit-id"}
ACTION:{"type":"ADD_HABIT","name":"Habit Name","icon":"✅","color":"#7C3AED"}
ACTION:{"type":"ADD_MEMORY","text":"User prefers drinking water in the morning"}
```

The app parses these blocks with regex in the background, applies updates to the database store, and strips the tag from the text before speaking it aloud via Text-to-Speech.

---

## 📤 Submission & Hackathon
Built with ❤️ for the **Humanity Founders Hackathon** — June 2026.
