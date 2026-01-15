import { useState } from 'react';
import { Map, Image, Palette, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudyBuddy } from '@/hooks/useStudyBuddy';
import { MindMapView } from './MindMapView';
import { MindMapNode } from '@/types/study';
import { jsPDF } from 'jspdf';

const COLOR_TAGS = [
  { name: 'Important', color: 'hsl(0, 84%, 60%)' },
  { name: 'Definition', color: 'hsl(221, 83%, 53%)' },
  { name: 'Example', color: 'hsl(142, 76%, 36%)' },
  { name: 'Question', color: 'hsl(38, 92%, 50%)' },
  { name: 'Link', color: 'hsl(262, 83%, 58%)' },
];

interface HighlightedText {
  text: string;
  color: string;
  label: string;
}

interface VisualLearningProps {
  language?: string;
}

export const VisualLearning = ({ language = 'en' }: VisualLearningProps) => {
  const [topic, setTopic] = useState('');
  const [mindMap, setMindMap] = useState<{ title: string; nodes: MindMapNode[] } | null>(null);
  const [infographic, setInfographic] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<HighlightedText[]>([]);
  const [highlightText, setHighlightText] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_TAGS[0]);
  
  const { isLoading, generateMindMap, generateInfographic } = useStudyBuddy(language);

  const handleGenerateMindMap = async () => {
    if (!topic.trim()) return;
    const map = await generateMindMap(topic);
    if (map) setMindMap(map);
  };

  const handleGenerateInfographic = async () => {
    if (!topic.trim()) return;
    const info = await generateInfographic(topic);
    if (info) setInfographic(info);
  };

  const addHighlight = () => {
    if (!highlightText.trim()) return;
    setHighlights([...highlights, { 
      text: highlightText, 
      color: selectedColor.color,
      label: selectedColor.name 
    }]);
    setHighlightText('');
  };

  const downloadHighlightsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Study Highlights', 20, 20);
    
    let y = 40;
    highlights.forEach((h, i) => {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`[${h.label}]`, 20, y);
      doc.setFontSize(12);
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(h.text, 160);
      doc.text(lines, 50, y);
      y += lines.length * 7 + 10;
    });
    
    doc.save('study-highlights.pdf');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Map className="text-primary" size={20} />
          Visual Learning Tools
        </h3>
        
        <div className="flex gap-2 mb-6">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic to visualize..."
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateMindMap()}
          />
          <Button onClick={handleGenerateMindMap} disabled={isLoading || !topic.trim()}>
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Map size={16} />}
            <span className="ml-2 hidden sm:inline">Mind Map</span>
          </Button>
          <Button variant="secondary" onClick={handleGenerateInfographic} disabled={isLoading || !topic.trim()}>
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Image size={16} />}
            <span className="ml-2 hidden sm:inline">Infographic</span>
          </Button>
        </div>

        <Tabs defaultValue="mindmap">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
            <TabsTrigger value="infographic">Infographic</TabsTrigger>
            <TabsTrigger value="highlights">Color Coding</TabsTrigger>
          </TabsList>

          <TabsContent value="mindmap" className="mt-4">
            {mindMap ? (
              <MindMapView title={mindMap.title} nodes={mindMap.nodes} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground border rounded-lg">
                Enter a topic to generate a mind map
              </div>
            )}
          </TabsContent>

          <TabsContent value="infographic" className="mt-4">
            {infographic ? (
              <Card className="p-6 prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: infographic.replace(/\n/g, '<br/>') }} />
              </Card>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground border rounded-lg">
                Enter a topic to generate an infographic summary
              </div>
            )}
          </TabsContent>

          <TabsContent value="highlights" className="mt-4">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {COLOR_TAGS.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => setSelectedColor(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedColor.name === tag.name ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: tag.color, color: 'white' }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={highlightText}
                  onChange={(e) => setHighlightText(e.target.value)}
                  placeholder="Add text to highlight..."
                  onKeyDown={(e) => e.key === 'Enter' && addHighlight()}
                />
                <Button onClick={addHighlight} disabled={!highlightText.trim()}>
                  <Palette size={16} className="mr-2" /> Add
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {highlights.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg text-sm"
                    style={{ 
                      backgroundColor: `${h.color}20`,
                      borderLeft: `4px solid ${h.color}`
                    }}
                  >
                    <span className="text-xs font-medium opacity-70">[{h.label}]</span>
                    <p className="mt-1">{h.text}</p>
                  </div>
                ))}
              </div>

              {highlights.length > 0 && (
                <Button variant="outline" size="sm" onClick={downloadHighlightsPDF}>
                  <Download size={14} className="mr-2" /> Download Highlights PDF
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
