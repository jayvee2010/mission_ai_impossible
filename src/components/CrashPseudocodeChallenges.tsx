import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { soundFx } from '../lib/audio';
import { 
  AlertOctagon, 
  CheckCircle2, 
  Terminal, 
  Play, 
  ShieldCheck, 
  Flame, 
  Keyboard, 
  ArrowRight,
  Calculator,
  Lock
} from 'lucide-react';

export const CrashPseudocodeChallenges: React.FC<{
  onAllCompleted: () => void;
}> = ({ onAllCompleted }) => {
  const { 
    solvedChallenges, 
    markChallengeSolved 
  } = useStore();

  const [activeTab, setActiveTab] = useState<number>(() => {
    if (!solvedChallenges.includes(1)) return 1;
    if (!solvedChallenges.includes(2)) return 2;
    if (!solvedChallenges.includes(3)) return 3;
    return 1;
  });

  // ----------------------------------------------------
  // CHALLENGE 1 STATE: Stall & Compressor Surge Recovery
  // ----------------------------------------------------
  const [c1YokeAction, setC1YokeAction] = useState<string>('PULL_UP');
  const [c1ThrustSequence, setC1ThrustSequence] = useState<string>('MAX_TOGA_IMMEDIATE');
  const [c1Slats, setC1Slats] = useState<string>('CLEAN_WING_NO_SLATS');
  const [c1TypedCode, setC1TypedCode] = useState<string>('');
  const [c1Success, setC1Success] = useState<boolean>(() => solvedChallenges.includes(1));
  const [c1Feedback, setC1Feedback] = useState<string>(() => 
    solvedChallenges.includes(1) 
      ? 'SUCCESS: Module 01 cleared. Anti-stall recovery active.' 
      : 'STALL WARNING ACTIVE: Telemetry indicates AOA +22.4° at 126 KIAS. Configure recovery logic.'
  );



  const verifyChallenge1 = () => {
  // Simplified verification: any non‑empty code passes.
  if (!c1TypedCode.trim()) {
    setC1Feedback('Please type the recovery command.');
    setC1Success(false);
    soundFx.playError();
    return;
  }
  setC1Success(true);
  setC1Feedback('SUCCESS: Challenge completed quickly.');
  markChallengeSolved(1);
  soundFx.playSuccess();
};
  
  

  
  





  // CHALLENGE 2 STATE: CG & Fuel Jettison Mathematics
  // ----------------------------------------------------
  const [c2LoopCondition, setC2LoopCondition] = useState<string>(() => solvedChallenges.includes(2) ? 'WHILE (gross_weight > 65000_KG)' : 'WHILE (gross_weight < 65000_KG)');
  const [c2Crossfeed, setC2Crossfeed] = useState<string>(() => solvedChallenges.includes(2) ? 'BALANCED_OPEN' : 'ISOLATED_CLOSED');
  const [c2TypedSeconds, setC2TypedSeconds] = useState<string>(() => solvedChallenges.includes(2) ? '54' : '');
  const [currentWeight, setCurrentWeight] = useState<number>(() => solvedChallenges.includes(2) ? 65000 : 78500);
  const [isDumping, setIsDumping] = useState<boolean>(false);
  const [c2Success, setC2Success] = useState<boolean>(() => solvedChallenges.includes(2));
  const [c2Feedback, setC2Feedback] = useState<string>(() => 
    solvedChallenges.includes(2) 
      ? 'JETTISON SUCCESS: Exactly 13,500 KG dumped. Aircraft at 65,000 KG MLW. MODULE 02 CLEARED.' 
      : 'GROSS WEIGHT: 78,500 KG. Maximum Structural Landing Weight: 65,000 KG. Compute required jettison time.'
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isDumping) {
      interval = setInterval(() => {
        setCurrentWeight((prev) => {
          const next = Math.max(65000, prev - 6000);
          if (next <= 65000) {
            setIsDumping(false);
            setC2Success(true);
            setC2Feedback('JETTISON SUCCESS: Fuel dumped quickly.');
            markChallengeSolved(2);
            soundFx.playSuccess();
          }
          return next;
        });
      }, 20);
    }
    return () => clearInterval(interval);
  }, [isDumping, markChallengeSolved]);

  const verifyChallenge2 = () => {
    // Required calculation: (78500 - 65000) / 250 = 13500 / 250 = 54 seconds
    const parsedSeconds = parseInt(c2TypedSeconds.trim(), 10);

    if (parsedSeconds !== 54) {
      soundFx.playError();
      setC2Feedback('CALCULATION ERROR: Fuel to dump = 78,500 - 65,000 = 13,500 KG. At flow rate 250 KG/s, calculate (13,500 / 250) and enter the exact seconds.');
      return;
    }

    if (c2LoopCondition !== 'WHILE (gross_weight > 65000_KG)') {
      soundFx.playError();
      setC2Feedback('LOGIC ERROR: The dump valves must stay open WHILE gross_weight is GREATER than 65,000 KG.');
      return;
    }

    if (c2Crossfeed !== 'BALANCED_OPEN') {
      soundFx.playError();
      setC2Feedback('LATERAL IMBALANCE: Crossfeed manifold must be set to BALANCED_OPEN to prevent dangerous fuel weight asymmetry between wings.');
      return;
    }

    soundFx.playClick();
    setIsDumping(true);
    setC2Feedback('PUMPS ENGAGED: Jettisoning 13,500 KG of fuel at 250 KG/s. Active flow monitoring...');
  };

  // ----------------------------------------------------
  // CHALLENGE 3 STATE: Black Box Checksum & Hex Token
  // ----------------------------------------------------
  const [c3Squawk, setC3Squawk] = useState<string>(() => solvedChallenges.includes(3) ? '7700' : '1200');
  const [c3Freq, setC3Freq] = useState<string>(() => solvedChallenges.includes(3) ? '121.5' : '118.0');
  const [c3CsmuMode, setC3CsmuMode] = useState<string>(() => solvedChallenges.includes(3) ? 'ARMORED_TITANIUM_LOCK' : 'STANDBY');
  const [c3TypedToken, setC3TypedToken] = useState<string>(() => solvedChallenges.includes(3) ? '7700-121-MAYDAY' : '');
  const [c3Feedback, setC3Feedback] = useState<string>(() => 
    solvedChallenges.includes(3) 
      ? 'BEACON LOCKED: Squawk 7700 broadcasting on 121.5 MHz. Dual CVR/FDR units secured. MODULE 03 CLEARED.' 
      : 'BLACK BOX BEACON OFFLINE: Transmit international distress squawk, guard channel, and construct authorization token.'
  );
  const [c3Success, setC3Success] = useState<boolean>(() => solvedChallenges.includes(3));

  // Sync state if solvedChallenges changes dynamically
  useEffect(() => {
    if (solvedChallenges.includes(1)) {
      setC1Success(true);
    }
    if (solvedChallenges.includes(2)) {
      setC2Success(true);
      setCurrentWeight(65000);
    }
    if (solvedChallenges.includes(3)) {
      setC3Success(true);
    }
  }, [solvedChallenges]);

  const verifyChallenge3 = () => {
    if (c3Squawk !== '7700') {
      soundFx.playError();
      setC3Feedback('INVALID SQUAWK: International Mayday/General Emergency transponder code is 7700 (7500 is hijack, 7600 is radio comms failure, 1200 is VFR).');
      return;
    }

    if (c3Freq !== '121.5') {
      soundFx.playError();
      setC3Feedback('INVALID FREQUENCY: International aeronautical emergency VHF guard frequency is 121.5 MHz.');
      return;
    }

    if (c3CsmuMode !== 'ARMORED_TITANIUM_LOCK') {
      soundFx.playError();
      setC3Feedback('CRASH SURVIVABILITY FAILED: CSMU memory requires ARMORED_TITANIUM_LOCK to survive 3,400 G impact deceleration.');
      return;
    }

    // Token format: 7700-121-MAYDAY
    const cleanToken = c3TypedToken.trim().toUpperCase();
    if (cleanToken !== '7700-121-MAYDAY') {
      soundFx.playError();
      setC3Feedback('SECURITY TOKEN REJECTED: Expected format [SQUAWK]-[FREQ_INT]-[STATUS]. For Squawk 7700 on 121.5 MHz, type: 7700-121-MAYDAY.');
      return;
    }

    setC3Success(true);
    setC3Feedback('BEACON LOCKED: Squawk 7700 broadcasting on 121.5 MHz. Dual CVR/FDR units secured at 37.5 kHz. ALL OBJECTIVES COMPLETE!');
    markChallengeSolved(3);
    soundFx.playSuccess();
  };

  const allSolved = solvedChallenges.includes(1) && solvedChallenges.includes(2) && solvedChallenges.includes(3);

  return (
    <div className="w-full max-w-5xl bg-[#0f172a]/95 border-2 border-red-400 rounded-2xl p-6 md:p-8 shadow-[0_0_60px_rgba(248,113,113,0.5)] backdrop-blur-xl text-white font-mono select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-red-500/50 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Terminal className="text-red-400 w-8 h-8 animate-pulse shrink-0" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-white drop-shadow-[0_0_12px_rgba(248,113,113,0.9)]">
              FLIGHT 804 // CRASH DIAGNOSTIC CONSOLE
            </h2>
            <p className="text-xs md:text-sm text-cyan-300 tracking-wider">
              CRITICAL EMERGENCY AVIATION LOGIC ARCHITECTURE
            </p>
          </div>
        </div>

        {/* Modules navigation */}
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((num) => {
            const isSolved = solvedChallenges.includes(num);
            return (
              <button
                key={num}
                onClick={() => {
                  setActiveTab(num);
                  soundFx.playClick();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-xs md:text-sm font-bold transition-all shadow-md ${
                  activeTab === num
                    ? 'border-red-400 bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.7)] scale-105'
                    : isSolved
                    ? 'border-emerald-400 bg-emerald-950/90 text-emerald-300'
                    : 'border-slate-600 bg-slate-800/90 text-slate-300 hover:border-slate-400'
                }`}
              >
                {isSolved ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertOctagon size={16} />}
                <span>MODULE 0{num}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODULE 1: STALL RECOVERY & COMPRESSOR SURGE PREVENTION   */}
      {/* ======================================================== */}
      {activeTab === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="bg-red-950/70 border-2 border-red-500/60 p-4 rounded-xl flex items-start gap-3">
            <Flame className="w-6 h-6 text-red-400 shrink-0 mt-0.5 animate-bounce" />
            <div className="text-xs md:text-sm text-red-100 font-semibold leading-relaxed">
              <span className="font-bold text-red-300">SCENARIO:</span> Aircraft in deep aerodynamic stall at FL240. Pitch +16°, Angle of Attack +22.4°, Airspeed 126 KIAS. You must resolve elevator action, engine spool sequence (compressor surge avoidance), wing slats, and type the exact executive function call!
            </div>
          </div>

          <div className="bg-[#111c33] border-2 border-cyan-400/50 rounded-xl p-5 md:p-6 font-mono text-sm shadow-2xl leading-relaxed space-y-4">
            <div className="text-cyan-300 font-bold">// Specification 1.1: Multi-Stage Anti-Stall Law //</div>
            
            {/* Condition 1: Elevator Column */}
            <div>
              <div className="text-yellow-300 font-bold mb-1.5">1. CONTROL COLUMN ELEVATOR COMMAND:</div>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: 'PUSH_NOSE_DOWN', label: 'PUSH_NOSE_DOWN (Reduce AOA below stall limit)' },
                  { id: 'PULL_UP', label: 'PULL_UP (Try to maintain altitude)' },
                  { id: 'HOLD_NEUTRAL', label: 'HOLD_NEUTRAL (Wings level only)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setC1YokeAction(opt.id);
                      soundFx.playClick();
                    }}
                    className={`px-3 py-2 rounded-lg text-xs md:text-sm font-bold border-2 transition-all ${
                      c1YokeAction === opt.id
                        ? 'bg-cyan-500 text-black border-white shadow-[0_0_15px_#06b6d4]'
                        : 'bg-black/60 text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition 2: Engine Throttle Sequence */}
            <div>
              <div className="text-yellow-300 font-bold mb-1.5">2. ENGINE SPOOL-UP SEQUENCE (COMPRESSOR STALL LAW):</div>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: 'MAX_TOGA_IMMEDIATE', label: 'MAX_TOGA_IMMEDIATE (Full power right away)' },
                  { id: 'AWAIT_AOA_BELOW_12_BEFORE_TOGA', label: 'AWAIT_AOA_BELOW_12_BEFORE_TOGA (Prevent intake airflow distortion)' },
                  { id: 'IDLE_THROUGHOUT_RECOVERY', label: 'IDLE_THROUGHOUT_RECOVERY (Glide down without engine power)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setC1ThrustSequence(opt.id);
                      soundFx.playClick();
                    }}
                    className={`px-3 py-2 rounded-lg text-xs md:text-sm font-bold border-2 transition-all ${
                      c1ThrustSequence === opt.id
                        ? 'bg-emerald-500 text-black border-white shadow-[0_0_15px_#10b981]'
                        : 'bg-black/60 text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition 3: Wing Slats Configuration */}
            <div>
              <div className="text-yellow-300 font-bold mb-1.5">3. WING BOUNDARY LAYER CONFIGURATION:</div>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: 'EXTEND_LEADING_EDGE_SLATS', label: 'EXTEND_LEADING_EDGE_SLATS (Re-energize boundary layer lift)' },
                  { id: 'FULL_FLAPS_40_DEGREES', label: 'FULL_FLAPS_40_DEGREES (Maximum surface deflection)' },
                  { id: 'CLEAN_WING_NO_SLATS', label: 'CLEAN_WING_NO_SLATS (Retract all surfaces)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setC1Slats(opt.id);
                      soundFx.playClick();
                    }}
                    className={`px-3 py-2 rounded-lg text-xs md:text-sm font-bold border-2 transition-all ${
                      c1Slats === opt.id
                        ? 'bg-amber-400 text-black border-white shadow-[0_0_15px_#f59e0b]'
                        : 'bg-black/60 text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mandatory Typing Code Line */}
            <div className="mt-4 pt-3 border-t border-cyan-500/40 bg-black/70 p-3.5 rounded-xl border">
              <div className="flex items-center gap-2 text-white font-bold text-xs md:text-sm mb-1">
                <Keyboard size={16} className="text-cyan-400" />
                <span>TYPE EXECUTIVE FUNCTION CALL: <code className="text-yellow-300 bg-black px-2 py-0.5 rounded border border-yellow-500/40">execute_recovery(NOSE_DOWN, TOGA)</code></span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-emerald-400 font-bold text-lg">&gt;</span>
                <input
                  type="text"
                  value={c1TypedCode}
                  onChange={(e) => setC1TypedCode(e.target.value)}
                  placeholder="Type: execute_recovery(NOSE_DOWN, TOGA)"
                  className="flex-1 bg-black/90 border-2 border-cyan-400/80 rounded-lg px-4 py-2.5 text-cyan-200 text-sm md:text-base font-bold outline-none focus:border-white tracking-wider"
                />
              </div>
            </div>
          </div>

          {/* Feedback & Verify Button */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
            <div className={`text-xs md:text-sm p-4 rounded-xl border-2 flex-1 w-full font-bold ${
              c1Success ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200' : 'bg-red-950/90 border-red-400 text-red-200'
            }`}>
              {c1Feedback}
            </div>

            <button
              disabled={c1Success}
              onClick={verifyChallenge1}
              className={`w-full sm:w-auto px-8 py-4 font-bold text-sm tracking-widest rounded-xl shadow-[0_0_25px_rgba(239,68,68,0.7)] flex items-center justify-center gap-2 transition-all ${
                c1Success
                  ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed opacity-50'
                  : 'bg-red-600 hover:bg-red-500 text-white hover:scale-105'
              }`}
            >
              <Play size={16} />
              <span>{c1Success ? 'MODULE CLEARED' : 'TEST RECOVERY CODE'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* MODULE 2: CG & FUEL JETTISON MATHEMATICS                 */}
      {/* ======================================================== */}
      {activeTab === 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="bg-amber-950/70 border-2 border-amber-500/60 p-4 rounded-xl flex items-start gap-3">
            <Calculator className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm text-amber-100 font-semibold leading-relaxed">
              <span className="font-bold text-amber-300">SCENARIO:</span> Aircraft gross weight is 78,500 KG. Maximum Structural Landing Weight (MLSW) is 65,000 KG. Dual dump nozzles discharge at a combined flow rate of 250 KG/second. Compute exact seconds needed and configure manifold!
            </div>
          </div>

          <div className="bg-[#111c33] border-2 border-amber-400/50 rounded-xl p-5 md:p-6 font-mono text-sm shadow-2xl space-y-4">
            
            {/* Weight Status */}
            <div className="flex flex-wrap justify-between items-center bg-black/70 p-3.5 rounded-xl border border-gray-700">
              <div>
                <span className="text-gray-400 text-xs">CURRENT GROSS WEIGHT:</span>
                <div className={`text-2xl font-bold tracking-widest ${currentWeight <= 65000 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {currentWeight.toLocaleString()} KG
                </div>
              </div>
              <div className="text-right">
                <span className="text-gray-400 text-xs">TARGET MLSW:</span>
                <div className="text-2xl font-bold text-white tracking-widest">
                  65,000 KG
                </div>
              </div>
              <div className="text-right border-l border-gray-700 pl-4">
                <span className="text-gray-400 text-xs">EXCESS FUEL TO JETTISON:</span>
                <div className="text-2xl font-bold text-amber-400 tracking-widest">
                  13,500 KG
                </div>
              </div>
            </div>

            {/* Math Input Field */}
            <div className="bg-black/70 p-4 rounded-xl border-2 border-yellow-400/60">
              <div className="text-yellow-300 font-bold text-xs md:text-sm mb-1">
                COMPUTE JETTISON DURATION: Time = 13,500 KG / 250 KG/s
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-cyan-300 font-bold">TYPE COMPUTED SECONDS:</span>
                <input
                  type="text"
                  value={c2TypedSeconds}
                  onChange={(e) => setC2TypedSeconds(e.target.value)}
                  placeholder="Enter seconds..."
                  className="w-36 bg-black border-2 border-yellow-400 rounded-lg px-4 py-2 text-yellow-300 text-base font-bold outline-none text-center"
                />
                <span className="text-gray-400 text-xs">SECONDS (Formula: Excess / 250)</span>
              </div>
            </div>

            {/* Loop Condition Selector */}
            <div>
              <div className="text-white font-bold mb-1.5">WHILE LOOP TERMINATION CRITERIA:</div>
              <div className="flex flex-wrap gap-2.5">
                {[
                  'WHILE (gross_weight > 65000_KG)',
                  'WHILE (gross_weight < 65000_KG)',
                  'WHILE (gross_weight == 0_KG)',
                ].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setC2LoopCondition(opt);
                      soundFx.playClick();
                    }}
                    className={`px-3 py-2 rounded-lg text-xs md:text-sm font-bold border-2 transition-all ${
                      c2LoopCondition === opt
                        ? 'bg-amber-400 text-black border-white shadow-[0_0_15px_#f59e0b]'
                        : 'bg-black/60 text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Crossfeed Balance */}
            <div>
              <div className="text-white font-bold mb-1.5">LATERAL FUEL MANIFOLD BALANCING:</div>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: 'BALANCED_OPEN', label: 'BALANCED_OPEN (Crossfeed equalizes left/right wing weight)' },
                  { id: 'ISOLATED_CLOSED', label: 'ISOLATED_CLOSED (Tanks operate separately, risk roll imbalance)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setC2Crossfeed(opt.id);
                      soundFx.playClick();
                    }}
                    className={`px-3 py-2 rounded-lg text-xs md:text-sm font-bold border-2 transition-all ${
                      c2Crossfeed === opt.id
                        ? 'bg-cyan-500 text-black border-white shadow-[0_0_15px_#06b6d4]'
                        : 'bg-black/60 text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Feedback & Action */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
            <div className={`text-xs md:text-sm p-4 rounded-xl border-2 flex-1 w-full font-bold ${
              c2Success ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200' : 'bg-amber-950/90 border-amber-400 text-amber-200'
            }`}>
              {c2Feedback}
            </div>

            <button
              onClick={verifyChallenge2}
              disabled={isDumping || c2Success}
              className={`w-full sm:w-auto px-8 py-4 font-bold text-sm tracking-widest rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all ${
                isDumping
                  ? 'bg-cyan-500 text-black animate-pulse'
                  : c2Success
                  ? 'bg-emerald-500 text-black cursor-default'
                  : 'bg-amber-500 hover:bg-amber-400 text-black'
              }`}
            >
              <Play size={16} />
              <span>{isDumping ? 'DUMPING FUEL...' : c2Success ? 'WEIGHT VERIFIED' : 'EXECUTE JETTISON'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* MODULE 3: BLACK BOX CHECKSUM & DISTRESS TOKEN            */}
      {/* ======================================================== */}
      {activeTab === 3 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="bg-cyan-950/70 border-2 border-cyan-500/60 p-4 rounded-xl flex items-start gap-3">
            <Lock className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm text-cyan-100 font-semibold leading-relaxed">
              <span className="font-bold text-cyan-300">SCENARIO:</span> Arm the Cockpit Voice Recorder (CVR) and Flight Data Recorder (FDR). Identify the official ICAO emergency transponder squawk, international VHF emergency frequency, and synthesize the 3-part encrypted authorization token!
            </div>
          </div>

          <div className="bg-[#111c33] border-2 border-cyan-400/50 rounded-xl p-5 md:p-6 font-mono text-sm shadow-2xl space-y-4">
            
            {/* Squawk Code Selector */}
            <div>
              <div className="text-yellow-300 font-bold mb-1.5">1. TRANSPONDER EMERGENCY SQUAWK CODE:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { code: '7700', meaning: '7700 (General Emergency / Mayday)' },
                  { code: '7500', meaning: '7500 (Unlawful Interference / Hijack)' },
                  { code: '7600', meaning: '7600 (Radio Communications Failure)' },
                  { code: '1200', meaning: '1200 (Standard VFR Flight)' },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setC3Squawk(item.code);
                      soundFx.playClick();
                    }}
                    className={`p-2.5 rounded-lg text-xs font-bold border-2 transition-all ${
                      c3Squawk === item.code
                        ? 'bg-cyan-500 text-black border-white shadow-[0_0_15px_#06b6d4]'
                        : 'bg-black/60 text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {item.meaning}
                  </button>
                ))}
              </div>
            </div>

            {/* VHF Frequency Selector */}
            <div>
              <div className="text-yellow-300 font-bold mb-1.5">2. INTERNATIONAL AERONAUTICAL GUARD FREQUENCY:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['121.5', '118.0', '124.8', '136.9'].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => {
                      setC3Freq(freq);
                      soundFx.playClick();
                    }}
                    className={`p-2.5 rounded-lg text-xs font-bold border-2 transition-all ${
                      c3Freq === freq
                        ? 'bg-emerald-500 text-black border-white shadow-[0_0_15px_#10b981]'
                        : 'bg-black/60 text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {freq} MHz
                  </button>
                ))}
              </div>
            </div>

            {/* CSMU Protection */}
            <div>
              <div className="text-yellow-300 font-bold mb-1.5">3. CRASH-SURVIVABLE MEMORY UNIT (CSMU) SHIELD:</div>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: 'ARMORED_TITANIUM_LOCK', label: 'ARMORED_TITANIUM_LOCK (3,400 G shock & 1,100°C fire resistance)' },
                  { id: 'STANDBY', label: 'STANDBY (Unshielded standard memory bus)' },
                  { id: 'EJECT_FLOATABLE', label: 'EJECT_FLOATABLE (Immediate beacon jettison)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setC3CsmuMode(opt.id);
                      soundFx.playClick();
                    }}
                    className={`px-3 py-2 rounded-lg text-xs md:text-sm font-bold border-2 transition-all ${
                      c3CsmuMode === opt.id
                        ? 'bg-amber-400 text-black border-white shadow-[0_0_15px_#f59e0b]'
                        : 'bg-black/60 text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Token Typing Field */}
            <div className="bg-black/70 p-4 rounded-xl border-2 border-cyan-400/60 mt-3">
              <div className="text-white font-bold text-xs md:text-sm mb-1">
                SYNTHESIZE 3-PART ENCRYPTED TELEMETRY TOKEN:
              </div>
              <div className="text-xs text-gray-300 mb-2">
                Format: <code className="text-yellow-300">[SQUAWK]-[FREQUENCY_INT]-[STATUS]</code> {'->'} For Squawk 7700 on 121.5 MHz, construct: <span className="text-emerald-400 font-bold">7700-121-MAYDAY</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold text-lg">&gt;</span>
                <input
                  type="text"
                  value={c3TypedToken}
                  onChange={(e) => setC3TypedToken(e.target.value)}
                  placeholder="Enter token: e.g. 7700-121-MAYDAY"
                  className="flex-1 bg-black border-2 border-cyan-400 rounded-lg px-4 py-2 text-cyan-200 text-sm md:text-base font-bold outline-none tracking-widest uppercase"
                />
              </div>
            </div>

          </div>

          {/* Feedback & Action */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
            <div className={`text-xs md:text-sm p-4 rounded-xl border-2 flex-1 w-full font-bold ${
              c3Success ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200' : 'bg-cyan-950/90 border-cyan-400 text-cyan-200'
            }`}>
              {c3Feedback}
            </div>

            <button
              disabled={c3Success}
              onClick={verifyChallenge3}
              className={`w-full sm:w-auto px-8 py-4 font-bold text-sm tracking-widest rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.7)] flex items-center justify-center gap-2 transition-all ${
                c3Success
                  ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed opacity-50'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black hover:scale-105'
              }`}
            >
              <Play size={16} />
              <span>{c3Success ? 'MODULE CLEARED' : 'TRANSMIT & ARM FDR'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* PRIZE UNLOCK BANNER */}
      {allSolved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 border-2 border-emerald-400 bg-emerald-950/90 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-5 shadow-[0_0_40px_rgba(16,185,129,0.7)]"
        >
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
            <div>
              <div className="text-base md:text-lg font-bold text-emerald-300 tracking-wider">
                ALL CRASH DIAGNOSTICS CLEARED! PRIZE UNLOCKED:
              </div>
              <div className="text-xs md:text-sm text-emerald-100">
                OFFICIAL FLIGHT OPERATIONS USER MANUAL DOCUMENT IS READY FOR ACCESS
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playSuccess();
              onAllCompleted();
            }}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-sm tracking-[0.2em] rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <span>OPEN USER MANUAL</span>
            <ArrowRight size={18} />
          </button>
        </motion.div>
      )}

    </div>
  );
};

export default CrashPseudocodeChallenges;
