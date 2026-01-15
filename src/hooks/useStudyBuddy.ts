import { useState, useCallback } from 'react';
import { Message, Quiz, Flashcard, MindMapNode } from '@/types/study';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-buddy-chat`;

interface PodcastLesson {
  title: string;
  content: string;
  duration: string;
}

interface WritingPrompt {
  topic: string;
  prompt: string;
  hints: string[];
}

export const useStudyBuddy = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const streamChat = useCallback(async (userMessage: string) => {
    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          action: 'chat',
        }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error('Failed to start stream');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const generateQuiz = useCallback(async (topic: string): Promise<Quiz | null> => {
    setIsLoading(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Generate a quiz about: ${topic}` }],
          action: 'generate_quiz',
          topic,
        }),
      });

      if (!resp.ok) throw new Error('Failed to generate quiz');

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        const quiz = JSON.parse(content);
        return quiz as Quiz;
      }
      return null;
    } catch (error) {
      console.error('Quiz generation error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateFlashcards = useCallback(async (topic: string): Promise<Flashcard[] | null> => {
    setIsLoading(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Generate flashcards about: ${topic}` }],
          action: 'generate_flashcards',
          topic,
        }),
      });

      if (!resp.ok) throw new Error('Failed to generate flashcards');

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        const flashcards = JSON.parse(content);
        return flashcards as Flashcard[];
      }
      return null;
    } catch (error) {
      console.error('Flashcard generation error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateMindMap = useCallback(async (topic: string): Promise<{ title: string; nodes: MindMapNode[] } | null> => {
    setIsLoading(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Generate a mind map about: ${topic}` }],
          action: 'generate_mindmap',
          topic,
        }),
      });

      if (!resp.ok) throw new Error('Failed to generate mind map');

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        const mindMap = JSON.parse(content);
        return mindMap;
      }
      return null;
    } catch (error) {
      console.error('Mind map generation error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateNotes = useCallback(async (topic: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Generate comprehensive study notes about: ${topic}` }],
          action: 'generate_notes',
          topic,
        }),
      });

      if (!resp.ok) throw new Error('Failed to generate notes');

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content;
      return content || null;
    } catch (error) {
      console.error('Notes generation error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateInfographic = useCallback(async (topic: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Create an infographic summary about: ${topic}` }],
          action: 'generate_infographic',
          topic,
        }),
      });

      if (!resp.ok) throw new Error('Failed to generate infographic');

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content;
      return content || null;
    } catch (error) {
      console.error('Infographic generation error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generatePodcast = useCallback(async (topic: string): Promise<PodcastLesson | null> => {
    setIsLoading(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Create a podcast-style lesson about: ${topic}` }],
          action: 'generate_podcast',
          topic,
        }),
      });

      if (!resp.ok) throw new Error('Failed to generate podcast');

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        try {
          return JSON.parse(content) as PodcastLesson;
        } catch {
          return { title: topic, content, duration: '5 min' };
        }
      }
      return null;
    } catch (error) {
      console.error('Podcast generation error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const summarizeText = useCallback(async (text: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Summarize the following text concisely:\n\n${text}` }],
          action: 'summarize',
        }),
      });

      if (!resp.ok) throw new Error('Failed to summarize');

      const data = await resp.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (error) {
      console.error('Summarization error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateWritingPrompt = useCallback(async (topic: string): Promise<WritingPrompt | null> => {
    setIsLoading(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Create a writing prompt about: ${topic}` }],
          action: 'generate_writing_prompt',
          topic,
        }),
      });

      if (!resp.ok) throw new Error('Failed to generate writing prompt');

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        try {
          return JSON.parse(content) as WritingPrompt;
        } catch {
          return { 
            topic, 
            prompt: content, 
            hints: ['Think about the key concepts', 'Use examples to illustrate', 'Summarize your understanding'] 
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Writing prompt generation error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const evaluateWriting = useCallback(async (prompt: string, response: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ 
            role: 'user', 
            content: `Evaluate this response to the writing prompt.\n\nPrompt: ${prompt}\n\nResponse: ${response}` 
          }],
          action: 'evaluate_writing',
        }),
      });

      if (!resp.ok) throw new Error('Failed to evaluate');

      const data = await resp.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (error) {
      console.error('Evaluation error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    streamChat,
    generateQuiz,
    generateFlashcards,
    generateMindMap,
    generateNotes,
    generateInfographic,
    generatePodcast,
    summarizeText,
    generateWritingPrompt,
    evaluateWriting,
    clearMessages,
  };
};
