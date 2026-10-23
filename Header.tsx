import React from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  History,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  currentStage: 'setup' | 'interview' | 'feedback';
  enableVoiceTTS: boolean;
  onToggleTTS: () => void;
  onOpenHistory: () => void;
  onResetSession: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  enableVoiceTTS,
  onToggleTTS,
  onOpenHistory,
  onResetSession,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onResetSession}
          className="flex items-center gap-3 cursor-pointer group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                InterviewGenie
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Mock Practice, Sentiment Analytics & Automated Feedback
            </p>
          </div>
        </div>

        {/* Current Stage Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span
            className={`w-2 h-2 rounded-full ${
              currentStage === 'interview'
                ? 'bg-rose-500 animate-pulse'
                : currentStage === 'feedback'
                ? 'bg-emerald-500'
                : 'bg-indigo-500'
            }`}
          />
          <span className="font-medium capitalize">
            {currentStage === 'setup'
              ? 'Stage 1: Session Setup'
              : currentStage === 'interview'
              ? 'Stage 2: Live Interview Simulation'
              : 'Stage 3: Comprehensive Scorecard'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* TTS Audio Toggle */}
          <button
            onClick={onToggleTTS}
            title={enableVoiceTTS ? 'Mute AI Interviewer Voice' : 'Enable AI Interviewer Voice'}
            className={`p-2 rounded-lg border transition-all text-xs font-medium flex items-center gap-1.5 ${
              enableVoiceTTS
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {enableVoiceTTS ? (
              <>
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Voice ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">Voice Muted</span>
              </>
            )}
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium relative"
          >
            <History className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* Reset / New Session */}
          {currentStage !== 'setup' && (
            <button
              onClick={onResetSession}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium"
              title="Start New Interview"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">New Session</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
