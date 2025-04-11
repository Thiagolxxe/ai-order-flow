
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/components/ui/theme-provider';
import '@/App.css';
import { UserProvider } from '@/context/UserContext';
import AppRoutes from '@/routes/AppRoutes';
import QueryProvider from '@/providers/QueryProvider';
import ScrollToTop from '@/components/layout/ScrollToTop';
import AppLayout from '@/components/layout/AppLayout';
import SEO from '@/components/seo/SEO';
import GeminiChatAssistant from '@/components/gemini-chat/GeminiChatAssistant';

const App = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <QueryProvider>
          <Router>
            <UserProvider>
              <SEO />
              <ScrollToTop />
              <AppLayout>
                <AppRoutes />
              </AppLayout>
              <Toaster />
              <GeminiChatAssistant />
            </UserProvider>
          </Router>
        </QueryProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
