import { GoogleGenAI } from '@google/genai';
import { GEMINI, AI_CONTEXT } from '../config';

const ai = new GoogleGenAI({
  apiKey: GEMINI.API_KEY,
});

export async function nextStep(
  jobText: string,
  cvText: string,
  history: { role: string; content: string }[],
  questionCount: number,
) {
  const convo = history
    .map(
      (h) => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.content}`,
    )
    .join('\n');

  const prompt = `
You are a professional interviewer.

JOB DESCRIPTION:
${jobText}

CANDIDATE CV:
${cvText}

Conversation:
${convo}

Total questions allowed: ${AI_CONTEXT.MAX_QUESTIONS}
Current question number: ${questionCount + 1}

Instructions:
- Ask ONLY ONE question
- If candidate answered:
  - Give short feedback (strength + improvement)
  - Then ask next question
- Be concise and realistic
- Follow a logical interview flow (intro → experience → technical → behavioral → closing)
- Adjust based on current question number
- If this is the last question, make it a closing question.

Return JSON format:
{
  "feedback": "...",
  "question": "..."
}
`;

  const response = await callGemini(prompt);

  const clean = response?.text?.replace(/```json|```/g, '').trim() ?? '{}';
  const result = JSON.parse(clean);

  return result;
}

export async function generateSummary(
  history: { role: string; content: string }[],
) {
  const prompt = `
You are a senior technical interviewer and HR evaluator.

You will analyze the full interview conversation below and produce a FINAL EVALUATION REPORT.

IMPORTANT:
- Return ONLY valid JSON
- No markdown
- No explanation text

Interview conversation:
${history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

Return format:
{
  "overallScore": number (0-10),
  "technicalScore": number (0-10),
  "communicationScore": number (0-10),
  "strengths": string[],
  "weaknesses": string[],
  "summary": string,
  "recommendation": "strong_hire | hire | maybe | no_hire"
}
`;

  const res = await callGemini(prompt);

  const text = res?.text?.trim() || '';

  const cleaned = text.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse summary JSON: ' + cleaned);
  }
}

async function callGemini(prompt: string) {
  try {
    return await ai.models.generateContent({
      model: GEMINI.MODEL,
      contents: prompt,
    });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status === 503) {
      const overloaded = new Error(
        'Gemini model is currently overloaded (503)',
      ) as Error & { status: number };
      overloaded.status = 503;
      throw overloaded;
    }
    throw err;
  }
}
