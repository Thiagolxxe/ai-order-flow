
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Link } from 'react-router-dom';

// Default fallback image from Unsplash
const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000';

export interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageSrc: string;
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
}

export const HeroSection = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  imageSrc,
  className,
  imageClassName,
  contentClassName
}: HeroSectionProps) => {
  // Check if image URL is valid and use fallback if not
  const [imageUrl, setImageUrl] = useState(
    imageSrc && (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) 
      ? imageSrc 
      : DEFAULT_HERO_IMAGE
  );

  const handleImageError = () => {
    console.log('Hero image failed to load:', imageUrl);
    setImageUrl(DEFAULT_HERO_IMAGE);
  };

  return (
    <div className={cn(
      'relative overflow-hidden bg-background py-10 md:py-16',
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className={cn(
            'flex flex-col space-y-6 text-center md:text-left',
            contentClassName
          )}>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
            <p className="text-xl text-muted-foreground">{subtitle}</p>
            
            <div className="flex justify-center md:justify-start">
              <Button size="lg" asChild>
                <Link to={ctaLink}>{ctaText}</Link>
              </Button>
            </div>
          </div>
          
          <div className="order-first md:order-last">
            <div className={cn(
              'aspect-video rounded-xl overflow-hidden shadow-lg',
              imageClassName
            )}>
              <img 
                src={imageUrl} 
                alt="Hero" 
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
