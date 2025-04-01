import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const SuperUserCreator = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateUser = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Error creating user:', error);
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
            usuario_id: newUser.id, // Use the correct user ID
            role_name: 'admin' // Changed from 'funcao' to 'role_name'
          });

        if (roleError) {
          console.error('Error assigning admin role:', roleError);
          toast({
            title: "Erro ao atribuir role de administrador",
            description: roleError.message,
            variant: "destructive"
          });
          return;
        }

        console.log('Super user created successfully:', newUser.id);
        toast({
          title: "Usuário criado",
          description: "Usuário administrador criado com sucesso!",
          variant: "default"
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
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
          <Button onClick={handleCreateUser} disabled={creating}>
            {creating ? 'Criando...' : 'Criar Usuário'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperUserCreator;
