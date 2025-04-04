
import React, { useState, useEffect } from 'react';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

const SuperUserCreator = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isRlsError, setIsRlsError] = useState(false);

  // Function to extract wait time from error message
  const extractWaitTime = (errorMessage: string): number => {
    const defaultWaitTime = 60;
    const timeMatch = errorMessage.match(/after (\d+) seconds/);
    return timeMatch ? parseInt(timeMatch[1]) : defaultWaitTime;
  };

  // Rate limit countdown effect
  useEffect(() => {
    let interval: number | undefined;
    
    if (isRateLimited && countdown > 0) {
      interval = window.setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRateLimited(false);
            setError(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRateLimited, countdown]);

  const handleCreateUser = async () => {
    if (!email || !password) {
      setError("Por favor, preencha o email e senha.");
      return;
    }

    // Don't proceed if already in progress or rate limited
    if (creating || isRateLimited) return;
    
    setCreating(true);
    setError(null);
    setIsRlsError(false);

    try {
      // Connect to MongoDB
      const { db } = await connectToDatabase();
      
      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser.data) {
        setError('Usuário com este email já existe');
        toast({
          title: "Usuário já existe",
          description: "Este email já está registrado no sistema.",
          variant: "destructive"
        });
        setCreating(false);
        return;
      }
      
      // Create new user
      const userId = Math.random().toString(36).substring(2, 15);
      const newUser = {
        id: userId,
        email: email,
        password: password, // In a real app, this would be hashed
        created_at: new Date().toISOString()
      };
      
      const result = await db.collection('users').insertOne(newUser);
      
      if (!result.data) {
        throw new Error('Falha ao criar usuário');
      }
      
      // Assign admin role to the new user
      const roleResult = await db.collection('user_roles').insertOne({
        usuario_id: userId,
        role_name: 'admin',
        created_at: new Date().toISOString()
      });
      
      if (!roleResult.data) {
        throw new Error('Falha ao atribuir função de administrador');
      }

      console.log('Super user created successfully:', userId);
      setEmail('');
      setPassword('');
      toast({
        title: "Usuário criado",
        description: "Usuário administrador criado com sucesso!",
        variant: "default"
      });
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

          {isRlsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Erro de permissão</AlertTitle>
              <AlertDescription>
                Não foi possível atribuir privilégios de administrador devido a restrições de segurança. 
                Por favor, entre em contato com o suporte.
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
              disabled={creating || isRateLimited}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={creating || isRateLimited}
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
