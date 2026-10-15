import { create } from 'zustand';
import { recordTeamCompletion } from '../lib/database';

export type GameState = 
  | 'BOOT' 
  | 'AUTHENTICATION' 
  | 'ADMIN_START_GATE'
  | 'CRASH_SEQUENCE' 
  | 'MISSION_START' 
  | 'COCKPIT_SIMULATOR'
  | 'MANUAL_DOCUMENT'
  | 'MISSION_EXPIRED'
  | 'DISQUALIFIED';

export const TOTAL_MISSION_SECONDS = 12 * 60; // 720 seconds
const LOCAL_PROGRESS_KEY = 'mission_ai_team_progress_v2';

interface StoredProgress {
  gameState: GameState;
  teamId: string | null;
  attemptsRemaining: number;
  missionStartTime: number | null;
  isGameFinished: boolean;
  stampedTimeTakenSeconds: number | null;
  solvedChallenges: number[];
  customManualContent: string | null;
}

interface StoreState {
  gameState: GameState;
  teamId: string | null;
  attemptsRemaining: number;
  remainingTime: number; // in seconds, starting at 12 * 60 = 720
  missionStartTime: number | null; // epoch timestamp in ms when 12-min clock started
  isTimerRunning: boolean;
  isGameFinished: boolean;
  stampedTimeTakenSeconds: number | null;
  isAudioPopupOpen: boolean;
  soundEnabled: boolean;
  cockpitPitch: number;
  cockpitRoll: number;
  solvedChallenges: number[];
  customManualContent: string | null;
  isLeaderboardOpen: boolean;

  setGameState: (state: GameState) => void;
  setTeamId: (id: string) => void;
  decrementAttempts: () => void;
  setRemainingTime: (time: number) => void;
  decrementRemainingTime: () => void;
  toggleSound: () => void;
  setCockpitAttitude: (pitch: number, roll: number) => void;
  markChallengeSolved: (id: number) => void;
  resetChallenges: () => void;
  setCustomManualContent: (content: string) => void;
  setIsLeaderboardOpen: (open: boolean) => void;
  setIsAudioPopupOpen: (open: boolean) => void;
  startGlobalTimer: () => void;
  stampFinalVictory: () => { timeTaken: number; formattedTime: string };
  resetMissionProgress: () => void;
}

/**
 * Load persisted game state and compute accurate remaining time
 * based on absolute epoch timestamp to prevent refresh cheating or progress loss.
 */
function loadProgressFromStorage(): {
  gameState?: GameState;
  teamId?: string | null;
  attemptsRemaining?: number;
  missionStartTime?: number | null;
  remainingTime?: number;
  isTimerRunning?: boolean;
  isGameFinished?: boolean;
  stampedTimeTakenSeconds?: number | null;
  solvedChallenges?: number[];
  customManualContent?: string | null;
} {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
    if (!raw) return {};
    const parsed: StoredProgress = JSON.parse(raw);

    let remainingTime = TOTAL_MISSION_SECONDS;
    let isTimerRunning = false;
    let gameState: GameState = parsed.gameState || 'BOOT';

    if (parsed.isGameFinished && parsed.stampedTimeTakenSeconds) {
      remainingTime = Math.max(0, TOTAL_MISSION_SECONDS - parsed.stampedTimeTakenSeconds);
      isTimerRunning = false;
    } else if (parsed.missionStartTime) {
      const elapsed = Math.floor((Date.now() - parsed.missionStartTime) / 1000);
      remainingTime = Math.max(0, TOTAL_MISSION_SECONDS - elapsed);
      if (remainingTime <= 0) {
        remainingTime = 0;
        isTimerRunning = false;
        gameState = 'MISSION_EXPIRED';
      } else {
        isTimerRunning = true;
        // If reloaded during intermediate transition, jump straight to active mission radar
        if (gameState === 'CRASH_SEQUENCE') {
          gameState = 'MISSION_START';
        }
      }
    }

    return {
      gameState,
      teamId: parsed.teamId || null,
      attemptsRemaining: typeof parsed.attemptsRemaining === 'number' ? parsed.attemptsRemaining : 2,
      missionStartTime: parsed.missionStartTime || null,
      remainingTime,
      isTimerRunning,
      isGameFinished: Boolean(parsed.isGameFinished),
      stampedTimeTakenSeconds: parsed.stampedTimeTakenSeconds || null,
      solvedChallenges: Array.isArray(parsed.solvedChallenges) ? parsed.solvedChallenges : [],
      customManualContent: parsed.customManualContent || null,
    };
  } catch (e) {
    console.warn('[Progress] Failed to load progress from localStorage:', e);
    return {};
  }
}

/**
 * Save critical mission state to localStorage so reloading restores exact progress
 */
function saveProgressToStorage(state: StoreState) {
  if (typeof window === 'undefined') return;
  try {
    const data: StoredProgress = {
      gameState: state.gameState,
      teamId: state.teamId,
      attemptsRemaining: state.attemptsRemaining,
      missionStartTime: state.missionStartTime,
      isGameFinished: state.isGameFinished,
      stampedTimeTakenSeconds: state.stampedTimeTakenSeconds,
      solvedChallenges: state.solvedChallenges,
      customManualContent: state.customManualContent,
    };
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[Progress] Failed to save progress to localStorage:', e);
  }
}

const initial = loadProgressFromStorage();

