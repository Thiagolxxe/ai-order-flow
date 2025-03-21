
import { useState, useEffect } from 'react';

// Hook for detecting when an element is in viewport for animations
export const useInView = (options = {}) => {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);
    
    observer.observe(ref);
    
    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [ref, options]);

  return [setRef, isInView] as const;
};

// Staggered animation for lists
export const staggeredAnimation = (index: number, delay = 0.1) => {
  return {
    animationDelay: `${index * delay}s`
  };
};

// Animation variants for motion components (if using framer-motion)
export const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const scaleIn = {
  hidden: { 
    opacity: 0, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// Utility to add CSS animation classes with cleanup
export const useCssAnimation = (animationClass: string, trigger: boolean) => {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    if (!ref) return;
    
    if (trigger) {
      ref.classList.add(animationClass);
    } else {
      ref.classList.remove(animationClass);
    }
    
    return () => {
      if (ref) {
        ref.classList.remove(animationClass);
      }
    };
  }, [ref, animationClass, trigger]);
  
  return setRef;
};
