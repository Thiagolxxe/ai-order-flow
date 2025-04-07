
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRestaurantDetails } from '@/hooks/useRestaurantDetails';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const RestaurantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { restaurant, isLoading, error } = useRestaurantDetails(id || '');

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <h1 className="text-xl font-semibold text-red-600 mb-2">Erro</h1>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-xl font-semibold mb-2">Restaurante não encontrado</h1>
            <p>O restaurante solicitado não está disponível ou não existe.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-4">{restaurant.nome}</h1>
          <p className="text-muted-foreground mb-6">{restaurant.descricao}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Informações</h2>
              <ul className="space-y-2">
                <li><span className="font-medium">Tipo de cozinha:</span> {restaurant.tipo_cozinha}</li>
                <li><span className="font-medium">Endereço:</span> {restaurant.endereco}</li>
                <li><span className="font-medium">Cidade/Estado:</span> {restaurant.cidade}/{restaurant.estado}</li>
                <li><span className="font-medium">Avaliação:</span> {restaurant.avaliacao || 0}/5</li>
              </ul>
            </div>
            
            <div>
              {restaurant.imagem_url && (
                <img 
                  src={restaurant.imagem_url} 
                  alt={restaurant.nome} 
                  className="rounded-md w-full h-64 object-cover"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantDetails;
