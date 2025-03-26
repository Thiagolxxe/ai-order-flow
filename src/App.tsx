
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "@/context/UserContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GeminiChatAssistant from "@/components/gemini-chat/GeminiChatAssistant";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Páginas existentes
import RestaurantDetails from "./pages/RestaurantDetails";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";

// Páginas administrativas e de entregador
import RestaurantAdmin from "./pages/admin/RestaurantAdmin";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import DeliveryProfile from "./pages/delivery/DeliveryProfile";
import DeliveryRegistration from "./pages/delivery/DeliveryRegistration";

// Outras páginas
import Reviews from "./pages/Reviews";
import Favorites from "./pages/Favorites";
import Notifications from "./pages/Notifications";
import Promotions from "./pages/Promotions";
import LiveTrackingMap from "./pages/LiveTrackingMap";
import RestaurantsExplore from "./pages/RestaurantsExplore";
import Chat from "./pages/Chat";
import VideoFeed from "./pages/VideoFeed";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-16">
              <Routes>
                {/* Redirecionando a página inicial para o feed de vídeos */}
                <Route path="/" element={<Navigate to="/videos" replace />} />
                <Route path="/restaurante/:id" element={<RestaurantDetails />} />
                <Route path="/restaurante/:id/menu" element={<Menu />} />
                <Route path="/carrinho" element={<Cart />} />
                <Route path="/finalizar" element={<Checkout />} />
                <Route path="/finalizar/:id" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Register />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/perfil" element={<UserProfile />} />
                <Route path="/pedidos" element={<OrderHistory />} />
                <Route path="/pedido/:id" element={<OrderDetails />} />
                
                {/* Mantendo a rota original do Index para acesso via /home */}
                <Route path="/home" element={<Index />} />
                
                {/* Rotas de entregador */}
                <Route path="/entregador" element={<DeliveryDashboard />} />
                <Route path="/entregador/perfil" element={<DeliveryProfile />} />
                <Route path="/entregador/cadastro" element={<DeliveryRegistration />} />
                
                {/* Rota de restaurante */}
                <Route path="/admin/restaurante" element={<RestaurantAdmin />} />
                
                {/* Outras rotas */}
                <Route path="/avaliacoes/:id?" element={<Reviews />} />
                <Route path="/favoritos" element={<Favorites />} />
                <Route path="/notificacoes" element={<Notifications />} />
                <Route path="/promocoes" element={<Promotions />} />
                
                {/* Rota do feed de vídeos */}
                <Route path="/videos" element={<VideoFeed />} />
                
                {/* Adicionando redirecionamentos para rotas em inglês */}
                <Route path="/restaurants" element={<Navigate to="/restaurantes" replace />} />
                <Route 
                  path="/checkout/:id" 
                  element={<Navigate to={`/finalizar/${window.location.pathname.split('/').pop()}`} replace />} 
                />
                <Route path="/checkout" element={<Navigate to="/finalizar" replace />} />
                <Route path="/restaurantes" element={<RestaurantsExplore />} />
                <Route path="/chat/:id?" element={<Chat />} />
                <Route path="/rastreamento/:id" element={<LiveTrackingMap />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <GeminiChatAssistant />
          <Toaster />
          <Sonner position="top-right" richColors />
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
