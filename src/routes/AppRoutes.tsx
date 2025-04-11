
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuspenseLoader from '@/components/ui/SuspenseLoader';
import Index from '@/pages/Index';

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

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirect root path to videos */}
      <Route path="/" element={<Navigate to="/videos" replace />} />
      
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
  );
};

export default AppRoutes;
