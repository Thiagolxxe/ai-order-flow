import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import SuspenseLoader from '@/components/ui/SuspenseLoader';
import { ThemeProvider } from '@/components/ui/theme-provider';
import '@/App.css';
import Index from '@/pages/Index';
import { UserProvider } from '@/context/UserContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CartProvider } from '@/context/CartContext';
import { LocationProvider } from '@/context/LocationContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { OrderProvider } from '@/context/OrderContext';
import { RestaurantProvider } from '@/context/RestaurantContext';
import { DeliveryProvider } from '@/context/DeliveryContext';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import Checkout from '@/pages/Checkout';
import Orders from '@/pages/Orders';
import OrderDetails from '@/pages/OrderDetails';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PublicRoute from '@/components/auth/PublicRoute';
import DeliveryRegistration from '@/pages/DeliveryRegistration';
import RestaurantRegistration from '@/pages/RestaurantRegistration';
import DeliveryDashboard from '@/pages/DeliveryDashboard';
import RestaurantDashboard from '@/pages/RestaurantDashboard';
import Notifications from '@/pages/Notifications';
import Settings from '@/pages/Settings';
import Help from '@/pages/Help';

// Lazy loaded components
const VideoFeed = lazy(() => import('@/pages/VideoFeed'));
const RestaurantsExplore = lazy(() => import('@/pages/RestaurantsExplore'));
const RestaurantDetails = lazy(() => import('@/pages/RestaurantDetails'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <LocationProvider>
            <NotificationProvider>
              <CartProvider>
                <OrderProvider>
                  <RestaurantProvider>
                    <DeliveryProvider>
                      <Router>
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
                            <PublicRoute>
                              <Login />
                            </PublicRoute>
                          } />
                          
                          <Route path="/register" element={
                            <PublicRoute>
                              <Register />
                            </PublicRoute>
                          } />
                          
                          {/* Protected routes */}
                          <Route path="/profile" element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/checkout" element={
                            <ProtectedRoute>
                              <Checkout />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/orders" element={
                            <ProtectedRoute>
                              <Orders />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/orders/:id" element={
                            <ProtectedRoute>
                              <OrderDetails />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/notifications" element={
                            <ProtectedRoute>
                              <Notifications />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/settings" element={
                            <ProtectedRoute>
                              <Settings />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/help" element={<Help />} />
                          
                          {/* Delivery routes */}
                          <Route path="/delivery/register" element={
                            <ProtectedRoute>
                              <DeliveryRegistration />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/delivery/dashboard" element={
                            <ProtectedRoute>
                              <DeliveryDashboard />
                            </ProtectedRoute>
                          } />
                          
                          {/* Restaurant routes */}
                          <Route path="/restaurant/register" element={
                            <ProtectedRoute>
                              <RestaurantRegistration />
                            </ProtectedRoute>
                          } />
                          
                          <Route path="/restaurant/dashboard" element={
                            <ProtectedRoute>
                              <RestaurantDashboard />
                            </ProtectedRoute>
                          } />
                          
                          {/* 404 route */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        
                        <Toaster />
                      </Router>
                    </DeliveryProvider>
                  </RestaurantProvider>
                </OrderProvider>
              </CartProvider>
            </NotificationProvider>
          </LocationProvider>
        </UserProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
