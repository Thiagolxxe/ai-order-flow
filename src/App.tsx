
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
import Navbar from '@/components/layout/Navbar';
import GeminiChatAssistant from '@/components/gemini-chat/GeminiChatAssistant';

// Lazy loaded components
const VideoFeed = lazy(() => import('@/pages/VideoFeed'));
const RestaurantsExplore = lazy(() => import('@/pages/RestaurantsExplore'));
const RestaurantDetails = lazy(() => import('@/pages/RestaurantDetails'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Terms = lazy(() => import('@/pages/Terms'));

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

const App = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <UserProvider>
            <Navbar />
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
            </Routes>
            
            <Toaster />
            <GeminiChatAssistant />
          </UserProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
