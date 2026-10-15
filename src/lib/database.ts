import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface LeaderboardEntry {
  id?: string;
  team_code: string;
  team_name: string;
  time_taken_seconds: number;
  formatted_time: string;
  challenges_completed: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'DISQUALIFIED';
  completed_at: string;
}

export interface TeamRecord {
  team_code: string;
  team_name: string;
  password: string;
  attempts_used: number;
  is_disqualified: boolean;
}

// Default initial teams
export const DEFAULT_TEAMS: TeamRecord[] = [
  { team_code: 'TEAM-001', team_name: 'ALPHA SQUADRON', password: '123', attempts_used: 0, is_disqualified: false },
  { team_code: 'TEAM-002', team_name: 'BRAVO TACTICAL', password: '456', attempts_used: 0, is_disqualified: false },
  { team_code: 'TEAM-TEST', team_name: 'CYBER SPECIALIST', password: '999', attempts_used: 0, is_disqualified: false },
  { team_code: 'GHOST-01', team_name: 'SPECTRE OPERATIVE', password: '777', attempts_used: 0, is_disqualified: false },
];

const LOCAL_LEADERBOARD_KEY = 'mission_ai_leaderboard_v1';

// Initialize Google Sheets Web App if environment variable is provided
const googleSheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;
export const isGoogleSheetsConnected = Boolean(
  googleSheetsUrl &&
  !googleSheetsUrl.includes('placeholder') &&
  !googleSheetsUrl.includes('your-script')
);

// Initialize Supabase if environment variables are provided
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConnected = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConnected
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Local fallback getters and setters
function getLocalLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      team_code: 'TEAM-002',
      team_name: 'BRAVO TACTICAL',
      time_taken_seconds: 214,
      formatted_time: '03m 34s',
      challenges_completed: 3,
      status: 'COMPLETED',
      completed_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      team_code: 'TEAM-TEST',
      team_name: 'CYBER SPECIALIST',
      time_taken_seconds: 345,
      formatted_time: '05m 45s',
      challenges_completed: 3,
      status: 'COMPLETED',
      completed_at: new Date(Date.now() - 7200000).toISOString(),
    }
  ];
}

function saveLocalLeaderboard(data: LeaderboardEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(data));
  } catch {}
}

/**
 * Record a team's completion time upon solving all challenges
 */
export async function recordTeamCompletion(
  teamCode: string,
  timeTakenSeconds: number,
  challengesCompleted: number = 3
): Promise<{ success: boolean; entry: LeaderboardEntry }> {
  const m = Math.floor(timeTakenSeconds / 60).toString().padStart(2, '0');
  const s = (timeTakenSeconds % 60).toString().padStart(2, '0');
  const formatted_time = `${m}m ${s}s`;

  const newEntry: LeaderboardEntry = {
    team_code: teamCode.toUpperCase(),
    team_name: teamCode.toUpperCase() === 'TEAM-001' ? 'ALPHA SQUADRON' :
               teamCode.toUpperCase() === 'TEAM-002' ? 'BRAVO TACTICAL' :
               teamCode.toUpperCase() === 'TEAM-TEST' ? 'CYBER SPECIALIST' :
               teamCode.toUpperCase() === 'GHOST-01' ? 'SPECTRE OPERATIVE' : 'RECOVERY UNIT',
    time_taken_seconds: timeTakenSeconds,
    formatted_time,
    challenges_completed: challengesCompleted,
    status: 'COMPLETED',
    completed_at: new Date().toISOString(),
  };

  // 1. Save to Google Sheets if connected
  if (isGoogleSheetsConnected && googleSheetsUrl) {
    try {
      await fetch(googleSheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(newEntry),
        mode: 'no-cors'
      });
      console.log('[Database] Team completion synced to Google Sheets:', newEntry.team_code);
    } catch (err) {
      console.warn('[Database] Google Sheets save warning:', err);
    }
  }

  // 2. Save to Supabase if connected
  if (supabase) {
    try {
      const { error } = await supabase
        .from('mission_leaderboard')
        .upsert({
          team_code: newEntry.team_code,
          team_name: newEntry.team_name,
          time_taken_seconds: newEntry.time_taken_seconds,
          formatted_time: newEntry.formatted_time,
          challenges_completed: newEntry.challenges_completed,
          status: newEntry.status,
          completed_at: newEntry.completed_at
        }, { onConflict: 'team_code' });

      if (error) {
        console.warn('[Database] Supabase save warning, saving locally:', error.message);
      }
    } catch (err) {
      console.warn('[Database] Supabase exception, fallback to local:', err);
    }
  }

  // 3. Always persist locally as well for immediate reliability
  const localList = getLocalLeaderboard();
  const existingIndex = localList.findIndex((item) => item.team_code === newEntry.team_code);
  if (existingIndex >= 0) {
    // Only update if current time is better or replace
    localList[existingIndex] = newEntry;
  } else {
    localList.push(newEntry);
  }
  // Sort by time taken ascending (lowest time = rank 1)
  localList.sort((a, b) => a.time_taken_seconds - b.time_taken_seconds);
  saveLocalLeaderboard(localList);

  return { success: true, entry: newEntry };
}

/**
 * Fetch leaderboard sorted by time taken (fastest teams first)
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  // 1. Try Google Sheets if connected
  if (isGoogleSheetsConnected && googleSheetsUrl) {
    try {
      const response = await fetch(googleSheetsUrl);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data as LeaderboardEntry[];
        }
      }
    } catch (err) {
      console.warn('[Database] Failed to fetch from Google Sheets, trying fallback:', err);
    }
  }

  // 2. Try Supabase if connected
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('mission_leaderboard')
        .select('*')
        .order('time_taken_seconds', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as LeaderboardEntry[];
      }
    } catch (err) {
      console.warn('[Database] Failed to fetch from Supabase, using local:', err);
    }
  }

  // 3. Return local sorted leaderboard
  const local = getLocalLeaderboard();
  local.sort((a, b) => a.time_taken_seconds - b.time_taken_seconds);
  return local;
}
