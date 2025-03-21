
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { HeroSection } from '@/components/ui/HeroSection';
import RestaurantList from '@/components/restaurants/RestaurantList';
import SuperUserCreator from '@/components/admin/SuperUserCreator';

const Index = () => {
  return (
    <div>
      <HeroSection 
        title="Delicie-se com suas comidas favoritas"
        subtitle="Descubra os melhores restaurantes da sua região e peça com apenas alguns cliques"
        ctaText="Explorar Restaurantes"
        ctaLink="/restaurantes"
        imageSrc="https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=1664&auto=format&fit=crop"
      />
      
      <div className="container py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-4">Por que escolher o DeliverAI?</h2>
          <p className="text-lg text-center text-muted-foreground max-w-3xl mx-auto">
            Nosso sistema inteligente de delivery traz uma experiência única para você e os restaurantes parceiros
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Entrega Rápida</h3>
              <p className="text-muted-foreground">
                Entregas otimizadas com IA para garantir que sua comida chegue quentinha e no menor tempo possível.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Pedidos Personalizados</h3>
              <p className="text-muted-foreground">
                Personalize seus pedidos com facilidade e adicione observações especiais para cada item do seu pedido.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Suporte Inteligente</h3>
              <p className="text-muted-foreground">
                Assistente virtual disponível 24/7 para resolver suas dúvidas e garantir a melhor experiência.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="bg-muted py-16">
        <div className="container">
          <RestaurantList 
            title="Restaurantes em Destaque"
            subtitle="Os melhores lugares para pedir hoje"
            maxItems={6}
            showFilters={false}
          />
          
          <div className="mt-8 text-center">
            <Button asChild size="lg">
              <Link to="/restaurantes">Ver Todos os Restaurantes</Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-4">Criar Super Usuário</h2>
          <p className="text-lg text-center text-muted-foreground max-w-3xl mx-auto">
            Crie um super usuário para testar todas as funcionalidades do sistema
          </p>
        </div>
        
        <SuperUserCreator />
      </div>
    </div>
  );
};

export default Index;
