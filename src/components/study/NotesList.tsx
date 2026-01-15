import { useState } from 'react';
import { FileText, Download, Volume2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Note } from '@/types/study';
import { jsPDF } from 'jspdf';
import { cn } from '@/lib/utils';

interface NotesListProps {
  notes: Note[];
  onDelete?: (id: string) => void;
}

export const NotesList = ({ notes, onDelete }: NotesListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const downloadPDF = (note: Note) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(note.title, 20, 20);
    
    if (note.topic) {
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Topic: ${note.topic}`, 20, 30);
      doc.setTextColor(0);
    }
    
    doc.setFontSize(12);
    const splitContent = doc.splitTextToSize(note.content, 170);
    doc.text(splitContent, 20, 45);
    
    doc.save(`${note.title.replace(/\s+/g, '-')}.pdf`);
  };

  const speakNote = (note: Note) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${note.title}. ${note.content}`);
    speechSynthesis.speak(utterance);
  };

  const downloadAudio = async (note: Note) => {
    // For now, we'll use the browser's speech synthesis
    // In production, you'd use a TTS API to generate an audio file
    speakNote(note);
  };

  if (notes.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        No notes yet. Upload some notes or ask the AI to generate them!
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <Card key={note.id} className="overflow-hidden">
          <button
            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            onClick={() => setExpandedId(expandedId === note.id ? null : note.id!)}
          >
            <div className="flex items-center gap-3 text-left">
              <FileText size={20} className="text-primary flex-shrink-0" />
              <div>
                <h4 className="font-medium">{note.title}</h4>
                {note.topic && (
                  <span className="text-sm text-muted-foreground">{note.topic}</span>
                )}
              </div>
            </div>
            {expandedId === note.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {expandedId === note.id && (
            <div className="px-4 pb-4 border-t">
              <div className="pt-4 prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {note.content}
                </pre>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => downloadPDF(note)}>
                  <Download size={14} className="mr-1" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => speakNote(note)}>
                  <Volume2 size={14} className="mr-1" /> Listen
                </Button>
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(note.id!)}
                  >
                    <Trash2 size={14} className="mr-1" /> Delete
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
