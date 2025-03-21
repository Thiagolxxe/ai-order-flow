import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

// Update the import to use the correct component
import HeroSection from "@/components/ui/HeroSection";

const Index = () => {
  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        title="Descubra os melhores restaurantes perto de você"
        subtitle="Entrega rápida e segura, com opções para todos os gostos"
        ctaText="Explorar Restaurantes"
        ctaLink="/restaurantes"
        imageSrc="/placeholder.svg"
      />

      {/* Featured Restaurants Section (Example) */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Restaurantes em Destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Restaurant Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src="/placeholder.svg" alt="Restaurant" className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Nome do Restaurante</h3>
                <p className="text-gray-600">Tipo de Cozinha</p>
                <Link to="/restaurantes" className="inline-block mt-4 text-primary hover:underline">
                  Ver Menu
                </Link>
              </div>
            </div>
            {/* End Example Restaurant Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src="/placeholder.svg" alt="Restaurant" className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Nome do Restaurante</h3>
                <p className="text-gray-600">Tipo de Cozinha</p>
                <Link to="/restaurantes" className="inline-block mt-4 text-primary hover:underline">
                  Ver Menu
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src="/placeholder.svg" alt="Restaurant" className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Nome do Restaurante</h3>
                <p className="text-gray-600">Tipo de Cozinha</p>
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
