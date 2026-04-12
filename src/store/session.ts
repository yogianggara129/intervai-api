type Message = {
  role: 'user' | 'ai';
  content: string;
};

type Session = {
  jobText: string;
  cvText: string;
  history: Message[];
  questionCount: number;
};

const sessions = new Map<string, Session>();

export function createSession(id: string, jobText: string, cvText: string) {
  sessions.set(id, {
    jobText,
    cvText,
    history: [],
    questionCount: 0,
  });
}

export function getSession(id: string) {
  return sessions.get(id);
}

export function addMessage(id: string, role: 'user' | 'ai', content: string) {
  const session = sessions.get(id);
  if (!session) return;

  session.history.push({ role, content });
  session.questionCount += 1;
}