export const useStore = create<StoreState>((set, get) => ({
  gameState: initial.gameState || 'BOOT',
  teamId: initial.teamId ?? null,
  attemptsRemaining: initial.attemptsRemaining ?? 2,
  remainingTime: initial.remainingTime ?? TOTAL_MISSION_SECONDS,
  missionStartTime: initial.missionStartTime ?? null,
  isTimerRunning: initial.isTimerRunning ?? false,
  isGameFinished: initial.isGameFinished ?? false,
  stampedTimeTakenSeconds: initial.stampedTimeTakenSeconds ?? null,
  isAudioPopupOpen: Boolean(initial.isGameFinished),
  soundEnabled: true,
  cockpitPitch: 0,
  cockpitRoll: 0,
  solvedChallenges: initial.solvedChallenges ?? [],
  customManualContent: initial.customManualContent ?? null,
  isLeaderboardOpen: false,

  setGameState: (state) => {
    const current = get();
    // Timer starts only after admin gate authorization (when entering CRASH_SEQUENCE)
    if (state === 'CRASH_SEQUENCE' && !current.isTimerRunning && !current.isGameFinished) {
      const startTime = current.missionStartTime || Date.now();
      set({ isTimerRunning: true, missionStartTime: startTime, gameState: state });
      return;
    }
    set({ gameState: state });
  },

  setTeamId: (id) => set({ teamId: id }),
  decrementAttempts: () => set((state) => ({ attemptsRemaining: Math.max(0, state.attemptsRemaining - 1) })),
  setRemainingTime: (time) => set({ remainingTime: time }),

  // Clock tick recalculates from missionStartTime to prevent clock drift and cheating
  decrementRemainingTime: () => {
    const { isTimerRunning, isGameFinished, missionStartTime, remainingTime } = get();
    if (!isTimerRunning || isGameFinished) return;

    if (missionStartTime) {
      const elapsed = Math.floor((Date.now() - missionStartTime) / 1000);
      const remaining = Math.max(0, TOTAL_MISSION_SECONDS - elapsed);
      if (remaining <= 0) {
        set({ remainingTime: 0, isTimerRunning: false, gameState: 'MISSION_EXPIRED' });
      } else {
        set({ remainingTime: remaining });
      }
    } else {
      if (remainingTime <= 1) {
        set({ remainingTime: 0, isTimerRunning: false, gameState: 'MISSION_EXPIRED' });
      } else {
        set({ remainingTime: remainingTime - 1 });
      }
    }
  },

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setCockpitAttitude: (pitch, roll) => set({ cockpitPitch: pitch, cockpitRoll: roll }),

  markChallengeSolved: (id) => {
    set((state) => {
      const next = state.solvedChallenges.includes(id) 
        ? state.solvedChallenges 
        : [...state.solvedChallenges, id];
      return { solvedChallenges: next };
    });
  },

  resetChallenges: () => set({ 
    solvedChallenges: [], 
    isGameFinished: false, 
    stampedTimeTakenSeconds: null,
    isAudioPopupOpen: false 
  }),

  setCustomManualContent: (content) => set({ customManualContent: content }),
  setIsLeaderboardOpen: (open) => set({ isLeaderboardOpen: open }),
  setIsAudioPopupOpen: (open) => set({ isAudioPopupOpen: open }),

  startGlobalTimer: () => {
    const current = get();
    const startTime = current.missionStartTime || Date.now();
    set({ isTimerRunning: true, missionStartTime: startTime });
  },

  // Called the exact second the audio file pops up (game ends here!)
  stampFinalVictory: () => {
    const state = get();
    const elapsed = state.missionStartTime
      ? Math.floor((Date.now() - state.missionStartTime) / 1000)
      : Math.max(1, TOTAL_MISSION_SECONDS - state.remainingTime);
    const timeTaken = Math.min(TOTAL_MISSION_SECONDS, Math.max(1, elapsed));

    const m = Math.floor(timeTaken / 60).toString().padStart(2, '0');
    const s = (timeTaken % 60).toString().padStart(2, '0');
    const formattedTime = `${m}m ${s}s`;

    set({
      isTimerRunning: false,
      isGameFinished: true,
      stampedTimeTakenSeconds: timeTaken,
      remainingTime: Math.max(0, TOTAL_MISSION_SECONDS - timeTaken),
      isAudioPopupOpen: true,
    });

    const teamCode = state.teamId || 'TEAM-001';
    recordTeamCompletion(teamCode, timeTaken, 3).catch(console.error);

    return { timeTaken, formattedTime };
  },

  // Admin action: reset progress when ready for next team
  resetMissionProgress: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_PROGRESS_KEY);
    }
    set({
      gameState: 'BOOT',
      teamId: null,
      attemptsRemaining: 2,
      remainingTime: TOTAL_MISSION_SECONDS,
      missionStartTime: null,
      isTimerRunning: false,
      isGameFinished: false,
      stampedTimeTakenSeconds: null,
      isAudioPopupOpen: false,
      soundEnabled: true,
      cockpitPitch: 0,
      cockpitRoll: 0,
      solvedChallenges: [],
      customManualContent: null,
      isLeaderboardOpen: false,
    });
  },
}));

// Automatically persist state changes to localStorage so page reloads never lose progress
useStore.subscribe((state) => {
  saveProgressToStorage(state);
});
