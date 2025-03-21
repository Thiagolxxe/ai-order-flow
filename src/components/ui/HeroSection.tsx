
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Link } from 'react-router-dom';

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
                src={imageSrc} 
                alt="Hero" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
