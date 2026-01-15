import { Globe, Hand } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  isSignLanguage?: boolean;
}

export const SOUTH_AFRICAN_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'zu', name: 'isiZulu', nativeName: 'isiZulu' },
  { code: 'xh', name: 'isiXhosa', nativeName: 'isiXhosa' },
  { code: 'nso', name: 'Sepedi', nativeName: 'Sepedi (Northern Sotho)' },
  { code: 'tn', name: 'Setswana', nativeName: 'Setswana' },
  { code: 'st', name: 'Sesotho', nativeName: 'Sesotho (Southern Sotho)' },
  { code: 'ts', name: 'Xitsonga', nativeName: 'Xitsonga' },
  { code: 'ss', name: 'siSwati', nativeName: 'siSwati' },
  { code: 've', name: 'Tshivenda', nativeName: 'Tshivenda' },
  { code: 'nr', name: 'isiNdebele', nativeName: 'isiNdebele' },
  { code: 'sasl', name: 'SA Sign Language', nativeName: 'South African Sign Language', isSignLanguage: true },
];

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const LanguageSelector = ({ value, onChange, className }: LanguageSelectorProps) => {
  const selectedLanguage = SOUTH_AFRICAN_LANGUAGES.find(l => l.code === value);

  return (
    <div className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            {selectedLanguage?.isSignLanguage ? (
              <Hand size={16} className="text-primary" />
            ) : (
              <Globe size={16} className="text-primary" />
            )}
            <SelectValue placeholder="Select language" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            South African Official Languages
          </div>
          {SOUTH_AFRICAN_LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                {lang.isSignLanguage ? (
                  <Hand size={14} className="text-primary" />
                ) : (
                  <span className="text-xs text-muted-foreground uppercase">{lang.code}</span>
                )}
                <span>{lang.nativeName}</span>
                {lang.isSignLanguage && (
                  <Badge variant="secondary" className="text-xs">Sign</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const getLanguagePrompt = (languageCode: string): string => {
  const language = SOUTH_AFRICAN_LANGUAGES.find(l => l.code === languageCode);
  if (!language) return '';
  
  if (language.isSignLanguage) {
    return `IMPORTANT: The user prefers South African Sign Language (SASL). 
When explaining concepts:
1. Describe visual representations and gestures where applicable
2. Use simple, clear sentence structures that translate well to sign language
3. When relevant, mention that certain concepts have specific signs in SASL
4. Focus on visual analogies and spatial descriptions
5. Provide step-by-step visual instructions when explaining processes`;
  }
  
  return `IMPORTANT: Please respond in ${language.nativeName} (${language.name}). 
If you cannot fully respond in ${language.nativeName}, provide the response in both ${language.nativeName} and English, 
with the ${language.nativeName} translation first.`;
};
