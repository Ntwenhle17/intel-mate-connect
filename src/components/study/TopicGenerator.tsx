import { useState } from 'react';
import { Sparkles, BookOpen, Brain, Map, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudyBuddy } from '@/hooks/useStudyBuddy';
import { FlashcardDeck } from './FlashcardDeck';
import { QuizComponent } from './QuizComponent';
import { MindMapView } from './MindMapView';
import { Flashcard, Quiz, MindMapNode } from '@/types/study';

const QUICK_TOPICS = [
  'Photosynthesis',
  'World War II',
  'Solar System',
  'African Wildlife',
  'Climate Change',
  'Human Body',
  'Mathematics',
  'Life Skills',
];

interface TopicGeneratorProps {
  language?: string;
}

export const TopicGenerator = ({ language = 'en' }: TopicGeneratorProps) => {
  const [topic, setTopic] = useState('');
  const [activeTab, setActiveTab] = useState('quiz');
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([]);
  const [generatedMindMap, setGeneratedMindMap] = useState<{ title: string; nodes: MindMapNode[] } | null>(null);
  
  const { isLoading, generateQuiz, generateFlashcards, generateMindMap } = useStudyBuddy(language);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    if (activeTab === 'quiz') {
      const quiz = await generateQuiz(topic);
      if (quiz) {
        setGeneratedQuiz(quiz);
      }
    } else if (activeTab === 'flashcards') {
      const cards = await generateFlashcards(topic);
      if (cards) {
        setGeneratedFlashcards(cards);
      }
    } else if (activeTab === 'mindmap') {
      const map = await generateMindMap(topic);
      if (map) {
        setGeneratedMindMap(map);
      }
    }
  };

  const handleQuickTopic = (t: string) => {
    setTopic(t);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Generate Study Materials</h3>
        
        <div className="flex gap-2 mb-4">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter any topic (e.g., Planets, History, Animals...)"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Button onClick={handleGenerate} disabled={isLoading || !topic.trim()}>
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            <span className="ml-2">Generate</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_TOPICS.map((t) => (
            <Button
              key={t}
              variant="outline"
              size="sm"
              onClick={() => handleQuickTopic(t)}
              className="text-xs"
            >
              {t}
            </Button>
          ))}
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <BookOpen size={16} /> Quiz
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <Brain size={16} /> Flashcards
          </TabsTrigger>
          <TabsTrigger value="mindmap" className="flex items-center gap-2">
            <Map size={16} /> Mind Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quiz" className="mt-4">
          {generatedQuiz ? (
            <QuizComponent quiz={generatedQuiz} />
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              Enter a topic and click Generate to create a quiz
            </Card>
          )}
        </TabsContent>

        <TabsContent value="flashcards" className="mt-4">
          <FlashcardDeck flashcards={generatedFlashcards} topic={topic} />
        </TabsContent>

        <TabsContent value="mindmap" className="mt-4">
          {generatedMindMap ? (
            <MindMapView title={generatedMindMap.title} nodes={generatedMindMap.nodes} />
          ) : (
            <Card className="p-8 text-center text-muted-foreground h-96 flex items-center justify-center">
              Enter a topic and click Generate to create a mind map
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
