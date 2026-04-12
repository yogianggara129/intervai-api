import dotenv from 'dotenv';
dotenv.config();

export const GEMINI = {
  API_KEY: process.env.GEMINI_API_KEY!,
  MODEL: process.env.GEMINI_MODEL!,
};

export const AI_CONTEXT = {
  MAX_QUESTIONS: Number(process.env.MAX_QUESTIONS!),
  MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE!),
};
