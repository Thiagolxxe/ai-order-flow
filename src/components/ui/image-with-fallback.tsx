
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc: string;
  onLoadingComplete?: () => void;
}

/**
 * Um componente de imagem com suporte a fallback automático em caso de erro
 */
const ImageWithFallback = ({
  src,
  fallbackSrc,
  alt,
  className,
  onLoadingComplete,
  ...props
}: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState<string>(src || '');
  const [hasError, setHasError] = useState<boolean>(false);

  // Verifica se a URL é válida (começa com http ou https)
  const isValidUrl = (url: string): boolean => {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  // Inicializa a fonte da imagem
  React.useEffect(() => {
    if (!isValidUrl(src || '')) {
      console.warn(`URL de imagem inválida: ${src}`);
      setImgSrc(fallbackSrc);
      setHasError(true);
      return;
    }

    setImgSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  // Manipula erros de carregamento da imagem
  const handleError = () => {
    console.log(`Erro ao carregar imagem: ${imgSrc}`);
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  const handleLoad = () => {
    onLoadingComplete?.();
  };

  return (
    <img
      src={isValidUrl(imgSrc) ? imgSrc : fallbackSrc}
      alt={alt || 'Imagem'}
      className={cn(hasError && 'opacity-90', className)}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default ImageWithFallback;
