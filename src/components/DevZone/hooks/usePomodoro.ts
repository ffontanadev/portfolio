import { useCallback, useEffect, useState } from 'react';

export type PomodoroPhase = 'work' | 'break';

export interface PomodoroConfig {
  /** Length of a focus session, in minutes. */
  workMinutes: number;
  /** Length of a break, in minutes. */
  breakMinutes: number;
  /** Target number of focus sessions to complete in a day. */
  dailyGoal: number;
}

export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  workMinutes: 25,
  breakMinutes: 5,
  dailyGoal: 8,
};

interface PersistedPomodoro {
  config: PomodoroConfig;
  completedToday: number;
  /** ISO date (yyyy-mm-dd) the count belongs to, for daily reset. */
  date: string;
}

const STORAGE_KEY = 'portfolio.devzone.pomodoro.v1';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function clampMinutes(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(180, Math.max(1, Math.round(value)));
}

function readPersisted(): PersistedPomodoro {
  const fallback: PersistedPomodoro = {
    config: DEFAULT_POMODORO_CONFIG,
    completedToday: 0,
    date: todayKey(),
  };
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedPomodoro>;
    const config = parsed.config ?? DEFAULT_POMODORO_CONFIG;
    const sameDay = parsed.date === todayKey();
    return {
      config: {
        workMinutes: clampMinutes(config.workMinutes ?? DEFAULT_POMODORO_CONFIG.workMinutes),
        breakMinutes: clampMinutes(config.breakMinutes ?? DEFAULT_POMODORO_CONFIG.breakMinutes),
        dailyGoal: Math.min(
          24,
          Math.max(1, Math.round(config.dailyGoal ?? DEFAULT_POMODORO_CONFIG.dailyGoal)),
        ),
      },
      completedToday: sameDay && typeof parsed.completedToday === 'number' ? parsed.completedToday : 0,
      date: todayKey(),
    };
  } catch {
    return fallback;
  }
}

export interface PomodoroApi {
  phase: PomodoroPhase;
  secondsLeft: number;
  isRunning: boolean;
  completedToday: number;
  config: PomodoroConfig;
  toggle: () => void;
  reset: () => void;
  skip: () => void;
  updateConfig: (next: PomodoroConfig) => void;
  goalReached: boolean;
}

/**
 * A Pomodoro timer whose configuration (work/break length, daily goal) and daily
 * progress persist to localStorage. The countdown itself lives in memory and
 * restarts the current phase on reload; completed-session progress is restored
 * and reset automatically when the calendar day rolls over.
 */
export function usePomodoro(): PomodoroApi {
  // Read persisted state once per slice via lazy initializers (readPersisted is
  // cheap and idempotent — it just parses one localStorage entry).
  const [config, setConfig] = useState<PomodoroConfig>(() => readPersisted().config);
  const [completedToday, setCompletedToday] = useState(() => readPersisted().completedToday);
  const [date, setDate] = useState(() => readPersisted().date);
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [secondsLeft, setSecondsLeft] = useState(() => readPersisted().config.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Persist config + daily progress whenever they change.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload: PersistedPomodoro = { config, completedToday, date };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore storage failures */
    }
  }, [config, completedToday, date]);

  const advancePhase = useCallback(() => {
    setPhase((current) => {
      if (current === 'work') {
        setCompletedToday((count) => count + 1);
        setSecondsLeft(config.breakMinutes * 60);
        return 'break';
      }
      setSecondsLeft(config.workMinutes * 60);
      return 'work';
    });
  }, [config.breakMinutes, config.workMinutes]);

  // The ticking loop.
  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((remaining) => {
        if (remaining <= 1) {
          advancePhase();
          return 0; // advancePhase resets to the next phase length.
        }
        return remaining - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning, advancePhase]);

  // Roll the daily counter over at midnight if the tab stays open.
  useEffect(() => {
    const check = window.setInterval(() => {
      const current = todayKey();
      setDate((prev) => {
        if (prev !== current) {
          setCompletedToday(0);
          return current;
        }
        return prev;
      });
    }, 60_000);
    return () => window.clearInterval(check);
  }, []);

  const toggle = useCallback(() => setIsRunning((running) => !running), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setPhase('work');
    setSecondsLeft(config.workMinutes * 60);
  }, [config.workMinutes]);

  const skip = useCallback(() => {
    setIsRunning(false);
    advancePhase();
  }, [advancePhase]);

  const updateConfig = useCallback((next: PomodoroConfig) => {
    const sanitized: PomodoroConfig = {
      workMinutes: clampMinutes(next.workMinutes),
      breakMinutes: clampMinutes(next.breakMinutes),
      dailyGoal: Math.min(24, Math.max(1, Math.round(next.dailyGoal))),
    };
    setConfig(sanitized);
    // Re-anchor the visible timer to the new lengths while idle.
    setIsRunning(false);
    setPhase('work');
    setSecondsLeft(sanitized.workMinutes * 60);
  }, []);

  return {
    phase,
    secondsLeft,
    isRunning,
    completedToday,
    config,
    toggle,
    reset,
    skip,
    updateConfig,
    goalReached: completedToday >= config.dailyGoal,
  };
}
