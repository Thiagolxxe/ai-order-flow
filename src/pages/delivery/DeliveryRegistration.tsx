import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeftIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Import our components
import DeliveryInfoForm from '@/components/delivery-signup/DeliveryInfoForm';
import AddressForm from '@/components/delivery-signup/AddressForm';
import UserAccountForm from '@/components/delivery-signup/UserAccountForm';
import CompletedSignup from '@/components/delivery-signup/CompletedSignup';

// Form schema with validation
const deliverySchema = z.object({
  // Delivery Info
  nome: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  sobrenome: z.string().min(2, { message: 'Sobrenome é obrigatório' }),
  telefone: z.string().min(10, { message: 'Telefone inválido' }),
  cpf: z.string().min(11, { message: 'CPF inválido' }),
  cnh: z.string().min(11, { message: 'CNH inválida' }),
  
  // Address
  endereco: z.string().min(5, { message: 'Endereço é obrigatório' }),
  cidade: z.string().min(2, { message: 'Cidade é obrigatória' }),
  estado: z.string().length(2, { message: 'Use a sigla do estado (ex: SP)' }),
  cep: z.string().min(8, { message: 'CEP inválido' }),
  
  // User Account
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
});

export type DeliveryFormValues = z.infer<typeof deliverySchema>;

const DeliveryRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize form with validation
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      nome: '',
      sobrenome: '',
      telefone: '',
      cpf: '',
      cnh: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      email: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: DeliveryFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    
    try {
      // 1. Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.nome,
            sobrenome: data.sobrenome,
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Falha ao criar conta de usuário');
      }

      const userId = authData.user.id;

      // 2. Create delivery person profile
      const { error: profileError } = await supabase
        .from('entregadores')
        .insert({
          usuario_id: userId,
          nome: data.nome,
          sobrenome: data.sobrenome,
          telefone: data.telefone,
          cpf: data.cpf,
          cnh: data.cnh,
          endereco: data.endereco,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep,
          status: 'pendente', // Initial status is pending approval
        });

      if (profileError) {
        throw profileError;
      }

      // 3. Add delivery person role
      const { error: roleError } = await supabase
        .from('funcoes_usuario')
        .insert({
          usuario_id: userId,
          role_name: 'entregador'
        });

      if (roleError) {
        throw roleError;
      }

      // Show success state
      toast({
        title: "Cadastro realizado",
        description: "Seu cadastro foi enviado para análise. Você receberá um email quando for aprovado.",
        variant: "default"
      });
      setIsComplete(true);
      
    } catch (error: any) {
      console.error('Erro ao cadastrar entregador:', error);
      setAuthError(error.message || 'Erro ao cadastrar entregador');
      toast({
        title: "Erro",
        description: error.message || 'Erro ao cadastrar entregador',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return <CompletedSignup />;
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link to="/">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
            </Button>
            <CardTitle className="text-2xl">Cadastro de Entregador</CardTitle>
          </div>
          <CardDescription>
            Cadastre-se como entregador parceiro e comece a entregar pedidos
          </CardDescription>
        </CardHeader>

        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Erro de autenticação</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Delivery Info Section */}
              <DeliveryInfoForm control={form.control} />

              <Separator />
              
              {/* Address Section */}
              <AddressForm control={form.control} />

              <Separator />

              {/* Account Info Section */}
              <UserAccountForm control={form.control} />

              <CardFooter className="px-0 flex justify-between">
                <Button variant="outline" asChild>
                  <Link to="/">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Finalizar Cadastro'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryRegistration;
