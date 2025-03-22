
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StarIcon, ClockIcon, SearchIcon, MapPinIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Restaurant {
  id: string;
  nome: string;
  logo_url: string;
  banner_url: string;
  tipo_cozinha: string;
  descricao: string;
  taxa_entrega: number;
  valor_pedido_minimo: number;
  tempo_entrega_estimado: number;
  faixa_preco: number;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
}

interface Review {
  id: string;
  cliente_id: string;
  restaurante_id: string;
  nota: number;
  comentario?: string;
  criado_em: string;
  cliente_nome?: string;
}

const RestaurantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const isMobile = useIsMobile();
  
  // Buscar detalhes do restaurante
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Ensure we're querying with a valid UUID format - this is the critical fix
        // Check if the ID might not be a valid UUID
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
          console.error('Invalid UUID format for restaurant ID:', id);
          toast.error('ID de restaurante inválido');
          setLoading(false);
          return;
        }
        
        // Buscar detalhes do restaurante
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurantes')
          .select('*')
          .eq('id', id)
          .single();
        
        if (restaurantError) throw restaurantError;
        
        // Buscar avaliações
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('avaliacoes')
          .select(`
            *,
            perfis:cliente_id (nome)
          `)
          .eq('restaurante_id', id)
          .order('criado_em', { ascending: false })
          .limit(10);
        
        if (reviewsError) throw reviewsError;
        
        // Formatar dados de avaliações
        const formattedReviews = reviewsData.map((review: any) => ({
          ...review,
          cliente_nome: review.perfis?.nome || 'Cliente Anônimo'
        }));
        
        // Calcular média de avaliações
        const totalRating = formattedReviews.reduce((sum: number, review: Review) => sum + review.nota, 0);
        const avgRating = formattedReviews.length > 0 ? totalRating / formattedReviews.length : 0;
        
        setRestaurant(restaurantData);
        setReviews(formattedReviews);
        setAverageRating(avgRating);
        setReviewCount(formattedReviews.length);
      } catch (error) {
        console.error('Erro ao buscar detalhes do restaurante:', error);
        toast.error('Não foi possível carregar os detalhes do restaurante');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantDetails();
  }, [id]);
  
  if (loading) {
    return (
      <div className="container px-4 py-8">
        <div className="h-64 bg-muted animate-pulse rounded-lg mb-4"></div>
        <div className="h-8 bg-muted animate-pulse rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-muted animate-pulse rounded mb-4 w-1/2"></div>
        <div className="h-32 bg-muted animate-pulse rounded mb-4"></div>
      </div>
    );
  }
  
  if (!restaurant) {
    return (
      <div className="container px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Restaurante não encontrado</h2>
        <p className="mb-6">O restaurante que você está procurando não existe ou foi removido.</p>
        <Button asChild>
          <Link to="/">Voltar para a página inicial</Link>
        </Button>
      </div>
    );
  }

  // Formatar o preço com número de "$"
  const priceRange = Array(restaurant.faixa_preco).fill('$').join('');
  
  // Fotos do restaurante (exemplo, seria necessário uma tabela de fotos no banco de dados)
  const photos = [
    restaurant.banner_url || 'https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop'
  ];

  return (
    <div className="pb-20">
      {/* Imagem de capa do restaurante */}
      <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden bg-muted">
        <img 
          src={restaurant.banner_url || 'https://images.unsplash.com/photo-1561758033-7e924f619b47?q=80&w=1920&auto=format&fit=crop'}
          alt={`${restaurant.nome} - Capa`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Logo do restaurante */}
        <div className="absolute bottom-4 left-4 flex items-end">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-white shadow-md bg-white">
            <img 
              src={restaurant.logo_url || 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=128&auto=format&fit=crop'}
              alt={`${restaurant.nome} - Logo`}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="ml-3 text-white">
            <h1 className="text-xl sm:text-2xl font-semibold">{restaurant.nome}</h1>
            <p className="text-sm text-white/90">{restaurant.tipo_cozinha}</p>
          </div>
        </div>
      </div>
      
      {/* Informações e estatísticas */}
      <div className="container px-4 py-4">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          {/* Avaliação e estatísticas */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-full">
              <StarIcon className="w-4 h-4 mr-1" />
              <span className="font-medium">{averageRating.toFixed(1)}</span>
              <span className="text-foreground/60 text-sm ml-1">({reviewCount})</span>
            </div>
            
            <div className="flex items-center text-sm text-foreground/70">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>{restaurant.tempo_entrega_estimado-10}-{restaurant.tempo_entrega_estimado} min</span>
            </div>
            
            <div className="flex items-center text-sm text-foreground/70">
              <MapPinIcon className="w-4 h-4 mr-1" />
              <span>1,2 km</span>
            </div>
          </div>
          
          {/* Botão de pedido */}
          <Button asChild>
            <Link to={`/restaurante/${id}/menu`}>
              Ver Cardápio
            </Link>
          </Button>
        </div>
        
        {/* Tags e informações adicionais */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{priceRange}</Badge>
          <Badge variant="secondary">Taxa: R${restaurant.taxa_entrega.toFixed(2).replace('.', ',')}</Badge>
          <Badge variant="secondary">Pedido mínimo: R${restaurant.valor_pedido_minimo.toFixed(2).replace('.', ',')}</Badge>
          <Badge variant="outline" className="text-emerald-500 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
            Aberto agora
          </Badge>
        </div>
        
        {/* Descrição */}
        <p className="text-foreground/80 mb-6">{restaurant.descricao}</p>
        
        {/* Abas: Sobre, Fotos, Avaliações */}
        <Tabs defaultValue="about">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="about" className="flex-1">Sobre</TabsTrigger>
            <TabsTrigger value="photos" className="flex-1">Fotos</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">Avaliações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Endereço</h3>
                    <p className="text-foreground/70">{restaurant.endereco}, {restaurant.cidade} - {restaurant.estado}, {restaurant.cep}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Horário de Funcionamento</h3>
                    <div className="space-y-1 text-foreground/70">
                      <p>Segunda a Sexta: 11:00 - 23:00</p>
                      <p>Sábado e Domingo: 11:00 - 00:00</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Métodos de Pagamento</h3>
                    <div className="space-y-1 text-foreground/70">
                      <p>Cartão de Crédito</p>
                      <p>Cartão de Débito</p>
                      <p>Vale-Refeição</p>
                      <p>Pix</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="photos" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={photo} 
                    alt={`${restaurant.nome} - Foto ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Avaliações dos Clientes</h3>
                    <div className="flex items-center">
                      <StarIcon className="w-5 h-5 text-amber-500 mr-1" />
                      <span className="font-semibold">{averageRating.toFixed(1)}</span>
                      <span className="text-foreground/60 text-sm ml-1">({reviewCount})</span>
                    </div>
                  </div>
                  
                  {/* Exemplos de avaliações */}
                  <div className="space-y-6">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="border-b border-border pb-4 last:border-none">
                          <div className="flex justify-between mb-2">
                            <div className="font-medium">{review.cliente_nome}</div>
                            <div className="flex items-center">
                              <StarIcon className="w-4 h-4 text-amber-500 mr-1" />
                              <span>{review.nota}</span>
                            </div>
                          </div>
                          <p className="text-foreground/70 text-sm">
                            {review.comentario || 'O cliente não deixou um comentário.'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-foreground/70">Este restaurante ainda não possui avaliações.</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RestaurantDetails;
