
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertIcon } from "@/assets/icons";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: Usuário tentou acessar uma rota inexistente:",
      location.pathname
    );
    
    // Automatically redirect common Portuguese routes
    const route = getSuggestion(location.pathname);
    if (route) {
      console.log(`Redirecting from ${location.pathname} to ${route}`);
      setTimeout(() => {
        navigate(route);
      }, 1500); // Add a short delay to show the message before redirecting
    }
  }, [location.pathname, navigate]);

  // Função para sugerir uma rota baseado na rota atual
  const getSuggestion = (path: string) => {
    // Mapeamento de rotas em português para as rotas corretas
    const routeMap: Record<string, string> = {
      '/restaurantes': '/restaurants',
      '/videos': '/video-feed',
      '/promocoes': '/promotions',
      '/pedidos': '/orders',
      '/perfil': '/profile',
      '/carrinho': '/cart',
      '/finalizar': '/checkout',
      '/cadastro': '/register',
      '/restaurante/cadastro': '/restaurant-signup',
      '/favoritos': '/favorites',
      '/notificacoes': '/notifications',
      '/configuracoes': '/settings',
      '/ajuda': '/help',
      '/entregador/cadastro': '/delivery/signup',
      '/entregador/painel': '/delivery/dashboard',
      '/entregador/perfil': '/delivery/profile'
    };

    // Verificação exata primeiro
    if (routeMap[path]) {
      return routeMap[path];
    }

    // Verifica se alguma das chaves é um prefixo da rota atual
    for (const [ptRoute, engRoute] of Object.entries(routeMap)) {
      if (path.startsWith(ptRoute)) {
        const suffix = path.substring(ptRoute.length);
        return engRoute + suffix;
      }
    }
    
    // Verifique rotas com parâmetros
    const restauranteMatch = path.match(/^\/restaurante\/([^\/]+)$/);
    if (restauranteMatch) {
      return `/restaurant/${restauranteMatch[1]}`;
    }
    
    const pedidoMatch = path.match(/^\/pedido\/([^\/]+)$/);
    if (pedidoMatch) {
      return `/order/${pedidoMatch[1]}`;
    }
    
    const entregaMatch = path.match(/^\/entrega\/([^\/]+)$/);
    if (entregaMatch) {
      return `/tracking/${entregaMatch[1]}`;
    }

    return null;
  };

  const suggestedRoute = getSuggestion(location.pathname);

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-10 pb-8 text-center">
          <div className="flex justify-center mb-4">
            <AlertIcon size={48} className="text-primary" />
          </div>
          <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
          <p className="text-xl text-foreground/80 mb-6">
            Oops! Página não encontrada
          </p>
          <p className="text-muted-foreground mb-8">
            A página {location.pathname} não existe ou pode ter sido movida.
            {suggestedRoute && (
              <span className="block mt-2">
                Você quis dizer: <Link to={suggestedRoute} className="text-primary font-medium hover:underline">{suggestedRoute}</Link>?
                <br />
                <span className="text-sm text-muted-foreground">Redirecionando automaticamente...</span>
              </span>
            )}
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              Voltar
            </Button>
            <Button asChild size="lg">
              <Link to="/">Ir para o início</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
