import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ChevronRight, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Quiz, QuizQuestion } from '@/types/study';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';

interface QuizComponentProps {
  quiz: Quiz;
  onComplete?: (score: number, total: number) => void;
}

export const QuizComponent = ({ quiz, onComplete }: QuizComponentProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<{ question: number; selected: number; correct: number }[]>([]);

  const currentQuestion = quiz.questions[currentIndex];

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setShowResult(true);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setAnswers((prev) => [...prev, {
      question: currentIndex,
      selected: selectedAnswer,
      correct: currentQuestion.correctAnswer,
    }]);
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
      onComplete?.(score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0), quiz.questions.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsComplete(false);
    setAnswers([]);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(quiz.title, 20, 20);
    doc.setFontSize(12);
    doc.text(`Score: ${score}/${quiz.questions.length}`, 20, 35);
    
    let yPos = 50;
    quiz.questions.forEach((q, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${q.question}`, 20, yPos, { maxWidth: 170 });
      yPos += 10;
      q.options.forEach((opt, optIndex) => {
        doc.setFont('helvetica', optIndex === q.correctAnswer ? 'bold' : 'normal');
        doc.text(`   ${opt}${optIndex === q.correctAnswer ? ' ✓' : ''}`, 20, yPos);
        yPos += 7;
      });
      doc.setFont('helvetica', 'italic');
      doc.text(`   Explanation: ${q.explanation}`, 20, yPos, { maxWidth: 170 });
      yPos += 15;
    });
    
    doc.save(`${quiz.title.replace(/\s+/g, '-')}-quiz.pdf`);
  };

  if (isComplete) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <Card className="p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4"
        >
          <h3 className="text-2xl font-bold">Quiz Complete!</h3>
          <div className="text-6xl font-bold text-primary">{percentage}%</div>
          <p className="text-lg text-muted-foreground">
            You got {score} out of {quiz.questions.length} correct
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw size={16} className="mr-2" /> Try Again
            </Button>
            <Button onClick={downloadPDF}>
              <Download size={16} className="mr-2" /> Download Results
            </Button>
          </div>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {quiz.questions.length}
        </span>
        <span className="text-sm font-medium text-primary">
          Score: {score}
        </span>
      </div>

      <div className="mb-2 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
        />
      </div>

      <h3 className="text-lg font-medium mb-4 mt-6">{currentQuestion.question}</h3>

      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: showResult ? 1 : 1.01 }}
            whileTap={{ scale: showResult ? 1 : 0.99 }}
            onClick={() => handleSelect(index)}
            className={cn(
              'w-full p-4 rounded-lg border text-left transition-colors',
              selectedAnswer === index && !showResult && 'border-primary bg-primary/5',
              showResult && index === currentQuestion.correctAnswer && 'border-green-500 bg-green-500/10',
              showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && 'border-destructive bg-destructive/10',
              !showResult && selectedAnswer !== index && 'hover:border-primary/50'
            )}
          >
            <div className="flex items-center justify-between">
              <span>{option}</span>
              {showResult && index === currentQuestion.correctAnswer && (
                <Check className="text-green-500" size={20} />
              )}
              {showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                <X className="text-destructive" size={20} />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-muted rounded-lg"
        >
          <p className="text-sm">{currentQuestion.explanation}</p>
        </motion.div>
      )}

      <div className="mt-6 flex justify-end">
        {!showResult ? (
          <Button onClick={handleSubmit} disabled={selectedAnswer === null}>
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentIndex < quiz.questions.length - 1 ? (
              <>Next <ChevronRight size={16} className="ml-1" /></>
            ) : (
              'See Results'
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};
