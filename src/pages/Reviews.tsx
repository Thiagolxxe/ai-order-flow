
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { StarIcon } from '@/assets/icons';
import { useToast } from '@/hooks/use-toast';

// Componente para exibir as estrelas de avaliação
const StarRating = ({ 
  rating, 
  setRating,
  readOnly = false,
  size = 'default'
}: { 
  rating: number, 
  setRating?: (rating: number) => void,
  readOnly?: boolean,
  size?: 'default' | 'small' | 'large'
}) => {
  const handleSetRating = (value: number) => {
    if (!readOnly && setRating) {
      setRating(value);
    }
  };

  const sizeClass = {
    small: 'w-3 h-3',
    default: 'w-5 h-5',
    large: 'w-7 h-7'
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleSetRating(star)}
          className={`${!readOnly ? 'cursor-pointer' : 'cursor-default'} focus:outline-none`}
          disabled={readOnly}
        >
          <StarIcon
            className={`${
              star <= rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300 dark:text-gray-600'
            } ${sizeClass[size]}`}
          />
        </button>
      ))}
    </div>
  );
};

// Componente de card de avaliação
const ReviewCard = ({ review }: { review: any }) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{review.user}</h3>
              <span className="text-xs text-muted-foreground">{review.date}</span>
            </div>
            <StarRating rating={review.rating} readOnly size="small" />
          </div>
          {review.order && (
            <Badge variant="outline" className="text-xs">
              Pedido #{review.order}
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-foreground/80 mb-2">
          {review.comment}
        </p>
        
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mt-4">
            {review.images.map((image: string, index: number) => (
              <div key={index} className="w-20 h-20 rounded-md overflow-hidden">
                <img src={image} alt={`Imagem ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
        
        {review.reply && (
          <div className="mt-4 bg-muted/50 p-3 rounded-md">
            <div className="text-sm font-medium mb-1">Resposta do restaurante:</div>
            <p className="text-sm text-foreground/80">{review.reply}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Formulário de avaliação
const ReviewForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
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

// Página principal de avaliações
const Reviews = () => {
  const { id } = useParams<{ id?: string }>();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([
    {
      id: '1',
      user: 'João Silva',
      date: '15/05/2023',
      rating: 5,
      comment: 'Comida maravilhosa! O hambúrguer estava perfeitamente preparado e as batatas fritas estavam crocantes. O atendimento foi excelente e a entrega foi muito rápida.',
      order: '4125',
      images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop'],
      reply: 'Obrigado pela sua avaliação, João! Estamos muito felizes que tenha gostado da sua experiência conosco. Esperamos atendê-lo novamente em breve!'
    },
    {
      id: '2',
      user: 'Maria Souza',
      date: '10/05/2023',
      rating: 4,
      comment: 'Comida deliciosa, mas o entregador demorou um pouco mais do que o previsto. Mesmo assim, valeu a pena a espera!',
      order: '4102'
    },
    {
      id: '3',
      user: 'Pedro Santos',
      date: '02/05/2023',
      rating: 3,
      comment: 'O hambúrguer estava bom, mas chegou um pouco frio. As batatas estavam ótimas.',
      order: '4086'
    }
  ]);
  
  // Restaurante de exemplo (em um app real seria obtido por API)
  const restaurant = {
    id: '1',
    name: 'Urban Burger Bistro',
    avgRating: 4.2,
    totalReviews: 127
  };

  const handleAddReview = (reviewData: any) => {
    const newReview = {
      id: Math.random().toString(36).substring(7),
      user: 'Você',
      ...reviewData
    };
    
    setReviews([newReview, ...reviews]);
    
    toast({
      title: "Avaliação enviada",
      description: "Sua avaliação foi enviada com sucesso!"
    });
  };

  // Distribuição de avaliações para exibir as estatísticas
  const ratingDistribution = {
    5: 80,
    4: 25,
    3: 15,
    2: 5,
    1: 2
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">
        {id ? `Avaliações - ${restaurant.name}` : 'Suas Avaliações'}
      </h1>
      
      {id && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="text-4xl font-bold">{restaurant.avgRating}</span>
                    <StarRating rating={Math.round(restaurant.avgRating)} readOnly />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Baseado em {restaurant.totalReviews} avaliações
                  </p>
                </div>
              </div>
              
              <div>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center">
                      <div className="w-12 flex items-center">
                        <span className="text-sm">{star}</span>
                        <StarIcon className="w-4 h-4 text-amber-500 fill-amber-500 ml-1" />
                      </div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full" 
                          style={{ width: `${(ratingDistribution[star as keyof typeof ratingDistribution] / restaurant.totalReviews) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-right text-sm text-muted-foreground">
                        {ratingDistribution[star as keyof typeof ratingDistribution]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <ReviewForm onSubmit={handleAddReview} />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">
          {reviews.length} {reviews.length === 1 ? 'Avaliação' : 'Avaliações'}
        </h2>
        
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};

export default Reviews;
