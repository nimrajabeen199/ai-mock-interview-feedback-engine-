// Speech-to-text and speech analytics utilities

export const FILLER_WORDS = [
  'um',
  'uh',
  'like',
  'you know',
  'basically',
  'literally',
  'actually',
  'sort of',
  'kind of',
  'so yeah',
  'i mean',
  'right?',
  'honestly',
];

export interface FillerWordCount {
  word: string;
  count: number;
}

export function detectFillerWords(text: string): { total: number; breakdown: FillerWordCount[] } {
  if (!text || text.trim() === '') {
    return { total: 0, breakdown: [] };
  }

  const lower = text.toLowerCase();
  const breakdown: FillerWordCount[] = [];
  let total = 0;

  for (const phrase of FILLER_WORDS) {
    // Regex for phrase bounded by word boundaries or punctuation
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      breakdown.push({
        word: phrase,
        count: matches.length,
      });
      total += matches.length;
    }
  }

  breakdown.sort((a, b) => b.count - a.count);
  return { total, breakdown };
}

export function calculateWpm(text: string, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = durationSeconds / 60;
  if (minutes <= 0) return 0;
  return Math.round(words / minutes);
}

// Check if Web Speech API is supported
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

export function createSpeechRecognitionInstance(): any | null {
  if (typeof window === 'undefined') return null;
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) return null;

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    return recognition;
  } catch (err) {
    console.error('Failed to create SpeechRecognition instance:', err);
    return null;
  }
}

// Fallback Speech Synthesis (browser built-in)
export function speakWithBrowserSynthesis(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.lang = 'en-US';

  // Try to pick a natural English voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    (v) =>
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel')) &&
      v.lang.startsWith('en')
  );
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis error:', e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopBrowserSynthesis() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
