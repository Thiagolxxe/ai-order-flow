
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CompletedSignup = () => {
  return (
    <div className="container py-8 px-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100">
            <CheckIcon className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-center">Cadastro realizado com sucesso!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Seu cadastro foi realizado com sucesso. Nossa equipe irá analisar suas informações
            e entraremos em contato em breve.
          </p>
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/delivery/dashboard">Ir para o Dashboard</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/">Voltar para Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompletedSignup;
