import { useState } from 'react';
import { Eye, Headphones, BookOpen, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type LearningMode = 'visual' | 'audio' | 'reading';

interface LearningModeSelectorProps {
  selected: LearningMode[];
  onChange: (modes: LearningMode[]) => void;
}

const LEARNING_MODES = [
  {
    id: 'visual' as LearningMode,
    label: 'Visual',
    icon: Eye,
    description: 'Diagrams, mind maps, infographics',
    color: 'hsl(var(--primary))',
  },
  {
    id: 'audio' as LearningMode,
    label: 'Audio',
    icon: Headphones,
    description: 'Text-to-speech, podcasts, pronunciation',
    color: 'hsl(var(--accent))',
  },
  {
    id: 'reading' as LearningMode,
    label: 'Reading/Writing',
    icon: BookOpen,
    description: 'Notes, summaries, writing prompts',
    color: 'hsl(var(--success))',
  },
];

export const LearningModeSelector = ({ selected, onChange }: LearningModeSelectorProps) => {
  const toggleMode = (mode: LearningMode) => {
    if (selected.includes(mode)) {
      onChange(selected.filter((m) => m !== mode));
    } else {
      onChange([...selected, mode]);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {LEARNING_MODES.map((mode) => {
        const isSelected = selected.includes(mode.id);
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            onClick={() => toggleMode(mode.id)}
            className={cn(
              'relative p-4 rounded-xl border-2 transition-all duration-200 text-left',
              isSelected
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            )}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check size={12} className="text-primary-foreground" />
              </div>
            )}
            <Icon size={24} className="mb-2" style={{ color: mode.color }} />
            <h4 className="font-semibold text-sm">{mode.label}</h4>
            <p className="text-xs text-muted-foreground mt-1">{mode.description}</p>
          </button>
        );
      })}
    </div>
  );
};
