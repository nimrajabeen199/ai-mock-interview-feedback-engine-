import React, { useState } from 'react';
import {
  FullEvaluation,
  InterviewConfig,
  QuestionHistoryItem,
} from '../types/interview';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
  Printer,
  Copy,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Award,
  Zap,
  Check,
  Building,
  Target,
} from 'lucide-react';

interface FeedbackScorecardProps {
  config: InterviewConfig;
  evaluation: FullEvaluation;
  qaHistory: QuestionHistoryItem[];
  totalDurationSeconds: number;
  onRetake: () => void;
  onNewSession: () => void;
}

export const FeedbackScorecard: React.FC<FeedbackScorecardProps> = ({
  config,
  evaluation,
  qaHistory,
  totalDurationSeconds,
  onRetake,
  onNewSession,
}) => {
  const [copied, setCopied] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'Strong Hire':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'Hire':
        return {
          bg: 'bg-teal-500/20 text-teal-300 border-teal-500/40 ring-1 ring-teal-500/30',
          dot: 'bg-teal-400',
        };
      case 'Lean Hire':
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          dot: 'bg-blue-400',
        };
      case 'Lean No Hire':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400',
        };
      default:
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-400',
        };
    }
  };

  const decisionBadge = getDecisionBadge(evaluation.hiringDecision);

  const handleCopyReport = () => {
    const reportText = `
=== INTERVIEWGENIE CANDIDATE EVALUATION REPORT ===
Target Role: ${config.seniority} ${config.role} @ ${config.targetCompany}
Overall Score: ${evaluation.overallScore}/100
Hiring Recommendation: ${evaluation.hiringDecision}

Executive Verdict:
${evaluation.summaryVerdict}

Dimension Scores:
- Technical Accuracy: ${evaluation.dimensionScores.technicalAccuracy.score}/100
- Communication & Clarity: ${evaluation.dimensionScores.communicationClarity.score}/100
- STAR Structure: ${evaluation.dimensionScores.starStructure.score}/100
- Confidence & Presence: ${evaluation.dimensionScores.confidenceAndPresence.score}/100
- Leadership & Culture Fit: ${evaluation.dimensionScores.leadershipAndImpact.score}/100

Speech & Delivery:
- Pacing: ${evaluation.speechAndPacingReview.pacingVerdict}
- Fillers: ${evaluation.speechAndPacingReview.fillerWordImpact}
- Trajectory: ${evaluation.speechAndPacingReview.sentimentTrajectory}

Action Drills:
${evaluation.recommendedActionDrills.map((d, i) => `${i + 1}. ${d}`).join('\n')}
==================================================
`;
    navigator.clipboard.writeText(reportText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const durationMin = Math.round(totalDurationSeconds / 60);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8 print:p-0 print:m-0">
      {/* Action Header (Print / Copy / Retake) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
            Automated Hiring Committee Scorecard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Performance Review & Feedback
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyReport}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-purple-400" />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={onRetake}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Interview</span>
          </button>
        </div>
      </div>

      {/* Hero Scorecard Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Candidate / Context Info */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border flex items-center gap-1.5 ${decisionBadge.bg}`}>
                <span className={`w-2 h-2 rounded-full ${decisionBadge.dot} animate-pulse`} />
                {evaluation.hiringDecision}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
                {config.targetCompany} Standard
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
                ~{durationMin} min duration
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {config.seniority} {config.role}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              "{evaluation.summaryVerdict}"
            </p>
          </div>

          {/* Big Circular/Radial Score Hero */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 shadow-xl shrink-0 self-center md:self-auto min-w-[160px]">
            <Trophy className="w-6 h-6 text-amber-400 mb-1" />
            <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              {evaluation.overallScore}
            </div>
            <span className="text-xs text-slate-400 font-medium mt-1">Overall Bar Score</span>
            <span className="text-[10px] text-slate-500 font-mono">Out of 100</span>
          </div>
        </div>
      </div>

      {/* 5 Core Dimension Performance Radar / Progress */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Award className="w-4 h-4 text-indigo-400" />
          <span>Core Competency Dimensions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              key: 'technicalAccuracy',
              title: 'Technical Depth & Problem Solving',
              data: evaluation.dimensionScores.technicalAccuracy,
              color: 'from-blue-500 to-indigo-500',
            },
            {
              key: 'communicationClarity',
              title: 'Communication & Articulation',
              data: evaluation.dimensionScores.communicationClarity,
              color: 'from-purple-500 to-pink-500',
            },
            {
              key: 'starStructure',
              title: 'STAR Method & Structured Reasoning',
              data: evaluation.dimensionScores.starStructure,
              color: 'from-emerald-500 to-teal-500',
            },
            {
              key: 'confidenceAndPresence',
              title: 'Executive Presence & Composure',
              data: evaluation.dimensionScores.confidenceAndPresence,
              color: 'from-amber-500 to-orange-500',
            },
            {
              key: 'leadershipAndImpact',
              title: 'Leadership, Culture & Ownership',
              data: evaluation.dimensionScores.leadershipAndImpact,
              color: 'from-rose-500 to-purple-500',
            },
          ].map((dim) => {
            const score = dim.data?.score || 80;
            return (
              <div
                key={dim.key}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{dim.title}</span>
                  <span className="font-bold text-indigo-300 font-mono">{score}/100</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${dim.color} transition-all duration-1000`}
                    style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  {dim.data?.rationale}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Speech, Pacing & Verbal Crutches Review */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Speech Delivery, Verbal Habits & Pacing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-medium block">Pacing Assessment</span>
            <p className="text-slate-200 leading-relaxed">
              {evaluation.speechAndPacingReview.pacingVerdict}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-medium block">Filler Words & Verbal Crutches</span>
            <p className="text-slate-200 leading-relaxed">
              {evaluation.speechAndPacingReview.fillerWordImpact}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-medium block">Confidence Trajectory</span>
            <p className="text-slate-200 leading-relaxed">
              {evaluation.speechAndPacingReview.sentimentTrajectory}
            </p>
          </div>
        </div>
      </div>

      {/* Question-by-Question Deep Dive & Golden Answers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Question-by-Question Deep Dive & Top 1% Exemplar Responses</span>
          </div>
          <span className="text-xs text-slate-400">
            {evaluation.perQuestionFeedback.length} questions analyzed
          </span>
        </div>

        <div className="space-y-3">
          {evaluation.perQuestionFeedback.map((q, idx) => {
            const isExpanded = expandedQuestion === idx;
            const historyItem = qaHistory[idx];

            return (
              <div
                key={q.questionId || idx}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-lg transition-all"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                      Q{idx + 1}
                    </span>
                    <span className="font-semibold text-sm text-white line-clamp-1">
                      {q.question}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                      Score: {q.score}/100
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800/80 bg-slate-950/60 space-y-4 text-xs animate-in fade-in duration-200">
                    {/* Candidate's Transcript */}
                    <div className="space-y-1.5">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        Your Answer Transcript:
                      </span>
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed font-sans max-h-40 overflow-y-auto">
                        {historyItem?.candidateAnswer || 'Answer recorded during interview'}
                      </div>
                    </div>

                    {/* Strengths & Growth Areas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-200 space-y-1.5">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          What Went Well
                        </span>
                        <ul className="space-y-1 pl-1">
                          {q.strengths.map((str, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-1.5 text-[11px]">
                              <span className="text-emerald-400">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-200 space-y-1.5">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" />
                          Areas for Growth & Missed Points
                        </span>
                        <ul className="space-y-1 pl-1">
                          {q.growthAreas.map((gr, gIdx) => (
                            <li key={gIdx} className="flex items-start gap-1.5 text-[11px]">
                              <span className="text-amber-400">•</span>
                              <span>{gr}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Top 1% Golden Answer */}
                    <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                      <div className="flex items-center gap-2 text-indigo-300 font-bold">
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        <span>Top 1% Candidate Exemplar Answer ("Golden Response")</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed text-xs italic">
                        "{q.goldenAnswer}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Practice Drills for Real Interview Day */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Targeted Action Drills Before Your Real On-Site</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {evaluation.recommendedActionDrills.map((drill, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed pt-1">{drill}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 print:hidden">
        <button
          type="button"
          onClick={onNewSession}
          className="text-xs text-slate-400 hover:text-white px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
        >
          ← Change Target Role & Configuration
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRetake}
            className="py-3 px-6 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake This Exact Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
