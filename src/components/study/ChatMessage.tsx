import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { Message } from '@/types/study';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-3 p-4 rounded-lg',
        isAssistant ? 'bg-muted' : 'bg-primary/5'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isAssistant ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
        )}
      >
        {isAssistant ? <Bot size={18} /> : <User size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium mb-1">
          {isAssistant ? 'AI Study Buddy' : 'You'}
        </p>
        <div className="text-sm text-foreground whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </motion.div>
  );
};
