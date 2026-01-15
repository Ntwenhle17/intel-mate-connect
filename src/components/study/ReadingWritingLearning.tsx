import { useState } from 'react';
import { BookOpen, FileText, Sparkles, Save, Download, Loader2, PenTool, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudyBuddy } from '@/hooks/useStudyBuddy';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

interface WritingPrompt {
  topic: string;
  prompt: string;
  hints: string[];
}

interface ReadingWritingLearningProps {
  language?: string;
}

export const ReadingWritingLearning = ({ language = 'en' }: ReadingWritingLearningProps) => {
  const [topic, setTopic] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [textToSummarize, setTextToSummarize] = useState('');
  const [writingPrompt, setWritingPrompt] = useState<WritingPrompt | null>(null);
  const [userResponse, setUserResponse] = useState('');
  const [feedback, setFeedback] = useState('');
  
  const { isLoading, summarizeText, generateWritingPrompt, evaluateWriting, generateNotes } = useStudyBuddy(language);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!textToSummarize.trim()) return;
    const result = await summarizeText(textToSummarize);
    if (result) setSummary(result);
  };

  const handleGeneratePrompt = async () => {
    if (!topic.trim()) return;
    const prompt = await generateWritingPrompt(topic);
    if (prompt) {
      setWritingPrompt(prompt);
      setUserResponse('');
      setFeedback('');
    }
  };

  const handleEvaluateWriting = async () => {
    if (!userResponse.trim() || !writingPrompt) return;
    const result = await evaluateWriting(writingPrompt.prompt, userResponse);
    if (result) setFeedback(result);
  };

  const handleGenerateNotes = async () => {
    if (!topic.trim()) return;
    const notes = await generateNotes(topic);
    if (notes) {
      setNoteContent(notes);
      setNoteTitle(`Notes: ${topic}`);
    }
  };

  const saveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      toast({ title: 'Please add a title and content', variant: 'destructive' });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Please sign in to save notes', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('notes').insert({
      user_id: user.id,
      title: noteTitle,
      content: noteContent,
      topic: topic || null,
      is_uploaded: false,
    });

    if (error) {
      toast({ title: 'Failed to save note', variant: 'destructive' });
    } else {
      toast({ title: 'Note saved successfully!' });
    }
  };

  const downloadNotePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(noteTitle || 'Study Notes', 20, 20);
    
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(noteContent, 170);
    doc.text(lines, 20, 35);
    
    doc.save(`${(noteTitle || 'notes').replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="text-success" size={20} />
          Reading & Writing Tools
        </h3>

        <Tabs defaultValue="notes">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notes">Note-Taking</TabsTrigger>
            <TabsTrigger value="summarize">Summarize</TabsTrigger>
            <TabsTrigger value="writing">Writing Prompts</TabsTrigger>
          </TabsList>

          {/* Note-Taking */}
          <TabsContent value="notes" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic for AI-generated notes..."
              />
              <Button onClick={handleGenerateNotes} disabled={isLoading || !topic.trim()}>
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span className="ml-2">Generate</span>
              </Button>
            </div>

            <Input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note title..."
            />

            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your notes here... Rewrite concepts in your own words for better understanding."
              className="w-full h-64 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />

            <div className="flex gap-2">
              <Button onClick={saveNote} disabled={!noteContent.trim()}>
                <Save size={16} className="mr-2" /> Save to Notes
              </Button>
              <Button variant="outline" onClick={downloadNotePDF} disabled={!noteContent.trim()}>
                <Download size={16} className="mr-2" /> Download PDF
              </Button>
            </div>
          </TabsContent>

          {/* Summarization */}
          <TabsContent value="summarize" className="mt-4 space-y-4">
            <textarea
              value={textToSummarize}
              onChange={(e) => setTextToSummarize(e.target.value)}
              placeholder="Paste long text here to get a condensed summary..."
              className="w-full h-40 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary"
            />

            <Button onClick={handleSummarize} disabled={isLoading || !textToSummarize.trim()}>
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              <span className="ml-2">Summarize</span>
            </Button>

            {summary && (
              <Card className="p-4 bg-muted/50">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" /> Summary
                </h4>
                <p className="text-sm whitespace-pre-wrap">{summary}</p>
              </Card>
            )}
          </TabsContent>

          {/* Writing Prompts */}
          <TabsContent value="writing" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic for a writing prompt..."
              />
              <Button onClick={handleGeneratePrompt} disabled={isLoading || !topic.trim()}>
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <PenTool size={16} />}
                <span className="ml-2">Get Prompt</span>
              </Button>
            </div>

            {writingPrompt && (
              <Card className="p-4 border-l-4 border-l-primary">
                <h4 className="font-semibold mb-2">{writingPrompt.topic}</h4>
                <p className="text-sm mb-3">{writingPrompt.prompt}</p>
                <div className="text-xs text-muted-foreground">
                  <strong>Hints:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {writingPrompt.hints.map((hint, i) => (
                      <li key={i}>{hint}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}

            {writingPrompt && (
              <>
                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Write your response here... Explain the topic in your own words."
                  className="w-full h-40 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary"
                />

                <Button onClick={handleEvaluateWriting} disabled={isLoading || !userResponse.trim()}>
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                  <span className="ml-2">Get Feedback</span>
                </Button>

                {feedback && (
                  <Card className="p-4 bg-success/10 border-success/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-success">
                      <MessageSquare size={16} /> AI Feedback
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{feedback}</p>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
