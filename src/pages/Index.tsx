import React from 'react';
import { cn } from '@/lib/utils';
import HeroSection from '@/components/ui/HeroSection';
import RestaurantList from '@/components/restaurants/RestaurantList';
import OrderTracker from '@/components/orders/OrderTracker';
import { useUser } from '@/context/UserContext';
import { 
  AIIcon, 
  RestaurantIcon, 
  DeliveryIcon,
  BagIcon,
  ArrowRightIcon
} from '@/assets/icons';
import { Button } from '@/components/ui/button';

// Componente de cartão de recursos para a seção de recursos
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  index 
}: { 
  icon: React.ElementType, 
  title: string, 
  description: string,
  index: number
}) => (
  <div 
    className="relative bg-card rounded-xl p-6 shadow-subtle hover:shadow-elevation-2 transition-all duration-300 animate-fade-in"
    style={{ animationDelay: `${0.1 + (index * 0.1)}s` }}
  >
    <div className="absolute -top-4 -left-2 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <div className="pt-8">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-foreground/70 text-sm">{description}</p>
    </div>
  </div>
);

// Cartão de função do aplicativo para a seção "Para Todos"
const AppRoleCard = ({ 
  icon: Icon, 
  title, 
  description, 
  buttonText,
  buttonLink,
  imageSrc,
  index
}: { 
  icon: React.ElementType, 
  title: string, 
  description: string,
  buttonText: string,
  buttonLink: string,
  imageSrc: string,
  index: number
}) => (
  <div 
    className="group relative bg-card rounded-xl overflow-hidden shadow-elevation-1 hover:shadow-elevation-3 transition-all duration-300 animate-fade-in"
    style={{ animationDelay: `${0.1 + (index * 0.1)}s` }}
  >
    {/* Imagem de fundo com sobreposição de gradiente */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/60 to-card">
      <img 
        src={imageSrc} 
        alt={title} 
        className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-all duration-300" 
      />
    </div>
    
    <div className="relative px-6 py-6 flex flex-col h-full min-h-[320px]">
      <div className="mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-foreground/70 flex-grow">{description}</p>
      
      <Button asChild className="mt-6 w-full sm:w-auto" variant="outline">
        <a href={buttonLink}>
          {buttonText} <ArrowRightIcon className="ml-2 w-4 h-4" />
        </a>
      </Button>
    </div>
  </div>
);

const Index = () => {
  const { userRole } = useUser();
  
  // ID de pedido de exemplo para o rastreador de pedido de demonstração
  const sampleOrderId = '41293';
  
  return (
    <div className="flex flex-col">
      {/* Seção de hero */}
      <HeroSection />
      
      {/* Seção de restaurantes em destaque */}
      <section className="section-container">
        <RestaurantList
          title="Restaurantes em Destaque"
          subtitle="Descubra os melhores restaurantes na sua região"
          maxItems={3}
          showFilters={false}
        />
        <div className="mt-8 text-center">
          <Button asChild variant="outline" size="lg">
            <a href="/restaurants">
              Ver Todos os Restaurantes <ArrowRightIcon className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>
      
      {/* Seção de como funciona com integração de IA */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Entrega Mais Inteligente com IA</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Nossa tecnologia de IA otimiza cada aspecto do processo de entrega para uma experiência
              mais rápida e confiável.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard 
              icon={AIIcon}
              title="Recomendações com IA"
              description="Receba recomendações personalizadas de restaurantes e pratos com base em suas preferências e pedidos anteriores."
              index={0}
            />
            <FeatureCard 
              icon={RestaurantIcon}
              title="Gestão Inteligente de Restaurantes"
              description="Restaurantes gerenciam pedidos com eficiência usando ferramentas de IA para otimização de estoque e pessoal."
              index={1}
            />
            <FeatureCard 
              icon={DeliveryIcon}
              title="Rotas de Entrega Otimizadas"
              description="Nossa IA calcula as rotas mais rápidas em tempo real, considerando tráfego e condições climáticas."
              index={2}
            />
          </div>
        </div>
      </section>
      
      {/* Demonstração de rastreamento de pedido ao vivo */}
      <section className="section-container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Rastreamento de Pedido em Tempo Real</h2>
            <p className="text-foreground/70">
              Acompanhe seu pedido do restaurante até sua porta com atualizações detalhadas em tempo real.
            </p>
          </div>
          
          <div className="animate-fade-in">
            <OrderTracker orderId={sampleOrderId} />
          </div>
        </div>
      </section>
      
      {/* Seção para todos */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Uma Plataforma para Todos</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              O DeliverAI oferece experiências personalizadas para clientes, restaurantes e entregadores parceiros.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <AppRoleCard 
              icon={BagIcon}
              title="Para Clientes"
              description="Peça de seus restaurantes favoritos com facilidade. Aproveite recomendações personalizadas, rastreamento em tempo real e serviço excepcional."
              buttonText="Pedir Agora"
              buttonLink="/restaurants"
              imageSrc="https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=1600&auto=format&fit=crop"
              index={0}
            />
            <AppRoleCard 
              icon={RestaurantIcon}
              title="Para Restaurantes"
              description="Expanda seu negócio com nossas ferramentas de gestão abrangentes. Simplifique operações, analise tendências e alcance mais clientes."
              buttonText="Seja Parceiro"
              buttonLink="/restaurant/signup"
              imageSrc="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1600&auto=format&fit=crop"
              index={1}
            />
            <AppRoleCard 
              icon={DeliveryIcon}
              title="Para Entregadores"
              description="Junte-se à nossa rede de entregadores parceiros. Aproveite horários flexíveis, otimize suas rotas com IA e maximize seus ganhos."
              buttonText="Comece a Entregar"
              buttonLink="/delivery/signup"
              imageSrc="https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=1600&auto=format&fit=crop"
              index={2}
            />
          </div>
        </div>
      </section>
      
      {/* Seção CTA */}
      <section className="section-container bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground shadow-elevation-3">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para experimentar o futuro da entrega de comida?</h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de clientes satisfeitos que fizeram do DeliverAI sua plataforma preferida de entrega de comida.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <a href="/restaurants">Explorar Restaurantes</a>
              </Button>
              <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90">
                <a href="/cadastro">Cadastre-se Agora</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
