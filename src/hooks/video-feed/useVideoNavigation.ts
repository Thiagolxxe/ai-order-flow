
import { useCallback } from 'react';
import { RefObject } from 'react';

export const useVideoNavigation = (
  activeVideoIndex: number, 
  setActiveVideoIndex: (index: number) => void,
  videosLength: number,
  feedContainerRef: RefObject<HTMLDivElement>
) => {
  const handleScroll = useCallback(() => {
    if (!feedContainerRef.current) return;
    
    const container = feedContainerRef.current;
    const scrollPosition = container.scrollTop;
    const videoHeight = container.clientHeight;
    const videoIndex = Math.round(scrollPosition / videoHeight);
    
    if (videoIndex !== activeVideoIndex && videoIndex < videosLength) {
      setActiveVideoIndex(videoIndex);
    }
  }, [activeVideoIndex, feedContainerRef, videosLength, setActiveVideoIndex]);

  const handleNext = useCallback(() => {
    if (activeVideoIndex < videosLength - 1) {
      const nextIndex = activeVideoIndex + 1;
      setActiveVideoIndex(nextIndex);
      if (feedContainerRef.current) {
        feedContainerRef.current.scrollTo({
          top: feedContainerRef.current.clientHeight * nextIndex,
          behavior: 'smooth'
        });
      }
    }
  }, [activeVideoIndex, feedContainerRef, videosLength, setActiveVideoIndex]);

  const handlePrevious = useCallback(() => {
    if (activeVideoIndex > 0) {
      const prevIndex = activeVideoIndex - 1;
      setActiveVideoIndex(prevIndex);
      if (feedContainerRef.current) {
        feedContainerRef.current.scrollTo({
          top: feedContainerRef.current.clientHeight * prevIndex,
          behavior: 'smooth'
        });
      }
    }
  }, [activeVideoIndex, feedContainerRef, setActiveVideoIndex]);

  return {
    handleScroll,
    handleNext,
    handlePrevious
  };
};
