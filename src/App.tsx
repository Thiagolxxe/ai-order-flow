
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { UserProvider } from '@/context/UserContext';
import { useEffect } from 'react';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { initializeDatabase } from '@/services/mongodb/initDatabase';
import { toast } from 'sonner';

// Layout Components
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MongoDBConnectionStatus from '@/components/mongodb/ConnectionStatus';
import MongoDBConnectionChecker from '@/components/mongodb/ConnectionChecker';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Notifications from '@/pages/Notifications';
import Favorites from '@/pages/Favorites';
import Cart from '@/pages/Cart';
import RestaurantsExplore from '@/pages/RestaurantsExplore';
import RestaurantDetails from '@/pages/RestaurantDetails';
import Menu from '@/pages/Menu';
import Checkout from '@/pages/Checkout';
import OrderDetails from '@/pages/OrderDetails';
import OrderHistory from '@/pages/OrderHistory';
import UserProfile from '@/pages/UserProfile';
import Reviews from '@/pages/Reviews';
import Chat from '@/pages/Chat';
import Promotions from '@/pages/Promotions';
import LiveTrackingMap from '@/pages/LiveTrackingMap';
import RestaurantSignup from '@/pages/RestaurantSignup';
import RestaurantAdmin from '@/pages/admin/RestaurantAdmin';
import NotFound from '@/pages/NotFound';
import VideoFeed from '@/pages/VideoFeed';
import DeliveryRegistration from '@/pages/delivery/DeliveryRegistration';
import DeliveryDashboard from '@/pages/delivery/DeliveryDashboard';
import DeliveryProfile from '@/pages/delivery/DeliveryProfile';

import './App.css';

// Helper component for redirects with params
const RedirectWithParams = ({ path }: { path: string }) => {
  const params = useParams();
  const targetPath = path.replace(':id', params.id || '');
  return <Navigate to={targetPath} replace />;
};

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // Initialize MongoDB connection
  useEffect(() => {
    const initMongoDB = async () => {
      try {
        // Connect to MongoDB
        await connectToDatabase();
        
        // Initialize database
        await initializeDatabase();
        
        console.log('MongoDB initialization complete');
      } catch (error) {
        console.error('Failed to initialize MongoDB:', error);
        toast.error('Falha ao conectar ao banco de dados');
      }
    };
    
    initMongoDB();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <UserProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  {/* Main Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/restaurants" element={<RestaurantsExplore />} />
                  <Route path="/restaurant/:id" element={<RestaurantDetails />} />
                  <Route path="/menu/:id" element={<Menu />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order/:id" element={<OrderDetails />} />
                  <Route path="/orders" element={<OrderHistory />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/chat/:id" element={<Chat />} />
                  <Route path="/promotions" element={<Promotions />} />
                  <Route path="/tracking/:id" element={<LiveTrackingMap />} />
                  <Route path="/restaurant-signup" element={<RestaurantSignup />} />
                  <Route path="/admin/restaurant" element={<RestaurantAdmin />} />
                  <Route path="/video-feed" element={<VideoFeed />} />
                  <Route path="/delivery/signup" element={<DeliveryRegistration />} />
                  <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
                  <Route path="/delivery/profile" element={<DeliveryProfile />} />
                  
                  {/* Portuguese Route Redirects */}
                  <Route path="/restaurantes" element={<Navigate to="/restaurants" replace />} />
                  <Route path="/restaurante/:id" element={<Navigate to={(params) => `/restaurant/${params.id}`} replace />} />
                  <Route path="/videos" element={<Navigate to="/video-feed" replace />} />
                  <Route path="/promocoes" element={<Navigate to="/promotions" replace />} />
                  <Route path="/pedidos" element={<Navigate to="/orders" replace />} />
                  <Route path="/pedido/:id" element={<Navigate to={(params) => `/order/${params.id}`} replace />} />
                  <Route path="/perfil" element={<Navigate to="/profile" replace />} />
                  <Route path="/carrinho" element={<Navigate to="/cart" replace />} />
                  <Route path="/finalizar" element={<Navigate to="/checkout" replace />} />
                  <Route path="/cadastro" element={<Navigate to="/register" replace />} />
                  <Route path="/restaurante/cadastro" element={<Navigate to="/restaurant-signup" replace />} />
                  <Route path="/favoritos" element={<Navigate to="/favorites" replace />} />
                  <Route path="/notificacoes" element={<Navigate to="/notifications" replace />} />
                  <Route path="/configuracoes" element={<Navigate to="/settings" replace />} />
                  <Route path="/ajuda" element={<Navigate to="/help" replace />} />
                  <Route path="/entrega/:id" element={<Navigate to={(params) => `/tracking/${params.id}`} replace />} />
                  <Route path="/entregador/cadastro" element={<Navigate to="/delivery/signup" replace />} />
                  <Route path="/entregador/painel" element={<Navigate to="/delivery/dashboard" replace />} />
                  <Route path="/entregador/perfil" element={<Navigate to="/delivery/profile" replace />} />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <MongoDBConnectionStatus />
              <MongoDBConnectionChecker />
            </div>
          </Router>
          <Toaster />
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
