import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy/safe initialization of Google GenAI
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. Generate Interview Questions
app.post('/api/interview/generate-questions', async (req, res) => {
  try {
    const {
      role = 'Full Stack Software Engineer',
      seniority = 'Mid-Level',
      targetCompany = 'Google',
      interviewType = 'technical',
      questionCount = 4,
      resumeSnippet = '',
      jobDescription = '',
    } = req.body;

    const ai = getAIClient();

    const prompt = `
You are an elite, highly experienced principal interviewer and hiring committee bar-raiser at top tier tech firms (such as ${targetCompany}).
Generate ${questionCount} realistic, rigorous, and engaging interview questions for:
- Role: ${role}
- Seniority: ${seniority}
- Target Company Culture: ${targetCompany}
- Interview Style/Type: ${interviewType} (e.g. technical, behavioral STAR, system design, case study)
${resumeSnippet ? `- Candidate Resume Highlights: ${resumeSnippet}` : ''}
${jobDescription ? `- Target Job Description: ${jobDescription}` : ''}

Make sure questions range across fundamentals, deep-dives, scenario-based dilemmas, and practical trade-offs suitable for a ${seniority} candidate.
Return JSON strictly according to the schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a premier executive tech interviewer. Generate realistic, challenging, and insightful interview questions.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interviewerPersona: {
              type: Type.STRING,
              description: 'Brief bio and tone of the interviewer persona',
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING, description: 'e.g. Architecture, STAR Behavioral, Problem Solving, Data Structures, Leadership' },
                  question: { type: Type.STRING },
                  contextTip: { type: Type.STRING, description: 'Tip for candidate on how to structure their answer' },
                  expectedPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '3-4 key elements a top candidate should mention',
                  },
                  recommendedMinutes: { type: Type.NUMBER, description: 'Recommended answer time in minutes (2 to 4)' },
                },
                required: ['id', 'category', 'question', 'contextTip', 'expectedPoints', 'recommendedMinutes'],
              },
            },
          },
          required: ['interviewerPersona', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating interview questions:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate questions',
    });
  }
});

// 2. Real-time Answer Feedback & Conversational Follow-up
app.post('/api/interview/analyze-answer', async (req, res) => {
  try {
    const {
      question,
      candidateAnswer,
      role = 'Software Engineer',
      seniority = 'Mid-Level',
      company = 'Google',
      turnCount = 1,
    } = req.body;

    if (!candidateAnswer || candidateAnswer.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'No answer provided' });
    }

    const ai = getAIClient();

    const prompt = `
You are conducting a live mock interview at ${company} for a ${seniority} ${role}.
The candidate just responded to the question:
Question: "${question}"
Candidate Answer: "${candidateAnswer}"

Analyze the candidate's answer for:
1. Sentiment & emotional tone (Confidence, Hesitation, Defensiveness, Enthusiasm, Clarity, Structure).
2. STAR methodology alignment (if behavioral) or Technical problem-solving depth (if technical).
3. Immediate actionable praise and 1 crisp constructive tip.
4. If this is turn 1 and the answer needs probing or clarification, generate a realistic interviewer follow-up question (e.g., "Interesting. How would you handle race conditions in that design?" or "Can you quantify the business outcome of that initiative?").
If turnCount > 1 or the answer was already thoroughly exhaustive, conclude and mark isReadyForNextQuestion as true.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: {
              type: Type.OBJECT,
              properties: {
                primaryTone: { type: Type.STRING, description: 'e.g., Confident, Hesitant, Articulate, Nervous, Analytical, Passionate' },
                confidenceScore: { type: Type.INTEGER, description: '0 to 100 confidence level' },
                clarityScore: { type: Type.INTEGER, description: '0 to 100 clarity level' },
                sentimentPolarity: { type: Type.STRING, description: 'positive, neutral, tentative, or stressed' },
                emotionalKeywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '3-4 descriptive keywords like ["Decisive", "Composed", "Slightly Rambling"]',
                },
              },
              required: ['primaryTone', 'confidenceScore', 'clarityScore', 'sentimentPolarity', 'emotionalKeywords'],
            },
            instantFeedback: {
              type: Type.OBJECT,
              properties: {
                strengthHighlight: { type: Type.STRING },
                constructiveTip: { type: Type.STRING },
                starAdherence: {
                  type: Type.OBJECT,
                  properties: {
                    situationIdentified: { type: Type.BOOLEAN },
                    taskIdentified: { type: Type.BOOLEAN },
                    actionIdentified: { type: Type.BOOLEAN },
                    resultIdentified: { type: Type.BOOLEAN },
                    summary: { type: Type.STRING },
                  },
                  required: ['situationIdentified', 'taskIdentified', 'actionIdentified', 'resultIdentified', 'summary'],
                },
              },
              required: ['strengthHighlight', 'constructiveTip', 'starAdherence'],
            },
            interviewerSpokenReaction: {
              type: Type.STRING,
              description: 'Natural 1-2 sentence spoken reaction by interviewer (e.g. "Thanks for breaking that down. I appreciate your focus on scalability. Let me dig a bit deeper...")',
            },
            followUpQuestion: {
              type: Type.STRING,
              description: 'Follow-up probe question or empty string if ready to move to next question',
            },
            isReadyForNextQuestion: {
              type: Type.BOOLEAN,
              description: 'True if we should proceed to the next interview question',
            },
          },
          required: ['sentiment', 'instantFeedback', 'interviewerSpokenReaction', 'followUpQuestion', 'isReadyForNextQuestion'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error analyzing answer:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze candidate answer',
    });
  }
});

