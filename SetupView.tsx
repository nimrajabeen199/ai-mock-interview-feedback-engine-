import React, { useState } from 'react';
import {
  InterviewConfig,
  InterviewType,
  SeniorityLevel,
  TargetCompany,
} from '../types/interview';
import {
  Briefcase,
  Building2,
  Layers,
  Sparkles,
  Camera,
  Mic,
  Volume2,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Wand2,
} from 'lucide-react';

interface SetupViewProps {
  onStartInterview: (config: InterviewConfig) => void;
  isLoading: boolean;
}

const POPULAR_ROLES = [
  'Full Stack Software Engineer',
  'Frontend Engineer (React/TypeScript)',
  'Backend & Distributed Systems Engineer',
  'Product Manager (Technical PM)',
  'Machine Learning & AI Engineer',
  'System Design Architect',
  'DevOps & Cloud Infrastructure',
  'Behavioral & Leadership (STAR)',
];

const SENIORITIES: SeniorityLevel[] = [
  'Junior / Entry',
  'Mid-Level',
  'Senior',
  'Staff / Tech Lead',
  'Director / Executive',
];

const COMPANIES: { name: TargetCompany; badge: string; color: string }[] = [
  { name: 'Google', badge: 'High Bar • Problem Solving', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
  { name: 'Amazon', badge: 'Leadership Principles • STAR', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
  { name: 'Meta', badge: 'Fast Velocity • Architecture', color: 'border-sky-500/30 text-sky-400 bg-sky-500/10' },
  { name: 'Apple', badge: 'Pixel Perfection • Privacy', color: 'border-slate-400/30 text-slate-300 bg-slate-500/10' },
  { name: 'Microsoft', badge: 'Scale • Systems Rigor', color: 'border-teal-500/30 text-teal-400 bg-teal-500/10' },
  { name: 'Netflix', badge: 'Freedom & High Density', color: 'border-rose-500/30 text-rose-400 bg-rose-500/10' },
  { name: 'High-Growth Startup', badge: 'Scrappy • End-to-End', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
  { name: 'FinTech / Stripe', badge: 'Reliability • Precision', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
];

const INTERVIEW_TYPES: { type: InterviewType; label: string; desc: string; icon: string }[] = [
  {
    type: 'technical',
    label: 'Technical Deep-Dive',
    desc: 'Algorithms, data models, debugging, and framework trade-offs.',
    icon: '⚡',
  },
  {
    type: 'behavioral',
    label: 'Behavioral & STAR',
    desc: 'Conflict resolution, ownership, failure retrospectives, and leadership.',
    icon: '🎯',
  },
  {
    type: 'system_design',
    label: 'System Design',
    desc: 'High availability, sharding, caching, API gateways, and microservices.',
    icon: '🏛️',
  },
  {
    type: 'mixed',
    label: 'Mixed Bar-Raiser',
    desc: 'Balanced blend of technical prowess, system trade-offs, and culture fit.',
    icon: '👑',
  },
];

export const SetupView: React.FC<SetupViewProps> = ({
  onStartInterview,
  isLoading,
}) => {
  const [role, setRole] = useState('Full Stack Software Engineer');
  const [seniority, setSeniority] = useState<SeniorityLevel>('Senior');
  const [targetCompany, setTargetCompany] = useState<TargetCompany>('Google');
  const [interviewType, setInterviewType] = useState<InterviewType>('mixed');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [enableCamera, setEnableCamera] = useState<boolean>(true);
  const [enableVoiceTTS, setEnableVoiceTTS] = useState<boolean>(true);

  // Tailoring
  const [showTailoring, setShowTailoring] = useState<boolean>(false);
  const [resumeSnippet, setResumeSnippet] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');

  const handleQuickPreset = (presetType: 'google-swe' | 'amazon-pm') => {
    if (presetType === 'google-swe') {
      setRole('Full Stack Software Engineer');
      setSeniority('Senior');
      setTargetCompany('Google');
      setInterviewType('mixed');
      setQuestionCount(3);
      setResumeSnippet('5 years building distributed React/Node.js web apps with PostgreSQL, Redis cache tiers, and Kubernetes. Led migration of micro-frontends reducing bundle size by 42%.');
      setJobDescription('Looking for Senior Full Stack Engineers who can design resilient APIs, write clean TypeScript, and optimize browser client performance at Google scale.');
      setShowTailoring(true);
    } else {
      setRole('Product Manager (Technical PM)');
      setSeniority('Senior');
      setTargetCompany('Amazon');
      setInterviewType('behavioral');
      setQuestionCount(3);
      setResumeSnippet('Ex-fintech PM with 6 years experience driving cloud payments platform adoption. Led cross-functional teams of 14 engineers and designers. Championed customer obsession.');
      setJobDescription('Lead end-to-end strategy for AWS cloud developer tooling. High bar on Amazon Leadership Principles, Customer Obsession, Bias for Action, and Deliver Results.');
      setShowTailoring(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartInterview({
      role: role.trim() || 'Software Engineer',
      seniority,
      targetCompany,
      interviewType,
      questionCount,
      resumeSnippet: resumeSnippet.trim() ? resumeSnippet : undefined,
      jobDescription: jobDescription.trim() ? jobDescription : undefined,
      enableCamera,
      enableVoiceTTS,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Gemini Intelligence • Real-time Speech & Sentiment Engine
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Master Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Tech Interview</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Practice with an AI Bar-Raiser. Experience live voice transcription, real-time pacing & filler word detection, sentiment analysis, and instant STAR feedback.
        </p>

        {/* Quick Demo Presets */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-slate-500 font-medium mr-1">Quick Presets:</span>
          <button
            type="button"
            onClick={() => handleQuickPreset('google-swe')}
            className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 transition-all flex items-center gap-1.5"
          >
            <Wand2 className="w-3 h-3 text-indigo-400" />
            Senior Full Stack @ Google
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('amazon-pm')}
            className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition-all flex items-center gap-1.5"
          >
            <Wand2 className="w-3 h-3 text-amber-400" />
            Lead PM @ Amazon (STAR)
          </button>
        </div>
      </div>

      {/* Main Setup Form Card */}
      <form onSubmit={handleSubmit} className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/40 space-y-8">
        {/* 1. Target Role & Seniority */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>Target Role & Seniority</span>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">Role Title</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Full Stack Software Engineer, Product Manager"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              required
            />
          </div>

          {/* Quick Role Suggestions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {POPULAR_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  role === r
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Seniority Badges */}
          <div className="pt-2">
            <label className="block text-xs text-slate-400 mb-2">Seniority Level</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SENIORITIES.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSeniority(lvl)}
                  className={`text-xs py-2 px-2.5 rounded-xl border text-center transition-all font-medium ${
                    seniority === lvl
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Target Company */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Building2 className="w-4 h-4 text-purple-400" />
            <span>Target Company Culture & Standards</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COMPANIES.map((c) => {
              const isSelected = targetCompany === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setTargetCompany(c.name)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-indigo-500 ring-1 ring-indigo-500 shadow-lg'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-white">{c.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <span className={`text-[10px] inline-block px-1.5 py-0.5 rounded border font-medium ${c.color}`}>
                    {c.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Interview Focus / Type */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Layers className="w-4 h-4 text-pink-400" />
            <span>Interview Format</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INTERVIEW_TYPES.map((t) => {
              const isSelected = interviewType === t.type;
              return (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setInterviewType(t.type)}
                  className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl mt-0.5">{t.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{t.label}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Question Count & Duration */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Session Length</span>
            </div>
            <span className="text-xs text-slate-400">
              Est. Duration: ~{questionCount * 3.5} minutes
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setQuestionCount(num)}
                className={`py-2.5 px-3 rounded-xl border text-center transition-all font-semibold text-sm ${
                  questionCount === num
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {num} Questions
              </button>
            ))}
          </div>
        </div>

        {/* 5. Personalized Tailoring (Optional Resume & Job Description) */}
        <div className="pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowTailoring(!showTailoring)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-slate-300 hover:text-white py-1"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Personalize with Resume & Job Description (Optional)</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              {showTailoring ? 'Hide Options' : '+ Expand'}
            </span>
          </button>

          {showTailoring && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Candidate Resume Highlights / Experience
                </label>
                <textarea
                  value={resumeSnippet}
                  onChange={(e) => setResumeSnippet(e.target.value)}
                  placeholder="Paste snippets of your projects, tech stack, past companies, and achievements..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Target Job Description / Requirements
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job posting bullets or key technical expectations..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* 6. Hardware & Audio Preferences */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={enableCamera}
                onChange={(e) => setEnableCamera(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Enable Webcam Mirror</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={enableVoiceTTS}
                onChange={(e) => setEnableVoiceTTS(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Interviewer Voice (TTS)</span>
            </label>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Mic className="w-3 h-3 text-emerald-400" />
            <span>Mic Speech-to-Text active in room</span>
          </div>
        </div>

        {/* Submit CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-xl font-bold text-base text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2.5 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Designing Tailored Interview Questions...</span>
              </>
            ) : (
              <>
                <span>Launch Mock Interview Simulation</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
