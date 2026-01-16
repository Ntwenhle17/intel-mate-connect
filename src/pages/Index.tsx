import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Brain, MessageSquare, BookOpen, Upload, LogOut, Menu, X, Eye, Headphones, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/study/ChatMessage';
import { ChatInput } from '@/components/study/ChatInput';
import { TopicGenerator } from '@/components/study/TopicGenerator';
import { NotesUpload } from '@/components/study/NotesUpload';
import { NotesList } from '@/components/study/NotesList';
import { VisualLearning } from '@/components/study/VisualLearning';
import { AudioLearning } from '@/components/study/AudioLearning';
import { ReadingWritingLearning } from '@/components/study/ReadingWritingLearning';
import { LanguageSelector, SOUTH_AFRICAN_LANGUAGES } from '@/components/study/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useStudyBuddy } from '@/hooks/useStudyBuddy';
import { Note } from '@/types/study';
import { useToast } from '@/hooks/use-toast';
const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, streamChat } = useStudyBuddy(selectedLanguage);

  const selectedLangName = SOUTH_AFRICAN_LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName || 'English';

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchNotes = async () => {
    if (!user) return;
    const { data } = await supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setNotes(data as Note[]);
  };

  const handleDeleteNote = async (id: string) => {
    await supabase.from('notes').delete().eq('id', id);
    fetchNotes();
    toast({ title: 'Note deleted' });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Brain className="w-12 h-12 animate-pulse text-primary" /></div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Study Buddy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-48 hidden sm:block">
              <LanguageSelector value={selectedLanguage} onChange={setSelectedLanguage} />
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut size={16} className="mr-2" /> Sign Out
            </Button>
          </div>
        </div>
        {/* Mobile language selector */}
        <div className="sm:hidden px-4 pb-3">
          <LanguageSelector value={selectedLanguage} onChange={setSelectedLanguage} />
        </div>
      </header>

      <div className="container px-4 py-6">
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 max-w-2xl mx-auto">
            <TabsTrigger value="chat"><MessageSquare size={16} className="mr-1" />Chat</TabsTrigger>
            <TabsTrigger value="study"><BookOpen size={16} className="mr-1" />Study</TabsTrigger>
            <TabsTrigger value="visual"><Eye size={16} className="mr-1" />Visual</TabsTrigger>
            <TabsTrigger value="audio"><Headphones size={16} className="mr-1" />Audio</TabsTrigger>
            <TabsTrigger value="writing"><PenTool size={16} className="mr-1" />Writing</TabsTrigger>
            <TabsTrigger value="notes"><Upload size={16} className="mr-1" />Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card className="h-[calc(100vh-260px)] sm:h-[calc(100vh-220px)] flex flex-col">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Chat with Study Buddy</h2>
                <p className="text-sm text-muted-foreground">
                  Ask about anything — science, history, languages, life quotes, and more! 
                  <span className="ml-1 text-primary">({selectedLangName})</span>
                </p>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Start a conversation about any topic!</p>
                      <p className="text-sm mt-2">Ask about science, animals, history, life quotes, or anything you want to learn!</p>
                    </div>
                  )}
                  {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <ChatInput onSend={streamChat} isLoading={isLoading} />
            </Card>
          </TabsContent>

          <TabsContent value="study">
            <TopicGenerator language={selectedLanguage} />
          </TabsContent>

          <TabsContent value="visual">
            <VisualLearning language={selectedLanguage} />
          </TabsContent>

          <TabsContent value="audio">
            <AudioLearning language={selectedLanguage} />
          </TabsContent>

          <TabsContent value="writing">
            <ReadingWritingLearning language={selectedLanguage} />
          </TabsContent>

          <TabsContent value="notes">
            <div className="grid md:grid-cols-2 gap-6">
              <NotesUpload userId={user.id} onUpload={fetchNotes} />
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Notes</h3>
                <NotesList notes={notes} onDelete={handleDeleteNote} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
