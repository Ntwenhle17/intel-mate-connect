import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Download, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flashcard } from '@/types/study';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';

interface FlashcardDeckProps {
  flashcards: Flashcard[];
  topic?: string;
}

export const FlashcardDeck = ({ flashcards, topic }: FlashcardDeckProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (flashcards.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        No flashcards yet. Generate some by asking about an AI topic!
      </Card>
    );
  }

  const currentCard = flashcards[currentIndex];

  const goNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const goPrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(topic || 'Flashcards', 20, 20);
    doc.setFontSize(12);
    
    let yPos = 40;
    flashcards.forEach((card, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`Q${index + 1}: ${card.question}`, 20, yPos, { maxWidth: 170 });
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.text(`A: ${card.answer}`, 20, yPos, { maxWidth: 170 });
      yPos += 20;
    });
    
    doc.save(`${topic || 'flashcards'}.pdf`);
  };

  const speakCard = () => {
    const text = isFlipped ? currentCard.answer : currentCard.question;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={speakCard}>
            <Volume2 size={16} className="mr-1" /> Listen
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPDF}>
            <Download size={16} className="mr-1" /> PDF
          </Button>
        </div>
      </div>

      <div
        className={cn('flashcard cursor-pointer h-64', isFlipped && 'flipped')}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flashcard-inner relative w-full h-full">
          <Card className="flashcard-front absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-primary/10 to-accent/10">
            <p className="text-lg text-center font-medium">{currentCard.question}</p>
          </Card>
          <Card className="flashcard-back absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-br from-accent/10 to-primary/10">
            <p className="text-lg text-center">{currentCard.answer}</p>
          </Card>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" size="icon" onClick={goPrev}>
          <ChevronLeft size={20} />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setIsFlipped(false)}>
          <RotateCcw size={20} />
        </Button>
        <Button variant="outline" size="icon" onClick={goNext}>
          <ChevronRight size={20} />
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Click card to flip
      </p>
    </div>
  );
};
