import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
      <div className="container px-4 py-16 md:py-24 lg:py-32 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Entregas rápidas e saborosas com <span className="text-primary">Inteligência Artificial</span>
            </h1>
            <p className="text-lg sm:text-xl text-foreground/80">
              Peça sua comida favorita de restaurantes locais com a conveniência da IA.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link to="/restaurantes">Descobrir Restaurantes</Link>
              </Button>
              
              {/* Restaurante button */}
              <div className="mt-4">
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-white">
                  <Link to="/restaurante/cadastro" className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    <span>Cadastre seu Restaurante</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img
              src="/images/hero-food.webp"
              alt="Comida deliciosa"
              className="w-full rounded-lg shadow-xl object-cover aspect-video"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
