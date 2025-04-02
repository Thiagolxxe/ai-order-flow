
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeftIcon, Loader2 } from 'lucide-react';
import { createRestaurant } from '@/services/restaurantService';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Import our components
import RestaurantInfoForm from '@/components/restaurant-signup/RestaurantInfoForm';
import AddressForm from '@/components/restaurant-signup/AddressForm';
import UserAccountForm from '@/components/restaurant-signup/UserAccountForm';
import CompletedSignup from '@/components/restaurant-signup/CompletedSignup';

// Form schema with validation
const restaurantSchema = z.object({
  // Restaurant Info
  nome: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  tipo_cozinha: z.string().min(2, { message: 'Tipo de cozinha é obrigatório' }),
  descricao: z.string().optional(),
  telefone: z.string().min(10, { message: 'Telefone inválido' }),
  faixa_preco: z.number().min(1).max(5),
  
  // Address
  endereco: z.string().min(5, { message: 'Endereço é obrigatório' }),
  cidade: z.string().min(2, { message: 'Cidade é obrigatória' }),
  estado: z.string().length(2, { message: 'Use a sigla do estado (ex: SP)' }),
  cep: z.string().min(8, { message: 'CEP inválido' }),
  
  // User Account
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  nome_usuario: z.string().min(2, { message: 'Nome é obrigatório' }),
  sobrenome_usuario: z.string().min(2, { message: 'Sobrenome é obrigatório' }),
});

export type RestaurantFormValues = z.infer<typeof restaurantSchema>;

const RestaurantSignup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const navigate = useNavigate();
  
  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log("User already logged in:", data.session.user.id);
        // User is already logged in, we'll use this session when creating the restaurant
      }
    };
    
    checkSession();
  }, []);

  // Rate limit countdown effect
  useEffect(() => {
    let interval: number | undefined;
    
    if (isRateLimited && rateLimitCountdown > 0) {
      interval = window.setInterval(() => {
        setRateLimitCountdown((prev) => {
          if (prev <= 1) {
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRateLimited, rateLimitCountdown]);

  // Initialize form with validation
  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      nome: '',
      tipo_cozinha: '',
      descricao: '',
      telefone: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      faixa_preco: 2,
      email: '',
      password: '',
      nome_usuario: '',
      sobrenome_usuario: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: RestaurantFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    
    try {
      // Prepare data for API
      const restaurantData = {
        nome: data.nome,
        tipo_cozinha: data.tipo_cozinha,
        descricao: data.descricao,
        telefone: data.telefone,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        faixa_preco: data.faixa_preco,
      };
      
      const userData = {
        email: data.email,
        password: data.password,
        nome: data.nome_usuario,
        sobrenome: data.sobrenome_usuario,
      };
      
      // Call API to create restaurant
      const result = await createRestaurant(restaurantData, userData);
      
      if (!result.success) {
        // Handle rate limiting
        if (result.isRateLimited) {
          setIsRateLimited(true);
          setRateLimitCountdown(60);
          setAuthError(result.error);
          toast({
            title: "Limite de tentativas excedido",
            description: result.error,
            variant: "destructive"
          });
          return;
        }
        throw new Error(result.error);
      }
      
      // Show success state
      toast({
        title: "Cadastro realizado",
        description: "Restaurante cadastrado com sucesso!",
        variant: "default"
      });
      setIsComplete(true);
      
    } catch (error: any) {
      console.error('Erro ao cadastrar restaurante:', error);
      setAuthError(error.message || 'Erro ao cadastrar restaurante');
      toast({
        title: "Erro",
        description: error.message || 'Erro ao cadastrar restaurante',
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
            <CardTitle className="text-2xl">Cadastro de Restaurante</CardTitle>
          </div>
          <CardDescription>
            Cadastre seu restaurante e comece a receber pedidos online
          </CardDescription>
        </CardHeader>

        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Erro de autenticação</AlertTitle>
              <AlertDescription>
                {isRateLimited 
                  ? `${authError} (${rateLimitCountdown}s restantes)` 
                  : authError
                }
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Restaurant Info Section */}
              <RestaurantInfoForm control={form.control} />

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
                <Button type="submit" disabled={isSubmitting || isRateLimited}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : isRateLimited ? (
                    `Aguarde ${rateLimitCountdown}s`
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

export default RestaurantSignup;
