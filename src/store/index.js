import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  // Auth
  isAuthenticated: false,
  hasOnboarded: false,
  user: null,

  // Profile
  profile: {
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    wakeTime: '07:00',
    bedTime: '22:30',
    activityLevel: 'moderate',
    goals: [],
    notifications: {
      hydration: true,
      sleep: true,
      habits: true,
      insights: true,
    },
  },

  // Today's data
  today: {
    date: new Date().toDateString(),
    hydration: { intake: 0, goal: 2500 }, // ml
    sleep: { duration: 0, bedTime: null, wakeTime: null, logged: false },
    habits: [],
    meals: [],
    mood: null,
  },

  // History (last 7 days)
  history: {
    hydration: [2100, 1800, 2400, 2000, 2300, 1600, 1900],
    sleep: [7.2, 6.8, 8.1, 7.5, 6.4, 8.3, 7.4],
    habits: [80, 60, 100, 80, 40, 90, 70],
  },

  // Habits
  habits: [
    { id: '1', name: 'Drink Water', icon: '💧', frequency: 'daily', streak: 5, completedToday: false, color: '#60A5FA' },
    { id: '2', name: 'Morning Walk', icon: '🚶', frequency: 'daily', streak: 3, completedToday: false, color: '#34D399' },
    { id: '3', name: 'Meditate', icon: '🧘', frequency: 'daily', streak: 8, completedToday: true, color: '#A78BFA' },
    { id: '4', name: 'Read', icon: '📚', frequency: 'daily', streak: 12, completedToday: false, color: '#FBBF24' },
  ],

  // AI Memory
  aiMemory: [
    'User often misses hydration goals in the afternoon.',
    'User sleeps better on weekends.',
    'User consistently completes morning habits.',
  ],

  // Streaks
  streaks: {
    hydration: 4,
    sleep: 6,
    habits: 8,
    overall: 12,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'LOGIN':
      return { ...state, isAuthenticated: true, user: action.payload };
    case 'LOGOUT':
      return { ...initialState };
    case 'COMPLETE_ONBOARDING':
      return { ...state, hasOnboarded: true, profile: { ...state.profile, ...action.payload } };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'ADD_HYDRATION':
      return {
        ...state,
        today: {
          ...state.today,
          hydration: {
            ...state.today.hydration,
            intake: Math.min(state.today.hydration.intake + action.payload, state.today.hydration.goal * 1.5),
          },
        },
      };
    case 'SET_HYDRATION':
      return {
        ...state,
        today: {
          ...state.today,
          hydration: { ...state.today.hydration, intake: action.payload },
        },
      };
    case 'LOG_SLEEP':
      return {
        ...state,
        today: { ...state.today, sleep: { ...action.payload, logged: true } },
        history: {
          ...state.history,
          sleep: [...state.history.sleep.slice(1), action.payload.duration],
        },
      };
    case 'TOGGLE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h =>
          h.id === action.payload
            ? { ...h, completedToday: !h.completedToday, streak: !h.completedToday ? h.streak + 1 : h.streak - 1 }
            : h
        ),
      };
    case 'ADD_HABIT':
      return {
        ...state,
        habits: [...state.habits, { ...action.payload, id: Date.now().toString(), streak: 0, completedToday: false }],
      };
    case 'LOG_MEAL':
      return {
        ...state,
        today: { ...state.today, meals: [...state.today.meals, action.payload] },
      };
    case 'SET_MOOD':
      return { ...state, today: { ...state.today, mood: action.payload } };
    case 'ADD_MEMORY':
      return {
        ...state,
        aiMemory: [action.payload, ...state.aiMemory.slice(0, 9)],
      };
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  async function loadState() {
    try {
      const saved = await AsyncStorage.getItem('aurora_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Reset today if it's a new day
        if (parsed.today?.date !== new Date().toDateString()) {
          parsed.today = { ...initialState.today, date: new Date().toDateString() };
        }
        dispatch({ type: 'SET_STATE', payload: parsed });
      }
    } catch (e) {}
  }

  async function saveState(s) {
    try {
      await AsyncStorage.setItem('aurora_state', JSON.stringify(s));
    } catch (e) {}
  }

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
