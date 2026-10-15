import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchLeaderboard, isSupabaseConnected, isGoogleSheetsConnected } from '../lib/database';
import type { LeaderboardEntry } from '../lib/database';
import { soundFx } from '../lib/audio';
import { useStore } from '../store/useStore';
import { 
  Trophy, 
  Clock, 
  X, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  Users,
  Download,
  RotateCcw
} from 'lucide-react';

export const LeaderboardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { resetMissionProgress } = useStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchLeaderboard();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleExportCSV = () => {
    if (entries.length === 0) return;
    soundFx.playClick();
    const headers = ['Rank', 'Team Code', 'Team Name', 'Time Taken (Seconds)', 'Formatted Time', 'Challenges Completed', 'Status', 'Completed At'];
    const rows = entries.map((entry, index) => [
      index + 1,
      `"${entry.team_code}"`,
      `"${entry.team_name}"`,
      entry.time_taken_seconds,
      `"${entry.formatted_time}"`,
      entry.challenges_completed,
      `"${entry.status}"`,
      `"${entry.completed_at}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mission_leaderboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="relative w-full max-w-4xl bg-[#0f172a] border-2 border-yellow-400/80 rounded-2xl p-6 md:p-8 shadow-[0_0_60px_rgba(250,204,21,0.35)] text-white"
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-yellow-500/40 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/20 border border-yellow-400 rounded-xl text-yellow-400">
              <Trophy size={28} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-yellow-300">
                MISSION LEADERBOARD // WINNERS BOARD
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 mt-1">
                <span>RANKED BY LEAST TIME TAKEN TO COMPLETE RECOVERY</span>
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-cyan-400/50 bg-cyan-950/60 text-cyan-300">
                  <Database size={11} />
                  {isGoogleSheetsConnected 
                    ? 'GOOGLE SHEETS CLOUD' 
                    : isSupabaseConnected 
                    ? 'POSTGRESQL CLOUD' 
                    : 'LOCAL PERSISTENT STORE'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('ADMIN OVERRIDE: Reset current mission progress and restart from the beginning for a new team?')) {
                  soundFx.playAlarm();
                  resetMissionProgress();
                  onClose();
                }
              }}
              title="Admin Reset Progress for New Team"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-500/60 rounded-lg text-red-300 text-xs font-bold transition-all"
            >
              <RotateCcw size={14} />
              <span>RESET RUN</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={entries.length === 0}
              title="Download results as Excel/CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400/60 rounded-lg text-emerald-300 text-xs font-bold transition-all disabled:opacity-40"
            >
              <Download size={14} />
              <span>EXPORT CSV</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                loadData();
              }}
              title="Refresh Leaderboard"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="py-12 text-center text-yellow-300 font-bold tracking-widest animate-pulse">
              SYNCING TELEMETRY FROM DATABASE...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-gray-400 tracking-wider">
              NO TEAMS HAVE COMPLETED THE RECOVERY MISSION YET.
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => {
                const isWinner = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;

                return (
                  <div
                    key={entry.team_code + index}
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border-2 transition-all ${
                      isWinner
                        ? 'bg-yellow-950/40 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.25)]'
                        : isSecond
                        ? 'bg-slate-800/80 border-slate-300'
                        : isThird
                        ? 'bg-amber-950/30 border-amber-600'
                        : 'bg-black/60 border-slate-700'
                    }`}
                  >
                    {/* Left: Rank & Team */}
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isWinner
                          ? 'bg-yellow-400 text-black'
                          : isSecond
                          ? 'bg-slate-300 text-black'
                          : isThird
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-gray-300'
                      }`}>
                        {index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base tracking-widest text-white">
                            {entry.team_code}
                          </span>
                          {isWinner && (
                            <span className="px-2 py-0.5 bg-yellow-400 text-black text-[10px] font-bold rounded">
                              WINNER 🏆
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 tracking-wider">
                          {entry.team_name}
                        </div>
                      </div>
                    </div>

                    {/* Right: Time Taken & Status */}
                    <div className="flex items-center gap-6 mt-3 sm:mt-0">
                      <div className="flex items-center gap-2 bg-black/60 px-3.5 py-1.5 rounded-lg border border-gray-700">
                        <Clock size={16} className="text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-300 tracking-widest">
                          {entry.formatted_time}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          ({entry.time_taken_seconds}s)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <CheckCircle2 size={16} />
                        <span>3/3 SOLVED</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center border-t border-gray-700 pt-4 mt-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-yellow-400" />
            <span>TOTAL TEAMS RECORDED: {entries.length}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundFx.playClick();
                loadData();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-white font-bold transition-all"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>REFRESH</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all"
            >
              CLOSE
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LeaderboardModal;
