import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { generateGeminiResponse } from '@/services/geminiService';
import { MapPin, Sparkles } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface AIAddressHelperProps {
  onAddressSelect: (address: {
    street: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipcode: string;
  }) => void;
}

const AIAddressHelper: React.FC<AIAddressHelperProps> = ({ onAddressSelect }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    // Only load suggestions if user is logged in
    if (user?.id) {
      fetchAddressSuggestions();
    }
  }, [user?.id]);

  const fetchAddressSuggestions = async () => {
    setIsLoading(true);
    try {
      const prompt = `
        Gere sugestões de endereços comuns no Brasil no formato JSON para facilitar preenchimento.
        AUTOFILL: [
          {
            "label": "Exemplo - Centro SP",
            "street": "Avenida Paulista, 1000",
            "complement": "Apto 123",
            "neighborhood": "Bela Vista",
            "city": "São Paulo",
            "state": "SP",
            "zipcode": "01310-100"
          },
          {
            "label": "Exemplo - Zona Sul SP",
            "street": "Rua Oscar Freire, 500",
            "complement": "Casa 2",
            "neighborhood": "Jardins",
            "city": "São Paulo",
            "state": "SP",
            "zipcode": "01426-001"
          }
        ]
        Forneça 3 exemplos de endereços em diferentes regiões.
      `;

      const response = await generateGeminiResponse(prompt);
      
      // Extract JSON data from response
      const autofillMatch = response.responseText.match(/AUTOFILL:\s*(\[[\s\S]+?\])(?:\n\n|\n|$)/i);
      if (autofillMatch && autofillMatch[1]) {
        try {
          const suggestions = JSON.parse(autofillMatch[1]);
          setSuggestions(suggestions);
        } catch (e) {
          console.error('Failed to parse address suggestions:', e);
        }
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    onAddressSelect({
      street: suggestion.street,
      complement: suggestion.complement || '',
      neighborhood: suggestion.neighborhood,
      city: suggestion.city,
      state: suggestion.state,
      zipcode: suggestion.zipcode
    });
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center text-sm text-muted-foreground mb-2">
        <Sparkles className="mr-2 h-4 w-4 text-primary" />
        <span>Sugestões de endereços para testar:</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-left h-auto py-2 justify-start"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <MapPin className="mr-2 h-4 w-4 text-primary" />
            <div className="text-left">
              <div className="font-medium text-sm">{suggestion.label}</div>
              <div className="text-xs text-muted-foreground truncate">
                {suggestion.street}, {suggestion.neighborhood}, {suggestion.city}-{suggestion.state}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AIAddressHelper;
