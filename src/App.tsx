
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { UserProvider } from '@/context/UserContext';

// Layout Components
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MongoDBConnectionStatus from '@/components/mongodb/ConnectionStatus';

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
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <UserProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
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
                  <Route path="/promotions" element={<Promotions />} />
                  <Route path="/tracking/:id" element={<LiveTrackingMap />} />
                  <Route path="/restaurant-signup" element={<RestaurantSignup />} />
                  <Route path="/admin/restaurant" element={<RestaurantAdmin />} />
                  <Route path="/video-feed" element={<VideoFeed />} />
                  <Route path="/delivery/signup" element={<DeliveryRegistration />} />
                  <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
                  <Route path="/delivery/profile" element={<DeliveryProfile />} />
                  
                  {/* Add redirects for common Portuguese routes */}
                  <Route path="/restaurantes" element={<Navigate to="/restaurants" replace />} />
                  <Route path="/videos" element={<Navigate to="/video-feed" replace />} />
                  <Route path="/promocoes" element={<Navigate to="/promotions" replace />} />
                  <Route path="/pedidos" element={<Navigate to="/orders" replace />} />
                  <Route path="/restaurante/cadastro" element={<Navigate to="/restaurant-signup" replace />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <MongoDBConnectionStatus />
            </div>
          </Router>
          <Toaster />
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
