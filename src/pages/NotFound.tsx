
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-10 pb-8 text-center">
          <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
          <p className="text-xl text-foreground/80 mb-6">
            Oops! Página não encontrada
          </p>
          <p className="text-muted-foreground mb-8">
            A página que você está procurando não existe ou pode ter sido movida.
          </p>
          <Button asChild size="lg">
            <Link to="/">Voltar para o início</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
