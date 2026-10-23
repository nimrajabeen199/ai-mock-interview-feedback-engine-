import React, { useState, useEffect, useRef } from 'react';
import {
  InterviewConfig,
  InterviewQuestion,
  TurnAnalysis,
  QuestionHistoryItem,
} from '../types/interview';
import { AudioVisualizer } from './AudioVisualizer';
import {
  detectFillerWords,
  calculateWpm,
  createSpeechRecognitionInstance,
  isSpeechRecognitionSupported,
  speakWithBrowserSynthesis,
  stopBrowserSynthesis,
} from '../utils/speechRecognition';
import {
  playInterviewerAudio,
  analyzeCandidateAnswer,
} from '../services/api';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Send,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  MessageSquare,
  TrendingUp,
  BrainCircuit,
  Lightbulb,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface InterviewRoomProps {
  config: InterviewConfig;
  questions: InterviewQuestion[];
  interviewerPersona: string;
  onFinishInterview: (history: QuestionHistoryItem[], totalDurationSeconds: number) => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  config,
  questions,
  interviewerPersona,
  onFinishInterview,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const currentQuestion = questions[currentQuestionIndex] || questions[0];

  // Speech and candidate answer state
  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognitionSupported, setRecognitionSupported] = useState<boolean>(true);

  // Video webcam mirror
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(config.enableCamera);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Turn management & follow-up probe
  const [turnCount, setTurnCount] = useState<number>(1);
  const [isAnalyzingTurn, setIsAnalyzingTurn] = useState<boolean>(false);
  const [activeTurnAnalysis, setActiveTurnAnalysis] = useState<TurnAnalysis | null>(null);
  const [pendingFollowUp, setPendingFollowUp] = useState<string | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState<string>('');
  const [isAnsweringFollowUp, setIsAnsweringFollowUp] = useState<boolean>(false);

  // History tracking for full scorecard
  const [qaHistory, setQaHistory] = useState<QuestionHistoryItem[]>([]);
  const [sessionStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [elapsedQuestionSeconds, setElapsedQuestionSeconds] = useState<number>(0);

  // Interviewer speaking state & audio wave
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState<boolean>(false);
  const [interviewerVoiceMuted, setInterviewerVoiceMuted] = useState<boolean>(!config.enableVoiceTTS);

  // Hints toggles
  const [showExpectedPoints, setShowExpectedPoints] = useState<boolean>(false);

  // Speech Recognition ref
  const recognitionRef = useRef<any | null>(null);

  // 1. Setup Webcam
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (cameraActive) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          setMediaStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn('Webcam permission not granted or device unavailable:', err);
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  // 2. Setup Speech Recognition
  useEffect(() => {
    const supported = isSpeechRecognitionSupported();
    setRecognitionSupported(supported);

    if (supported) {
      const recognition = createSpeechRecognitionInstance();
      if (recognition) {
        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          if (isAnsweringFollowUp) {
            setFollowUpAnswer(currentTranscript);
          } else {
            setCandidateAnswer(currentTranscript);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition error:', e.error);
          if (e.error === 'not-allowed') {
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          // If listening state is still true, auto restart continuous capture
          if (recognitionRef.current && isListening) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              // ignore
            }
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isAnsweringFollowUp, isListening]);

  // Handle Listening Toggle
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start speech recognition:', err);
      }
    }
  };

  // 3. Question Clock
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setElapsedQuestionSeconds(0);

    const interval = setInterval(() => {
      setElapsedQuestionSeconds(Math.floor((Date.now() - questionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex]);

  // 4. Play Question Audio when Question Changes
  useEffect(() => {
    if (interviewerVoiceMuted) return;

    let isMounted = true;
    setIsInterviewerSpeaking(true);

    const textToSpeak = `Question ${currentQuestionIndex + 1}. ${currentQuestion.question}`;

    playInterviewerAudio(textToSpeak).then((playedViaGemini) => {
      if (!isMounted) return;
      if (!playedViaGemini) {
        speakWithBrowserSynthesis(textToSpeak, () => {
          if (isMounted) setIsInterviewerSpeaking(false);
        });
      } else {
        setIsInterviewerSpeaking(false);
      }
    });

    return () => {
      isMounted = false;
      stopBrowserSynthesis();
      setIsInterviewerSpeaking(false);
    };
  }, [currentQuestionIndex, interviewerVoiceMuted]);

  // Real-time metrics
  const activeAnswerText = isAnsweringFollowUp ? followUpAnswer : candidateAnswer;
  const fillerData = detectFillerWords(activeAnswerText);
  const currentWpm = calculateWpm(activeAnswerText, Math.max(1, elapsedQuestionSeconds));

  // Determine WPM assessment
  const getWpmStatus = (wpm: number) => {
    if (wpm === 0) return { label: 'Waiting for speech', color: 'text-slate-500' };
    if (wpm < 110) return { label: 'Deliberate / Slow Pace', color: 'text-amber-400' };
    if (wpm <= 165) return { label: 'Optimal Pace', color: 'text-emerald-400' };
    return { label: 'Fast / Rushing', color: 'text-rose-400' };
  };

  const wpmStatus = getWpmStatus(currentWpm);

  // Submit Answer to analyze turn
  const handleSubmitAnswer = async () => {
    if (!activeAnswerText.trim()) return;

    // Stop listening while analyzing
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    setIsAnalyzingTurn(true);

    try {
      const turnAnalysis = await analyzeCandidateAnswer({
        question: pendingFollowUp || currentQuestion.question,
        candidateAnswer: activeAnswerText,
        role: config.role,
        seniority: config.seniority,
        company: config.targetCompany,
        turnCount,
      });

      setActiveTurnAnalysis(turnAnalysis);

      // Play spoken interviewer reaction if voice unmuted
      if (!interviewerVoiceMuted && turnAnalysis.interviewerSpokenReaction) {
        setIsInterviewerSpeaking(true);
        const reactionAudio = `${turnAnalysis.interviewerSpokenReaction} ${turnAnalysis.followUpQuestion || ''}`;
        playInterviewerAudio(reactionAudio).then((played) => {
          if (!played) {
            speakWithBrowserSynthesis(reactionAudio, () => setIsInterviewerSpeaking(false));
          } else {
            setIsInterviewerSpeaking(false);
          }
        });
      }

      // If there is an interesting follow up question and we haven't done turn 2 yet:
      if (turnAnalysis.followUpQuestion && !turnAnalysis.isReadyForNextQuestion && turnCount === 1) {
        setPendingFollowUp(turnAnalysis.followUpQuestion);
        setIsAnsweringFollowUp(true);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setIsAnalyzingTurn(false);
    }
  };

  // Move to next question or conclude interview
  const handleProceedToNext = () => {
    const combinedDuration = Math.max(20, Math.floor((Date.now() - questionStartTime) / 1000));
    const combinedAnswer = isAnsweringFollowUp && followUpAnswer
      ? `${candidateAnswer}\n\n[Follow-up Response]: ${followUpAnswer}`
      : candidateAnswer;

    const totalFillers = detectFillerWords(combinedAnswer).total;
    const finalWpm = calculateWpm(combinedAnswer, combinedDuration);

    const questionRecord: QuestionHistoryItem = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      candidateAnswer: combinedAnswer,
      durationSeconds: combinedDuration,
      fillerWordsCount: totalFillers,
      wpm: finalWpm,
      turnFeedback: activeTurnAnalysis || undefined,
      followUpQuestion: pendingFollowUp || undefined,
      followUpAnswer: followUpAnswer || undefined,
    };

    const updatedHistory = [...qaHistory, questionRecord];
    setQaHistory(updatedHistory);

    // Reset turn states
    setCandidateAnswer('');
    setFollowUpAnswer('');
    setPendingFollowUp(null);
    setIsAnsweringFollowUp(false);
    setActiveTurnAnalysis(null);
    setTurnCount(1);
    stopBrowserSynthesis();

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Conclude full interview!
      const totalSessionSeconds = Math.max(60, Math.floor((Date.now() - sessionStartTime) / 1000));
      onFinishInterview(updatedHistory, totalSessionSeconds);
    }
  };

  // Skip question or advance early
  const handleSkipQuestion = () => {
    handleProceedToNext();
  };

  const minutes = Math.floor(elapsedQuestionSeconds / 60);
  const seconds = elapsedQuestionSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Status Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Left: Progress & Target */}
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
            {config.targetCompany} • {config.role}
          </span>
          <span className="hidden md:inline-block text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
            {currentQuestion.category}
          </span>
        </div>

        {/* Right: Live Metrics & Controls */}
        <div className="flex items-center gap-4 text-xs">
          {/* Question Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{timeFormatted}</span>
            <span className="text-slate-500">/ ~{currentQuestion.recommendedMinutes}m</span>
          </div>

          {/* Live WPM */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-slate-200">{currentWpm} WPM</span>
            <span className={`text-[10px] font-medium ${wpmStatus.color}`}>
              ({wpmStatus.label})
            </span>
          </div>

          {/* Filler Word Tracker */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Fillers:</span>
            <span
              className={`font-bold ${
                fillerData.total > 5 ? 'text-amber-400' : 'text-slate-200'
              }`}
            >
              {fillerData.total}
            </span>
          </div>
        </div>
      </div>

      {/* Main Dual-Stage Video Call Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Interviewer Persona & Active Question (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Interviewer Virtual Persona Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden shadow-xl">
            {/* Top Bar with Audio Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  {isInterviewerSpeaking && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <span>AI Bar-Raiser</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{interviewerPersona}</p>
                </div>
              </div>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => setInterviewerVoiceMuted(!interviewerVoiceMuted)}
                className={`p-2 rounded-xl border transition-all ${
                  !interviewerVoiceMuted
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
                title={interviewerVoiceMuted ? 'Unmute Interviewer Voice' : 'Mute Interviewer Voice'}
              >
                {!interviewerVoiceMuted ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Audio Waveform */}
            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between mb-4">
              <span className="text-[11px] text-slate-400 font-medium">
                {isInterviewerSpeaking ? 'Interviewer Speaking...' : 'Interviewer Listening'}
              </span>
              <AudioVisualizer isActive={isInterviewerSpeaking} color="#6366f1" barCount={20} />
            </div>

            {/* Current Question */}
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wider font-semibold text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Primary Question</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* Context Tip */}
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 text-xs leading-relaxed flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Interviewer Tip: </span>
                  {currentQuestion.contextTip}
                </div>
              </div>

              {/* Collapsible Key Expected Points / Rubric */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowExpectedPoints(!showExpectedPoints)}
                  className="flex items-center justify-between w-full text-xs font-medium text-slate-400 hover:text-slate-200 py-1 transition-colors"
                >
                  <span>Evaluation Angles & Keywords</span>
                  {showExpectedPoints ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {showExpectedPoints && (
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-300 pl-2 border-l border-slate-800 animate-in fade-in duration-200">
                    {currentQuestion.expectedPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Active Follow-up Probe Alert (if active) */}
            {pendingFollowUp && (
              <div className="mt-4 p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                    Interviewer Follow-up Probe
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[10px]">
                    Turn 2
                  </span>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  "{pendingFollowUp}"
                </p>
                <p className="text-[11px] text-purple-200/80">
                  Use the candidate box to answer this probe, or click "Next Question" below to move on.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Candidate Stage, Video Mirror & Speech Input (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Candidate Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
            {/* Candidate Header / Camera Row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Candidate Stream
                </span>
                {isListening && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    MIC RECORDING
                  </span>
                )}
              </div>

              {/* Device Toggles */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                    cameraActive
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                  title={cameraActive ? 'Turn Off Webcam' : 'Turn On Webcam'}
                >
                  {cameraActive ? <Video className="w-3.5 h-3.5 text-indigo-400" /> : <VideoOff className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{cameraActive ? 'Camera ON' : 'Camera OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                      : 'bg-indigo-600/20 border-indigo-500 text-indigo-200 hover:bg-indigo-600/30'
                  }`}
                >
                  {isListening ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Stop Mic' : 'Start Mic'}</span>
                </button>
              </div>
            </div>

            {/* Webcam Preview (if active) */}
            {cameraActive && (
              <div className="relative aspect-video max-h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-slate-300 font-mono">
                  Candidate Camera Preview
                </div>
              </div>
            )}

            {/* Transcript & Answer Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-slate-300">
                  {isAnsweringFollowUp ? 'Follow-up Response Transcript' : 'Your Answer Transcript'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {activeAnswerText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              <textarea
                value={activeAnswerText}
                onChange={(e) => {
                  if (isAnsweringFollowUp) {
                    setFollowUpAnswer(e.target.value);
                  } else {
                    setCandidateAnswer(e.target.value);
                  }
                }}
                rows={cameraActive ? 5 : 8}
                placeholder={
                  recognitionSupported
                    ? 'Click "Start Mic" and speak your answer out loud, or type/paste your answer here directly...'
                    : 'Type your interview response here...'
                }
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans leading-relaxed resize-y"
              />

              {!recognitionSupported && (
                <p className="text-xs text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Speech Recognition not natively supported in this browser. You can type answers freely.
                </p>
              )}
            </div>

            {/* Live Filler Word Chips */}
            {fillerData.breakdown.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 font-medium">Detected verbal fillers:</span>
                {fillerData.breakdown.map((item) => (
                  <span
                    key={item.word}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300"
                  >
                    "{item.word}": {item.count}
                  </span>
                ))}
              </div>
            )}

            {/* Instant Turn Feedback Card (shown after submission) */}
            {activeTurnAnalysis && (
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Real-Time Turn Analytics</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      Confidence: {activeTurnAnalysis.sentiment.confidenceScore}%
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      Tone: {activeTurnAnalysis.sentiment.primaryTone}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-200">
                    <span className="font-semibold block text-emerald-400 mb-0.5">Strength Highlight</span>
                    {activeTurnAnalysis.instantFeedback.strengthHighlight}
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-amber-200">
                    <span className="font-semibold block text-amber-400 mb-0.5">Quick Coaching Tip</span>
                    {activeTurnAnalysis.instantFeedback.constructiveTip}
                  </div>
                </div>

                {/* STAR Checklist (if applicable) */}
                <div className="pt-1">
                  <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                    STAR Structure Adherence:
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div
                      className={`py-1.5 px-1 rounded border font-medium ${
                        activeTurnAnalysis.instantFeedback.starAdherence.situationIdentified
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      [S] Situation
                    </div>
                    <div
                      className={`py-1.5 px-1 rounded border font-medium ${
                        activeTurnAnalysis.instantFeedback.starAdherence.taskIdentified
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      [T] Task
                    </div>
                    <div
                      className={`py-1.5 px-1 rounded border font-medium ${
                        activeTurnAnalysis.instantFeedback.starAdherence.actionIdentified
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      [A] Action
                    </div>
                    <div
                      className={`py-1.5 px-1 rounded border font-medium ${
                        activeTurnAnalysis.instantFeedback.starAdherence.resultIdentified
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      [R] Result
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkipQuestion}
                className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Skip Question
              </button>

              <div className="flex items-center gap-3">
                {!activeTurnAnalysis ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={isAnalyzingTurn || !activeAnswerText.trim()}
                    className="py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isAnalyzingTurn ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Analyzing Response...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Answer</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleProceedToNext}
                    className="py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>
                      {currentQuestionIndex + 1 < questions.length
                        ? 'Proceed to Next Question'
                        : 'Finish & Generate Scorecard'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
