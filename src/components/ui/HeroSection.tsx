
import React from 'react';
import { cn } from '@/lib/utils';
import { SearchIcon, ArrowRightIcon } from '@/assets/icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  className?: string;
}

const HeroSection = ({ className }: HeroSectionProps) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Background with blur overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background -z-10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
      </div>
      
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border bg-background/50 backdrop-blur-sm px-3 py-1 text-sm font-medium mb-6 animate-fade-in">
            <span className="bg-primary/20 text-primary rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">
              <AIIcon />
            </span>
            Powered by AI for smarter deliveries
          </div>
          
          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Intelligent Food Delivery <br className="hidden md:inline" />
            for the Modern World
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-foreground/80 mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            DeliverAI connects you with your favorite restaurants <br className="hidden md:inline" />
            through AI-optimized delivery and exceptional service.
          </p>
          
          {/* Search box */}
          <div className="flex flex-col sm:flex-row items-center max-w-xl mx-auto gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40 w-5 h-5" />
              <Input 
                type="text"
                placeholder="Enter your address"
                className="pl-10 h-12 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm shadow-sm"
              />
            </div>
            <Button size="lg" className="w-full sm:w-auto">
              Find Restaurants <ArrowRightIcon className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div>
              <p className="text-3xl font-bold">300+</p>
              <p className="text-sm text-foreground/60">Restaurants</p>
            </div>
            <div>
              <p className="text-3xl font-bold">15K+</p>
              <p className="text-sm text-foreground/60">Deliveries</p>
            </div>
            <div>
              <p className="text-3xl font-bold">98%</p>
              <p className="text-sm text-foreground/60">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Small AI icon for the badge
const AIIcon = () => (
  <svg 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="5" height="5" rx="1" />
    <rect x="16" y="3" width="5" height="5" rx="1" />
    <rect x="3" y="16" width="5" height="5" rx="1" />
    <rect x="16" y="16" width="5" height="5" rx="1" />
    <path d="M8 9v2h8V9" />
    <path d="M16 15h-3v6l-5-6h-1" />
    <path d="M8.3 10A5 5 0 0 1 11 6" />
  </svg>
);

export default HeroSection;
