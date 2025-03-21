import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HeroSection from "@/components/ui/HeroSection";
import RestaurantList from "@/components/restaurants/RestaurantList";
import { HeartIcon, StarIcon, ClockIcon } from "@/assets/icons";
import SuperUserCreator from '@/components/admin/SuperUserCreator';
import { useUser } from '@/context/UserContext';

const Index = () => {
  const { isAuthenticated } = useUser();
  
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection 
        title="Descubra os melhores sabores da sua cidade"
        subtitle="Entrega rápida dos seus restaurantes favoritos direto na sua porta"
        ctaText="Explorar Restaurantes"
        ctaLink="/restaurantes"
        imageSrc="/placeholder.svg"
      />
      
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <HeartIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Escolha seu favorito</h3>
                <p className="text-muted-foreground">
                  Navegue por uma ampla seleção de restaurantes e escolha seu favorito.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <StarIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Faça seu pedido</h3>
                <p className="text-muted-foreground">
                  Escolha os pratos que você mais gosta e personalize seu pedido.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <ClockIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Entrega rápida</h3>
                <p className="text-muted-foreground">
                  Acompanhe seu pedido em tempo real e receba na porta da sua casa.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="py-12">
        <div className="container px-4 mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Restaurantes Populares</h2>
            <Button variant="outline" asChild>
              <Link to="/restaurantes">Ver todos</Link>
            </Button>
          </div>
          
          <RestaurantList />
        </div>
      </section>
      
      {!isAuthenticated && (
        <section className="py-12 bg-primary/5">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Junte-se a milhares de clientes satisfeitos</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Crie sua conta agora para salvar seus endereços favoritos e acompanhar seus pedidos.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/cadastro">Criar conta</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">Fazer login</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Criador de Super Usuário */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 mx-auto max-w-md">
          <SuperUserCreator />
        </div>
      </section>
    </div>
  );
};

export default Index;
