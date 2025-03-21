
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

// Feature card component for the features section
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

// App role card for the "For Everyone" section
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
    {/* Background image with gradient overlay */}
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
  
  // Sample order ID for the demo order tracker
  const sampleOrderId = '41293';
  
  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <HeroSection />
      
      {/* Featured restaurants section */}
      <section className="section-container">
        <RestaurantList
          title="Featured Restaurants"
          subtitle="Discover top restaurants in your area"
          maxItems={3}
          showFilters={false}
        />
        <div className="mt-8 text-center">
          <Button asChild variant="outline" size="lg">
            <a href="/restaurants">
              View All Restaurants <ArrowRightIcon className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>
      
      {/* How it works section with AI integration */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Smarter Delivery with AI</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Our AI technology optimizes every aspect of the delivery process for a faster, 
              more reliable experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard 
              icon={AIIcon}
              title="AI-Powered Recommendations"
              description="Get personalized restaurant and dish recommendations based on your preferences and past orders."
              index={0}
            />
            <FeatureCard 
              icon={RestaurantIcon}
              title="Smart Restaurant Management"
              description="Restaurants manage orders efficiently with AI tools for inventory and staff optimization."
              index={1}
            />
            <FeatureCard 
              icon={DeliveryIcon}
              title="Optimized Delivery Routes"
              description="Our AI calculates the fastest routes in real-time, considering traffic and weather conditions."
              index={2}
            />
          </div>
        </div>
      </section>
      
      {/* Live order tracking demo */}
      <section className="section-container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Real-Time Order Tracking</h2>
            <p className="text-foreground/70">
              Follow your order from the restaurant to your doorstep with detailed live updates.
            </p>
          </div>
          
          <div className="animate-fade-in">
            <OrderTracker orderId={sampleOrderId} />
          </div>
        </div>
      </section>
      
      {/* For everyone section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">One Platform for Everyone</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              DeliverAI provides tailored experiences for customers, restaurants, and delivery partners.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <AppRoleCard 
              icon={BagIcon}
              title="For Customers"
              description="Order from your favorite restaurants with ease. Enjoy personalized recommendations, real-time tracking, and exceptional service."
              buttonText="Order Now"
              buttonLink="/restaurants"
              imageSrc="https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=1600&auto=format&fit=crop"
              index={0}
            />
            <AppRoleCard 
              icon={RestaurantIcon}
              title="For Restaurants"
              description="Grow your business with our comprehensive management tools. Streamline operations, analyze trends, and reach more customers."
              buttonText="Partner with Us"
              buttonLink="/restaurant/signup"
              imageSrc="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1600&auto=format&fit=crop"
              index={1}
            />
            <AppRoleCard 
              icon={DeliveryIcon}
              title="For Delivery Partners"
              description="Join our network of delivery partners. Enjoy flexible schedules, optimize your routes with AI, and maximize your earnings."
              buttonText="Start Delivering"
              buttonLink="/delivery/signup"
              imageSrc="https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=1600&auto=format&fit=crop"
              index={2}
            />
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="section-container bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground shadow-elevation-3">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to experience the future of food delivery?</h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join thousands of happy customers who have made DeliverAI their go-to food delivery platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <a href="/restaurants">Explore Restaurants</a>
              </Button>
              <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90">
                <a href="/signup">Sign Up Now</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
