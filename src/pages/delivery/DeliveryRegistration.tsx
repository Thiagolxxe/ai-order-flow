
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';

// Form validation schema
const registrationFormSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  senha: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  confirmarSenha: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  nome: z.string().min(2, { message: 'Nome é obrigatório' }),
  sobrenome: z.string().min(2, { message: 'Sobrenome é obrigatório' }),
  telefone: z.string().min(10, { message: 'Telefone inválido' }),
  tipo_veiculo: z.string().min(2, { message: 'Tipo de veículo é obrigatório' }),
  placa: z.string().min(5, { message: 'Placa é obrigatória' }),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

const DeliveryRegistration = () => {
  const { signIn } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Form setup
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      email: '',
      senha: '',
      confirmarSenha: '',
      nome: '',
      sobrenome: '',
      telefone: '',
      tipo_veiculo: '',
      placa: '',
    },
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    setIsLoading(true);
    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
        options: {
          data: {
            nome: data.nome,
            sobrenome: data.sobrenome,
          }
        }
      });

      if (authError) throw authError;
      
      // 2. Set user role as entregador
      if (authData?.user) {
        const { error: roleError } = await supabase
          .from('funcoes_usuario')
          .insert({
            usuario_id: authData.user.id,
            funcao: 'entregador'
          });
          
        if (roleError) throw roleError;
        
        // 3. Create entregador record
        const { error: entregadorError } = await supabase
          .from('entregadores')
          .insert({
            id: authData.user.id,
            tipo_veiculo: data.tipo_veiculo,
            placa: data.placa,
            ativo: true
          });
          
        if (entregadorError) throw entregadorError;
        
        // 4. Update the profile record with phone
        const { error: profileError } = await supabase
          .from('perfis')
          .update({
            telefone: data.telefone
          })
          .eq('id', authData.user.id);
          
        if (profileError) throw profileError;
      }
      
      toast.success('Cadastro realizado com sucesso!');
      
      // Automatically sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.senha
      });
      
      if (signInError) throw signInError;
      
      navigate('/entregador/perfil');
    } catch (error: any) {
      console.error('Error in registration:', error);
      toast.error('Erro no cadastro: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-screen-md py-10">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Cadastro de Entregador</CardTitle>
          <CardDescription>
            Junte-se à nossa plataforma como entregador e comece a ganhar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Dados de Acesso</h3>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="senha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmarSenha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sobrenome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobrenome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu sobrenome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Informações do Veículo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo_veiculo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Veículo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Moto, Carro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="placa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placa</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: ABC-1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md text-sm">
                <p>Ao se cadastrar, você concorda com nossos <a href="#" className="text-primary underline">Termos de Serviço</a> e <a href="#" className="text-primary underline">Política de Privacidade</a>.</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Processando...' : 'Completar Cadastro'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta? <a href="/login" className="text-primary underline">Faça login</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DeliveryRegistration;
