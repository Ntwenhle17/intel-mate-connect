import { useState, useRef, useEffect } from 'react';
import { Headphones, Play, Pause, SkipBack, SkipForward, Volume2, Loader2, Download, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudyBuddy } from '@/hooks/useStudyBuddy';
import { useToast } from '@/hooks/use-toast';

const VOICES = [
  { id: 'en-US', name: 'English (US)' },
  { id: 'en-GB', name: 'English (UK)' },
  { id: 'es-ES', name: 'Spanish' },
  { id: 'fr-FR', name: 'French' },
  { id: 'de-DE', name: 'German' },
  { id: 'ja-JP', name: 'Japanese' },
  { id: 'zh-CN', name: 'Chinese' },
];

interface PodcastLesson {
  title: string;
  content: string;
  duration: string;
}

interface AudioLearningProps {
  language?: string;
}

export const AudioLearning = ({ language = 'en' }: AudioLearningProps) => {
  const [topic, setTopic] = useState('');
  const [textToSpeak, setTextToSpeak] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('en-US');
  const [speechRate, setSpeechRate] = useState([1]);
  const [podcast, setPodcast] = useState<PodcastLesson | null>(null);
  const [pronunciationWord, setPronunciationWord] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const { isLoading, generatePodcast } = useStudyBuddy(language);
  const { toast } = useToast();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const speak = (text: string, lang?: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate[0];
    
    const voice = availableVoices.find(v => v.lang.startsWith(lang || selectedVoice));
    if (voice) utterance.voice = voice;
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onstart = () => setIsPlaying(true);
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else if (textToSpeak.trim()) {
      speak(textToSpeak);
    }
  };

  const handleGeneratePodcast = async () => {
    if (!topic.trim()) return;
    const lesson = await generatePodcast(topic);
    if (lesson) {
      setPodcast(lesson);
      setTextToSpeak(lesson.content);
    }
  };

  const pronounceWord = () => {
    if (!pronunciationWord.trim()) return;
    // Speak slowly for pronunciation
    const utterance = new SpeechSynthesisUtterance(pronunciationWord);
    utterance.rate = 0.5;
    const voice = availableVoices.find(v => v.lang.startsWith(selectedVoice));
    if (voice) utterance.voice = voice;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Headphones className="text-accent" size={20} />
          Audio Learning Tools
        </h3>

        {/* Text-to-Speech Section */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-sm text-muted-foreground">Text-to-Speech</h4>
          
          <textarea
            value={textToSpeak}
            onChange={(e) => setTextToSpeak(e.target.value)}
            placeholder="Enter or paste text to listen to..."
            className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary"
          />

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={togglePlayPause} disabled={!textToSpeak.trim()}>
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
            </div>

            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="w-40">
                <Globe size={14} className="mr-2" />
                <SelectValue placeholder="Voice" />
              </SelectTrigger>
              <SelectContent>
                {VOICES.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 flex-1 min-w-[150px]">
              <Volume2 size={16} className="text-muted-foreground" />
              <Slider
                value={speechRate}
                onValueChange={setSpeechRate}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground w-12">{speechRate[0]}x</span>
            </div>
          </div>
        </div>

        {/* Podcast Generator */}
        <div className="space-y-4 mb-6 border-t pt-6">
          <h4 className="font-medium text-sm text-muted-foreground">Podcast-Style Lessons</h4>
          
          <div className="flex gap-2">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic for a podcast lesson..."
            />
            <Button onClick={handleGeneratePodcast} disabled={isLoading || !topic.trim()}>
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Headphones size={16} />}
              <span className="ml-2">Generate</span>
            </Button>
          </div>

          {podcast && (
            <Card className="p-4 bg-gradient-to-r from-accent/10 to-primary/10">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold">{podcast.title}</h5>
                <span className="text-sm text-muted-foreground">{podcast.duration}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{podcast.content.substring(0, 150)}...</p>
              <Button size="sm" onClick={() => speak(podcast.content)}>
                <Play size={14} className="mr-2" /> Play Lesson
              </Button>
            </Card>
          )}
        </div>

        {/* Pronunciation Guide */}
        <div className="space-y-4 border-t pt-6">
          <h4 className="font-medium text-sm text-muted-foreground">Pronunciation Guide</h4>
          
          <div className="flex gap-2">
            <Input
              value={pronunciationWord}
              onChange={(e) => setPronunciationWord(e.target.value)}
              placeholder="Enter a word or phrase to hear pronunciation..."
              onKeyDown={(e) => e.key === 'Enter' && pronounceWord()}
            />
            <Button variant="secondary" onClick={pronounceWord} disabled={!pronunciationWord.trim()}>
              <Volume2 size={16} className="mr-2" /> Pronounce
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Select a language above, then enter a word to hear how it's pronounced (slowly for clarity).
          </p>
        </div>
      </Card>
    </div>
  );
};
