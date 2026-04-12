import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

import { scrapeJob } from '../services/scraper';
import { parseCV } from '../services/parser';
import { generateSummary, nextStep } from '../services/gemini';
import { createSession, getSession, addMessage } from '../store/session';
import { AI_CONTEXT } from '../config';

const router = express.Router();

const upload = multer({
  limits: { fileSize: AI_CONTEXT.MAX_FILE_SIZE },
});

router.post('/start', upload.single('cv'), async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !req.file) {
      return res.status(400).json({ error: 'URL & CV required' });
    }

    const jobText = await scrapeJob(url);
    const cvText = await parseCV(req.file.buffer);

    const sessionId = uuidv4();

    createSession(sessionId, jobText, cvText);

    const first = await nextStep(jobText, cvText, [], 0);

    addMessage(sessionId, 'ai', first);

    res.json({
      sessionId,
      ...first,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start interview' });
  }
});

router.post('/answer', async (req, res) => {
  try {
    const { answer } = req.body;
    const sessionId = req.get('X-Session-ID');

    if (!sessionId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.questionCount >= AI_CONTEXT.MAX_QUESTIONS) {
      res.statusCode = 204;
      return res.json();
    }

    addMessage(sessionId, 'user', answer);

    const reply = await nextStep(
      session.jobText,
      session.cvText,
      session.history,
      session.questionCount,
    );

    addMessage(sessionId, 'ai', reply);

    res.json(reply);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process answer' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const sessionId = req.get('X-Session-ID');
    if (!sessionId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const summary = await generateSummary(session.history);

    return res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process summary' });
  }
});

export default router;
