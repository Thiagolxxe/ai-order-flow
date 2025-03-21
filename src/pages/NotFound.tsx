
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertIcon } from "@/assets/icons";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Usuário tentou acessar uma rota inexistente:",
      location.pathname
    );
  }, [location.pathname]);

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
            A página que você está procurando não existe ou pode ter sido movida.
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