// 3. Full Comprehensive Evaluation & Scorecard
app.post('/api/interview/evaluate-full', async (req, res) => {
  try {
    const {
      interviewContext,
      qaHistory,
      totalDurationSeconds = 0,
      speechStats = {},
    } = req.body;

    const ai = getAIClient();

    const prompt = `
You are the Lead Bar Raiser and Hiring Committee Chair at ${interviewContext.targetCompany || 'Top Tech Company'}.
You are conducting the definitive evaluation of a candidate for the ${interviewContext.seniority || 'Mid-Level'} ${interviewContext.role || 'Software Engineer'} role.

Interview Style: ${interviewContext.interviewType}
Total Practice Duration: ${Math.round(totalDurationSeconds / 60)} minutes
Candidate Speech Metrics:
- Average Words Per Minute (WPM): ${speechStats.averageWpm || '130'}
- Total Filler Words: ${speechStats.totalFillerWords || '0'} (Words like "um", "like", "you know", "basically")
- Audio tone consistency: ${speechStats.toneTrajectory || 'Steady'}

Candidate Q&A History:
${JSON.stringify(qaHistory, null, 2)}

Provide an authoritative, detailed, constructive candidate evaluation report according to the JSON schema.
Include:
1. Overall candidate score (0-100) and hiring decision ("Strong Hire", "Hire", "Lean Hire", "Lean No Hire", "No Hire").
2. Executive summary verdict.
3. Scoring across 5 core dimensions (0-100 each + rationale):
   - Technical Accuracy & Problem Solving
   - Communication & Articulation
   - STAR Structure & Methodological Rigor
   - Confidence & Executive Presence
   - Culture & Leadership Impact
4. Detailed per-question critique with:
   - Specific strengths
   - Missed opportunities / weaknesses
   - Top 1% "Golden Exemplar Answer" showing what a world-class response looks like
5. 3 concrete, high-impact practice drills the candidate should focus on before their real interview.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: '0 to 100' },
            hiringDecision: {
              type: Type.STRING,
              description: 'Strong Hire, Hire, Lean Hire, Lean No Hire, or No Hire',
            },
            summaryVerdict: { type: Type.STRING, description: '2-3 sentence executive summary' },
            dimensionScores: {
              type: Type.OBJECT,
              properties: {
                technicalAccuracy: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.INTEGER }, rationale: { type: Type.STRING } },
                  required: ['score', 'rationale'],
                },
                communicationClarity: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.INTEGER }, rationale: { type: Type.STRING } },
                  required: ['score', 'rationale'],
                },
                starStructure: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.INTEGER }, rationale: { type: Type.STRING } },
                  required: ['score', 'rationale'],
                },
                confidenceAndPresence: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.INTEGER }, rationale: { type: Type.STRING } },
                  required: ['score', 'rationale'],
                },
                leadershipAndImpact: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.INTEGER }, rationale: { type: Type.STRING } },
                  required: ['score', 'rationale'],
                },
              },
              required: ['technicalAccuracy', 'communicationClarity', 'starStructure', 'confidenceAndPresence', 'leadershipAndImpact'],
            },
            speechAndPacingReview: {
              type: Type.OBJECT,
              properties: {
                pacingVerdict: { type: Type.STRING },
                fillerWordImpact: { type: Type.STRING },
                sentimentTrajectory: { type: Type.STRING },
              },
              required: ['pacingVerdict', 'fillerWordImpact', 'sentimentTrajectory'],
            },
            perQuestionFeedback: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionId: { type: Type.STRING },
                  question: { type: Type.STRING },
                  score: { type: Type.INTEGER, description: '0 to 100' },
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  growthAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  goldenAnswer: { type: Type.STRING, description: 'Exemplary benchmark answer demonstrating ideal structure, depth, and poise' },
                },
                required: ['questionId', 'question', 'score', 'strengths', 'growthAreas', 'goldenAnswer'],
              },
            },
            recommendedActionDrills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 concrete practice drills',
            },
          },
          required: ['overallScore', 'hiringDecision', 'summaryVerdict', 'dimensionScores', 'speechAndPacingReview', 'perQuestionFeedback', 'recommendedActionDrills'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in evaluate-full:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete full evaluation',
    });
  }
});

// 4. Gemini TTS for Interviewer Voice
app.post('/api/interview/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Text is required for TTS' });
    }

    const ai = getAIClient();

    // Use gemini-3.8-flash-lite-tts for fast and crystal-clear voice output
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 400), // keep speech concise and natural
              speechMetadata: {
                style: 'Professional, warm, encouraging technical interviewer',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      return res.json({
        success: true,
        audioData: `data:audio/wav;base64,${base64Audio}`,
      });
    }

    return res.json({
      success: false,
      fallbackToBrowser: true,
      message: 'No audio returned, client should use SpeechSynthesis',
    });
  } catch (error: any) {
    console.warn('TTS error (falling back to browser Web Speech API):', error.message);
    return res.json({
      success: false,
      fallbackToBrowser: true,
      error: error.message,
    });
  }
});

// Vite Middleware for Development / Static Serve for Production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
