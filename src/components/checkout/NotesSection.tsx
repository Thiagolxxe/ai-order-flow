
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { generateGeminiResponse } from '@/services/gemini';

interface NotesSectionProps {
  notes: string;
  setNotes: (value: string) => void;
  orderItems?: any[];
}

const NotesSection: React.FC<NotesSectionProps> = ({ 
  notes, 
  setNotes,
  orderItems = []
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (orderItems.length > 0) {
      generateSuggestions();
    }
  }, [orderItems]);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const itemsText = orderItems.map(item => 
        `${item.quantity}x ${item.name}`
      ).join(', ');

      const prompt = `
        Gere 3 sugestões úteis e curtas de instruções especiais para um pedido de comida.
        Os itens do pedido são: ${itemsText}
        
        As sugestões devem ser instruções específicas para a entrega ou preparo dos alimentos.
        Por exemplo: "Por favor, não coloque cebola no hambúrguer" ou "Entregar na portaria, falar com João"
        
        Responda apenas no formato:
        SUGGESTIONS: sugestão 1, sugestão 2, sugestão 3
      `;

      const response = await generateGeminiResponse(prompt);
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('Error generating note suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setNotes(suggestion);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-medium mb-4 text-lg">Observações</h2>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Instruções especiais para o pedido</Label>
          <Textarea 
            id="notes" 
            placeholder="Ex: Sem cebola, por favor. Campainha não funciona, ligar ao chegar." 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          
          {suggestions.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                <span>Sugestões:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {!isLoading && suggestions.length === 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-8 text-primary"
              onClick={generateSuggestions}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Gerar sugestões com IA
            </Button>
          )}
          
          {isLoading && (
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <div className="flex items-center space-x-2 mr-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-75"></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-150"></div>
              </div>
              Gerando sugestões...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotesSection;
