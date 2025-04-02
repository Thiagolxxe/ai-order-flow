
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const SuperUserCreator = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startCountdown = (seconds: number) => {
    setIsRateLimited(true);
    setCountdown(seconds);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRateLimited(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCreateUser = async () => {
    if (!email || !password) {
      setError("Por favor, preencha o email e senha.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        // Handle rate limiting
        if (error.message.includes("security purposes") || error.status === 429) {
          const waitTime = 60; // Default wait time in seconds
          const timeMatch = error.message.match(/after (\d+) seconds/);
          const seconds = timeMatch ? parseInt(timeMatch[1]) : waitTime;
          
          setError(`Muitas tentativas recentes. Por favor, aguarde.`);
          startCountdown(seconds);
          toast({
            title: "Limite de tentativas excedido",
            description: `Tente novamente em ${seconds} segundos.`,
            variant: "destructive"
          });
          return;
        }

        console.error('Error creating user:', error);
        setError(error.message);
        toast({
          title: "Erro ao criar usuário",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      const newUser = data.user;

      if (newUser) {
        // Assign admin role to the new user
        const { error: roleError } = await supabase
          .from('funcoes_usuario')
          .insert({
            usuario_id: newUser.id,
            role_name: 'admin'
          });

        if (roleError) {
          console.error('Error assigning admin role:', roleError);
          setError(roleError.message);
          toast({
            title: "Erro ao atribuir role de administrador",
            description: roleError.message,
            variant: "destructive"
          });
          return;
        }

        console.log('Super user created successfully:', newUser.id);
        setEmail('');
        setPassword('');
        toast({
          title: "Usuário criado",
          description: "Usuário administrador criado com sucesso!",
          variant: "default"
        });
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(err.message || "Ocorreu um erro inesperado ao criar o usuário.");
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao criar o usuário.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Criar Super Usuário</CardTitle>
          <CardDescription>
            Crie um novo usuário com privilégios de administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>
                {isRateLimited ? `${error} (${countdown}s restantes)` : error}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="email@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateUser} disabled={creating || isRateLimited}>
            {creating ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </div>
            ) : isRateLimited ? (
              `Aguarde ${countdown}s`
            ) : (
              'Criar Usuário'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperUserCreator;
