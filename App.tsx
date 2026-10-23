/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SetupView } from './components/SetupView';
import { InterviewRoom } from './components/InterviewRoom';
import { FeedbackScorecard } from './components/FeedbackScorecard';
import { InterviewHistoryModal } from './components/InterviewHistoryModal';
import {
  InterviewConfig,
  InterviewQuestion,
  FullEvaluation,
  QuestionHistoryItem,
  SavedInterviewSession,
} from './types/interview';
import {
  fetchQuestions,
  submitFullEvaluation,
} from './services/api';
import { Sparkles, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'interviewgenie_saved_sessions_v1';

export default function App() {
  const [currentStage, setCurrentStage] = useState<'setup' | 'interview' | 'feedback'>('setup');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Session Data
  const [activeConfig, setActiveConfig] = useState<InterviewConfig | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [interviewerPersona, setInterviewerPersona] = useState<string>('');
  const [qaHistory, setQaHistory] = useState<QuestionHistoryItem[]>([]);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState<number>(0);
  const [fullEvaluation, setFullEvaluation] = useState<FullEvaluation | null>(null);

  // Audio Preference
  const [enableVoiceTTS, setEnableVoiceTTS] = useState<boolean>(true);

  // History State
  const [savedSessions, setSavedSessions] = useState<SavedInterviewSession[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read history from localStorage:', e);
    }
  }, []);

  const saveSessionToStorage = (session: SavedInterviewSession) => {
    const updated = [session, ...savedSessions.filter((s) => s.id !== session.id)].slice(0, 20);
    setSavedSessions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save session to localStorage:', e);
    }
  };

  const handleClearHistory = () => {
    setSavedSessions([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  const handleDeleteSession = (id: string) => {
    const filtered = savedSessions.filter((s) => s.id !== id);
    setSavedSessions(filtered);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {}
  };

  // Start Interview from Setup
  const handleStartInterview = async (config: InterviewConfig) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingMessage(`Curating ${config.questionCount} ${config.interviewType} questions for ${config.seniority} ${config.role} @ ${config.targetCompany}...`);
    setActiveConfig(config);
    setEnableVoiceTTS(config.enableVoiceTTS);

    try {
      const result = await fetchQuestions(config);
      if (!result.questions || result.questions.length === 0) {
        throw new Error('No interview questions were generated. Please try again.');
      }

      setQuestions(result.questions);
      setInterviewerPersona(result.interviewerPersona);
      setCurrentStage('interview');
    } catch (err: any) {
      console.error('Failed to start interview:', err);
      setErrorMessage(err.message || 'Failed to start interview session. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Finish Interview & Request Evaluation
  const handleFinishInterview = async (
    history: QuestionHistoryItem[],
    totalDuration: number
  ) => {
    if (!activeConfig) return;

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingMessage('AI Hiring Committee is evaluating candidate responses, speech pacing, sentiment, and STAR alignment...');
    setQaHistory(history);
    setTotalDurationSeconds(totalDuration);

    // Calculate aggregated speech stats
    const totalWords = history.reduce((acc, item) => acc + item.candidateAnswer.trim().split(/\s+/).filter(Boolean).length, 0);
    const totalMinutes = Math.max(1, totalDuration / 60);
    const avgWpm = Math.round(totalWords / totalMinutes);
    const totalFillers = history.reduce((acc, item) => acc + (item.fillerWordsCount || 0), 0);

    try {
      const evaluation = await submitFullEvaluation({
        interviewContext: activeConfig,
        qaHistory: history,
        totalDurationSeconds: totalDuration,
        speechStats: {
          averageWpm: avgWpm,
          totalFillerWords: totalFillers,
          toneTrajectory: 'Consistent & Composed',
        },
      });

      setFullEvaluation(evaluation);
      setCurrentStage('feedback');

      // Auto save session
      const newSavedSession: SavedInterviewSession = {
        id: `session-${Date.now()}`,
        timestamp: Date.now(),
        config: activeConfig,
        overallScore: evaluation.overallScore,
        hiringDecision: evaluation.hiringDecision,
        totalDurationSeconds: totalDuration,
        evaluation,
        qaHistory: history,
      };
      saveSessionToStorage(newSavedSession);
    } catch (err: any) {
      console.error('Evaluation error:', err);
      setErrorMessage(err.message || 'Failed to generate comprehensive evaluation.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Retake exact current interview
  const handleRetake = () => {
    setCurrentStage('interview');
    setQaHistory([]);
    setFullEvaluation(null);
  };

  // Reset to Setup screen
  const handleResetSession = () => {
    setCurrentStage('setup');
    setQaHistory([]);
    setFullEvaluation(null);
    setQuestions([]);
    setErrorMessage(null);
  };

  // Load past session from history
  const handleSelectPastSession = (session: SavedInterviewSession) => {
    setActiveConfig(session.config);
    setFullEvaluation(session.evaluation);
    setQaHistory(session.qaHistory);
    setTotalDurationSeconds(session.totalDurationSeconds);
    setCurrentStage('feedback');
    setIsHistoryModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Header
        currentStage={currentStage}
        enableVoiceTTS={enableVoiceTTS}
        onToggleTTS={() => setEnableVoiceTTS(!enableVoiceTTS)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onResetSession={handleResetSession}
        historyCount={savedSessions.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto px-4 pt-4">
            <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Global Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-600/40">
                <Sparkles className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Analyzing with AI Engine</h3>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {loadingMessage || 'Processing mock interview data and speech metrics...'}
            </p>
          </div>
        )}

        {/* Current View Switcher */}
        {currentStage === 'setup' && (
          <SetupView
            onStartInterview={handleStartInterview}
            isLoading={isLoading}
          />
        )}

        {currentStage === 'interview' && activeConfig && (
          <InterviewRoom
            config={activeConfig}
            questions={questions}
            interviewerPersona={interviewerPersona}
            onFinishInterview={handleFinishInterview}
          />
        )}

        {currentStage === 'feedback' && activeConfig && fullEvaluation && (
          <FeedbackScorecard
            config={activeConfig}
            evaluation={fullEvaluation}
            qaHistory={qaHistory}
            totalDurationSeconds={totalDurationSeconds}
            onRetake={handleRetake}
            onNewSession={handleResetSession}
          />
        )}
      </main>

      {/* History Modal */}
      <InterviewHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        sessions={savedSessions}
        onSelectSession={handleSelectPastSession}
        onClearHistory={handleClearHistory}
        onDeleteSession={handleDeleteSession}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/50 py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">InterviewGenie</span>
            <span>•</span>
            <span>Real-Time AI Mock Interview & Speech Analytics</span>
          </div>
          <div>
            Built with React, Express, Gemini 3.8 & Web Speech API
          </div>
        </div>
      </footer>
    </div>
  );
}
