
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertIcon, SuccessIcon } from "@/assets/icons";
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

const SuperUserCreator = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    email?: string;
    password?: string;
    roles?: string[];
    message?: string;
  } | null>(null);

  const handleCreateSuperUser = async () => {
    setIsCreating(true);
    try {
      // Create a random email and password for the super user
      const email = `super_${Math.floor(Math.random() * 10000)}@example.com`;
      const password = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);
      
      // Create the user
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (userError) throw userError;
      
      // Wait a moment to ensure the user is created and the trigger has run
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Assign roles
      const roles = ['cliente', 'restaurante', 'entregador', 'admin'];
      
      // Add roles for the user
      const userId = userData.user?.id;
      
      if (userId) {
        for (const role of roles) {
          const { error: roleError } = await supabase
            .from('funcoes_usuario')
            .insert({
              usuario_id: userId,
              funcao: role
            });
            
          if (roleError) {
            console.error(`Error assigning role ${role}:`, roleError);
          }
        }
      }
      
      setResult({
        success: true,
        email,
        password,
        roles
      });
      
      toast({
        title: "Super usuário criado",
        description: "O super usuário foi criado com sucesso."
      });
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Ocorreu um erro ao criar o super usuário'
      });
      
      toast({
        title: "Erro ao criar super usuário",
        description: err.message || 'Ocorreu um erro ao criar o super usuário',
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Criar Super Usuário</CardTitle>
        <CardDescription>
          Crie um usuário com todas as permissões para testar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <Alert 
            className={`mb-4 ${result.success ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}
          >
            <div className="h-4 w-4 mr-2">
              {result.success ? <SuccessIcon className="text-green-600" /> : <AlertIcon className="text-red-600" />}
            </div>
            <AlertTitle>{result.success ? 'Super usuário criado com sucesso!' : 'Erro!'}</AlertTitle>
            <AlertDescription>
              {result.success ? (
                <div className="mt-2">
                  <p><strong>Email:</strong> {result.email}</p>
                  <p><strong>Senha:</strong> {result.password}</p>
                  <p><strong>Funções:</strong> {result.roles?.join(', ')}</p>
                  <p className="mt-2 text-sm">Guarde estas informações em um local seguro.</p>
                </div>
              ) : (
                result.message
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <p className="text-sm text-muted-foreground mb-4">
          Este usuário terá acesso a todas as funções do sistema: cliente, restaurante, entregador e administrador.
          Use-o apenas para fins de teste e desenvolvimento.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCreateSuperUser} 
          disabled={isCreating || (result?.success ?? false)}
          className="w-full"
        >
          {isCreating ? 'Criando...' : 'Criar Super Usuário'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SuperUserCreator;
