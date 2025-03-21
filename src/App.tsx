
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/context/UserContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatAssistant from "@/components/ui/ChatAssistant";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Novas páginas
import RestaurantDetails from "./pages/RestaurantDetails";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/restaurante/:id" element={<RestaurantDetails />} />
                <Route path="/restaurante/:id/menu" element={<Menu />} />
                <Route path="/carrinho" element={<Cart />} />
                <Route path="/finalizar" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Register />} />
                <Route path="/perfil" element={<UserProfile />} />
                <Route path="/pedidos" element={<OrderHistory />} />
                <Route path="/pedido/:id" element={<OrderDetails />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <ChatAssistant />
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
