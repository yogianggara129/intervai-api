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

  const response = await ai.models.generateContent({
    model: GEMINI.MODEL,
    contents: prompt,
  });

  const clean = response?.text?.replace(/```json|```/g, '').trim() ?? '{}';
  const result = JSON.parse(clean);

  return result;
}
