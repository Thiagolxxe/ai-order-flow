
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const CompletedSignup = () => {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex items-center justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-2xl text-center">Cadastro concluído!</CardTitle>
          <CardDescription className="text-center">
            Seu cadastro foi enviado com sucesso e está em análise.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p>
            Agradecemos seu interesse em se tornar um entregador parceiro. Nossa equipe está analisando suas informações e entrará em contato em breve.
          </p>
          <p>
            Você receberá um email quando seu cadastro for aprovado com instruções para começar a entregar.
          </p>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link to="/">Voltar para a página inicial</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CompletedSignup;
