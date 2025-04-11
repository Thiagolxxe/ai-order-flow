import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import SuspenseLoader from '@/components/ui/SuspenseLoader';
import { ThemeProvider } from '@/components/ui/theme-provider';
import '@/App.css';
import Index from '@/pages/Index';
import { UserProvider } from '@/context/UserContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GeminiChatAssistant from '@/components/gemini-chat/GeminiChatAssistant';
import { Helmet, HelmetProvider } from 'react-helmet-async';

// SEO Component
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

// Lazy loaded components
const VideoFeed = lazy(() => import('@/pages/VideoFeed'));
const RestaurantsExplore = lazy(() => import('@/pages/RestaurantsExplore'));
const RestaurantDetails = lazy(() => import('@/pages/RestaurantDetails'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Terms = lazy(() => import('@/pages/Terms'));
const Promotions = lazy(() => import('@/pages/Promotions'));
const OrderHistory = lazy(() => import('@/pages/OrderHistory'));
const UserProfile = lazy(() => import('@/pages/UserProfile'));
const RestaurantSignup = lazy(() => import('@/pages/RestaurantSignup'));
const Notifications = lazy(() => import('@/pages/Notifications'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ScrollToTop component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <UserProvider>
              <SEO />
              <ScrollToTop />
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow pt-16 sm:pt-20">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    
                    {/* Lazy loaded routes */}
                    <Route path="/videos" element={
                      <SuspenseLoader>
                        <VideoFeed />
                      </SuspenseLoader>
                    } />
                    
                    <Route path="/restaurants" element={
                      <SuspenseLoader>
                        <RestaurantsExplore />
                      </SuspenseLoader>
                    } />
                    
                    <Route path="/restaurants/:id" element={
                      <SuspenseLoader>
                        <RestaurantDetails />
                      </SuspenseLoader>
                    } />
                    
                    {/* Auth routes */}
                    <Route path="/login" element={
                      <SuspenseLoader>
                        <Login />
                      </SuspenseLoader>
                    } />
                    
                    <Route path="/register" element={
                      <SuspenseLoader>
                        <Register />
                      </SuspenseLoader>
                    } />
                    
                    {/* Added routes for menu items */}
                    <Route path="/promotions" element={
                      <SuspenseLoader>
                        <Promotions />
                      </SuspenseLoader>
                    } />
                    
                    <Route path="/orders" element={
                      <SuspenseLoader>
                        <OrderHistory />
                      </SuspenseLoader>
                    } />
                    
                    <Route path="/profile" element={
                      <SuspenseLoader>
                        <UserProfile />
                      </SuspenseLoader>
                    } />
                    
                    <Route path="/restaurant-signup" element={
                      <SuspenseLoader>
                        <RestaurantSignup />
                      </SuspenseLoader>
                    } />
                    
                    {/* Legal pages */}
                    <Route path="/terms" element={
                      <SuspenseLoader>
                        <Terms />
                      </SuspenseLoader>
                    } />
                    
                    {/* 404 route */}
                    <Route path="*" element={
                      <SuspenseLoader>
                        <NotFound />
                      </SuspenseLoader>
                    } />
                    
                    <Route path="/notifications" element={
                      <SuspenseLoader>
                        <Notifications />
                      </SuspenseLoader>
                    } />
                  </Routes>
                </main>
                <Footer />
              </div>
              <Toaster />
              <GeminiChatAssistant />
            </UserProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </Router>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
