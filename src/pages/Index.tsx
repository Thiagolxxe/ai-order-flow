
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/ui/HeroSection";
import { PlayCircle } from 'lucide-react';

// Default restaurant image from Unsplash
const DEFAULT_RESTAURANT_IMAGE = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000';

const Index = () => {
  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        title="Descubra os melhores restaurantes perto de você"
        subtitle="Entrega rápida e segura, com opções para todos os gostos"
        ctaText="Explorar Restaurantes"
        ctaLink="/restaurantes"
        imageSrc="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200"
      />
      
      {/* Video Feed Promo Section */}
      <section className="py-10 bg-gradient-to-r from-primary/10 to-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h2 className="text-3xl font-bold mb-4">Experimente o Novo Feed de Vídeos</h2>
              <p className="text-lg mb-6">
                Descubra pratos deliciosos em um formato TikTok. 
                Veja vídeos curtos, faça pedidos via chat e tenha uma experiência completamente nova!
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link to="/videos">
                  <PlayCircle size={20} />
                  Explorar Vídeos
                </Link>
              </Button>
            </div>
            <div className="relative w-full md:w-1/2 aspect-[9/16] max-w-xs rounded-xl overflow-hidden shadow-xl">
              <video 
                src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-person-eating-pizza-with-a-fork-and-43122-large.mp4"
                autoPlay 
                muted 
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 flex flex-col justify-end p-4">
                <h3 className="text-white text-xl font-bold">Pizza Margherita</h3>
                <p className="text-white/90 text-sm">Pizzaria Bella Napoli</p>
                <p className="text-white font-bold mt-2">R$ 49,90</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section (Example) */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Restaurantes em Destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Restaurant Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500" alt="Restaurant" className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Pizzaria Bella Napoli</h3>
                <p className="text-gray-600">Italiana</p>
                <Link to="/restaurante/00000000-0000-0000-0000-000000000r01/menu" className="inline-block mt-4 text-primary hover:underline">
                  Ver Menu
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500" alt="Restaurant" className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Sabor Oriental</h3>
                <p className="text-gray-600">Japonesa</p>
                <Link to="/restaurante/00000000-0000-0000-0000-000000000r02/menu" className="inline-block mt-4 text-primary hover:underline">
                  Ver Menu
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src="https://images.unsplash.com/photo-1456418047667-56bcd35b1a88?w=500" alt="Restaurant" className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Sabores Caseiros</h3>
                <p className="text-gray-600">Brasileira</p>
                <Link to="/restaurantes" className="inline-block mt-4 text-primary hover:underline">
                  Ver Menu
                </Link>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Button asChild>
              <Link to="/restaurantes">Explorar Mais Restaurantes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action Section (Example) */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para pedir?
          </h2>
          <p className="text-lg mb-8">
            Encontre seus pratos favoritos e aproveite a entrega rápida e fácil.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/restaurantes">
              Começar a Explorar
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
