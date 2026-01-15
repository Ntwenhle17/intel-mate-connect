import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotesUploadProps {
  userId: string;
  onUpload: () => void;
}

export const NotesUpload = ({ userId, onUpload }: NotesUploadProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain' && !file.name.endsWith('.md')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a .txt or .md file',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    const text = await file.text();
    setContent(text);
    setTitle(file.name.replace(/\.(txt|md)$/, ''));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide a title and content',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const { error } = await supabase.from('notes').insert({
        user_id: userId,
        title: title.trim(),
        content: content.trim(),
        topic: topic.trim() || null,
        is_uploaded: true,
      });

      if (error) throw error;

      toast({
        title: 'Notes uploaded!',
        description: 'Your notes have been saved successfully.',
      });

      setTitle('');
      setContent('');
      setTopic('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUpload();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error saving your notes.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setContent('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Upload Your Notes</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Upload a file (optional)</Label>
          <div className="mt-2 flex items-center gap-2">
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".txt,.md"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload size={16} className="mr-2" />
              {selectedFile ? selectedFile.name : 'Choose .txt or .md file'}
            </Button>
            {selectedFile && (
              <Button variant="ghost" size="icon" onClick={clearFile}>
                <X size={16} />
              </Button>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your notes"
          />
        </div>

        <div>
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Biology, History, Languages, Life Skills"
          />
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste or type your notes here..."
            className="min-h-[200px]"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isUploading || !title.trim() || !content.trim()}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <FileText size={16} className="mr-2" /> Save Notes
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
