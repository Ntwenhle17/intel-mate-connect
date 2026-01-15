export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Flashcard {
  id?: string;
  question: string;
  answer: string;
  topic?: string;
  deck_name?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id?: string;
  title: string;
  topic?: string;
  questions: QuizQuestion[];
  score?: number;
  total_questions?: number;
  completed_at?: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface MindMap {
  id?: string;
  title: string;
  topic: string;
  nodes: MindMapNode[];
}

export interface Note {
  id?: string;
  title: string;
  content: string;
  topic?: string;
  is_uploaded?: boolean;
  created_at?: string;
}

export interface ChatHistory {
  id?: string;
  topic: string;
  messages: Message[];
  created_at?: string;
  updated_at?: string;
}
