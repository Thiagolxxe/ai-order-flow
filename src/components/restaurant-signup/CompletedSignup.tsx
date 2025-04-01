
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CompletedSignup = () => {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="flex flex-col items-center text-center py-12">
          <CheckCircle className="h-16 w-16 text-primary mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Cadastro realizado com sucesso!</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Seu restaurante foi cadastrado com sucesso. Faça login para começar a gerenciar seu cardápio.
          </p>
          <Button asChild>
            <Link to="/login">Fazer Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompletedSignup;
