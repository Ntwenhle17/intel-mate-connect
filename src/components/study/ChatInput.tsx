import { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSend, isLoading, placeholder = "Ask me anything about AI, ML, NLP..." }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording } = useAudioRecorder();
  const { toast } = useToast();
  const hasTranscribedRef = useRef(false);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    if (hasTranscribedRef.current) return;
    hasTranscribedRef.current = true;
    setIsTranscribing(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64Audio = await base64Promise;

      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio },
      });

      if (error) throw error;

      if (data?.text) {
        setInput((prev) => prev + (prev ? ' ' : '') + data.text);
        toast({ title: 'Audio transcribed!', description: data.text.substring(0, 50) + '...' });
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast({ 
        title: 'Transcription failed', 
        description: 'Could not transcribe audio. Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setIsTranscribing(false);
      clearRecording();
      hasTranscribedRef.current = false;
    }
  };

  // Effect to transcribe when audioBlob is available
  useEffect(() => {
    if (audioBlob && !isTranscribing && !isRecording) {
      transcribeAudio(audioBlob);
    }
  }, [audioBlob, isRecording]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        hasTranscribedRef.current = false;
        clearRecording();
        await startRecording();
      } catch (error) {
        console.error('Failed to start recording:', error);
        toast({
          title: 'Microphone access denied',
          description: 'Please allow microphone access to use voice input.',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <div className="flex gap-2 items-end p-4 border-t bg-card">
      <Button
        variant="outline"
        size="icon"
        onClick={handleToggleRecording}
        disabled={isTranscribing}
        className={cn(
          'flex-shrink-0',
          isRecording && 'bg-destructive text-destructive-foreground recording-pulse',
          isTranscribing && 'animate-pulse'
        )}
      >
        {isTranscribing ? (
          <Loader2 size={18} className="animate-spin" />
        ) : isRecording ? (
          <MicOff size={18} />
        ) : (
          <Mic size={18} />
        )}
      </Button>
      
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[44px] max-h-[120px] resize-none"
        disabled={isLoading}
      />
      
      <Button
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
        className="flex-shrink-0"
      >
        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
      </Button>
    </div>
  );
};
