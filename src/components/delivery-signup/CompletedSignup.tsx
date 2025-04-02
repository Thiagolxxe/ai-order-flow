
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CompletedSignup = () => {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Cadastro Concluído</CardTitle>
          <CardDescription>
            Seu cadastro como entregador foi realizado com sucesso!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p>
            Agora você já pode começar a receber solicitações de entrega e 
            acompanhar seu desempenho no painel de entregador.
          </p>
          
          <p>
            Dicas importantes:
          </p>
          
          <ul className="text-left space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Mantenha seu GPS ativado durante as entregas para melhor rastreamento.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Verifique suas notificações regularmente para aceitar novos pedidos.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Entre em contato com o suporte caso precise de ajuda durante as entregas.</span>
            </li>
          </ul>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link to="/delivery/dashboard">Ir para o Painel</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CompletedSignup;
