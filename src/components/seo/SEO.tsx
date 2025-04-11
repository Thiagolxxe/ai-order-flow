
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SEO = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Default meta tags
  let title = "DelivGo - Sua plataforma de delivery";
  let description = "Encontre os melhores restaurantes da sua região e peça comida com facilidade através da DelivGo.";
  
  // Change meta tags based on route
  if (path.startsWith('/restaurants')) {
    title = "Restaurantes - DelivGo";
    description = "Explore os melhores restaurantes parceiros da DelivGo. Filtros, avaliações e menus completos para você escolher.";
  } else if (path === '/videos') {
    title = "Vídeos - DelivGo";
    description = "Assista vídeos de receitas, restaurantes parceiros e dicas de culinária na DelivGo.";
  } else if (path.includes('/profile')) {
    title = "Meu Perfil - DelivGo";
    description = "Gerencie suas informações pessoais, endereços e preferências de entrega na DelivGo.";
  }
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://delivgo.example.com${path}`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="/og-image.png" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={`https://delivgo.example.com${path}`} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content="/og-image.png" />
      
      {/* Structured data for restaurant listings */}
      {path.startsWith('/restaurants') && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Restaurantes em destaque na DelivGo",
                "url": "https://delivgo.example.com/restaurants"
              }
            ]
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
