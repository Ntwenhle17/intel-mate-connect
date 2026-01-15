import { useState } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSend, isLoading, placeholder = "Ask me anything about AI, ML, NLP..." }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

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

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      // For now, we'll show a toast that speech-to-text is coming soon
      // In production, you'd integrate with a speech-to-text API
    } else {
      try {
        await startRecording();
      } catch (error) {
        console.error('Failed to start recording:', error);
      }
    }
  };

  return (
    <div className="flex gap-2 items-end p-4 border-t bg-card">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleRecording}
        className={cn(
          'flex-shrink-0',
          isRecording && 'bg-destructive text-destructive-foreground recording-pulse'
        )}
      >
        {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
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
