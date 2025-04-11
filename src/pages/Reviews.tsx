
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewsList from '@/components/reviews/ReviewsList';
import RatingDistribution from '@/components/reviews/RatingDistribution';
import { Review, Restaurant, RatingDistribution as RatingDistributionType } from '@/components/reviews/types';

const Reviews = () => {
  const { id } = useParams<{ id?: string }>();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([
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
  const restaurant: Restaurant = {
    id: '1',
    name: 'Urban Burger Bistro',
    avgRating: 4.2,
    totalReviews: 127
  };

  // Distribuição de avaliações para exibir as estatísticas
  const ratingDistribution: RatingDistributionType = {
    5: 80,
    4: 25,
    3: 15,
    2: 5,
    1: 2
  };

  const handleAddReview = (reviewData: { rating: number; comment: string; date: string }) => {
    const newReview: Review = {
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

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">
        {id ? `Avaliações - ${restaurant.name}` : 'Suas Avaliações'}
      </h1>
      
      {id && (
        <RatingDistribution 
          avgRating={restaurant.avgRating} 
          totalReviews={restaurant.totalReviews} 
          distribution={ratingDistribution} 
        />
      )}
      
      <ReviewForm onSubmit={handleAddReview} />
      
      <ReviewsList reviews={reviews} />
    </div>
  );
};

export default Reviews;
