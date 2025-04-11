
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import StarRating from './StarRating';

interface ReviewFormProps {
  onSubmit: (data: {
    rating: number;
    comment: string;
    date: string;
  }) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma classificação de estrelas.",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit({
      rating,
      comment,
      date: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    });
    
    // Reset do formulário
    setRating(0);
    setComment('');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Deixe sua avaliação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Sua classificação</label>
            <StarRating rating={rating} setRating={setRating} />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Seu comentário</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte sua experiência..."
              rows={4}
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit">Enviar Avaliação</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
