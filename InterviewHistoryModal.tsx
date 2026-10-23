import React from 'react';
import { SavedInterviewSession } from '../types/interview';
import {
  X,
  History,
  Trash2,
  Calendar,
  Trophy,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface InterviewHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SavedInterviewSession[];
  onSelectSession: (session: SavedInterviewSession) => void;
  onClearHistory: () => void;
  onDeleteSession: (id: string) => void;
}

export const InterviewHistoryModal: React.FC<InterviewHistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onClearHistory,
  onDeleteSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Interview History & Scorecards</h3>
              <p className="text-xs text-slate-400">
                {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} recorded locally
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {sessions.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 text-slate-500 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">No Mock Interviews Saved Yet</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Complete your first interview simulation to receive an automated score and unlock your performance trends!
              </p>
            </div>
          ) : (
            sessions.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {item.config.seniority} {item.config.role}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {item.config.targetCompany}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-400">
                        {item.hiringDecision}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        {item.overallScore}
                      </div>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block -mt-0.5">
                        SCORE
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectSession(item)}
                      className="p-2 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold flex items-center gap-1"
                      title="View Full Scorecard"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteSession(item.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        {sessions.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All History</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
