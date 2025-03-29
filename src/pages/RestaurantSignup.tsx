
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ArrowLeftIcon, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Esquema de validação do formulário de restaurante
const restaurantFormSchema = z.object({
  nome: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  tipo_cozinha: z.string().min(2, { message: 'Tipo de cozinha é obrigatório' }),
  descricao: z.string().optional(),
  telefone: z.string().min(10, { message: 'Telefone inválido' }),
  endereco: z.string().min(5, { message: 'Endereço é obrigatório' }),
  cidade: z.string().min(2, { message: 'Cidade é obrigatória' }),
  estado: z.string().length(2, { message: 'Use a sigla do estado (ex: SP)' }),
  cep: z.string().min(8, { message: 'CEP inválido' }),
  faixa_preco: z.number().min(1).max(5),
});

// Esquema de validação para conta de usuário
const userAccountSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  nome: z.string().min(2, { message: 'Nome é obrigatório' }),
  sobrenome: z.string().min(2, { message: 'Sobrenome é obrigatório' }),
});

type RestaurantFormValues = z.infer<typeof restaurantFormSchema>;
type UserAccountValues = z.infer<typeof userAccountSchema>;

const RestaurantSignup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [planType, setPlanType] = useState<'free' | 'premium'>('free');
  const [activeTab, setActiveTab] = useState<'info' | 'conta'>('info');
  const [restaurantData, setRestaurantData] = useState<RestaurantFormValues | null>(null);
  
  // Definir valores padrão do formulário de restaurante
  const restaurantForm = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantFormSchema),
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
    },
  });

  // Formulário para conta de usuário
  const userAccountForm = useForm<UserAccountValues>({
    resolver: zodResolver(userAccountSchema),
    defaultValues: {
      email: '',
      password: '',
      nome: '',
      sobrenome: '',
    }
  });

  // Função para lidar com o envio do formulário de informações do restaurante
  const handleRestaurantInfoSubmit = (data: RestaurantFormValues) => {
    setRestaurantData(data);
    setActiveTab('conta');
  };

  // Função para criar conta e registrar restaurante
  const handleAccountSubmit = async (userData: UserAccountValues) => {
    if (!restaurantData) {
      toast.error('Informações do restaurante não encontradas');
      setActiveTab('info');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Criar conta de usuário
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            nome: userData.nome,
            sobrenome: userData.sobrenome,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('Falha ao criar conta de usuário');
      }

      const userId = authData.user.id;

      // 2. Registrar o restaurante
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurantes')
        .insert({
          nome: restaurantData.nome,
          tipo_cozinha: restaurantData.tipo_cozinha,
          descricao: restaurantData.descricao || null,
          telefone: restaurantData.telefone,
          endereco: restaurantData.endereco,
          cidade: restaurantData.cidade,
          estado: restaurantData.estado,
          cep: restaurantData.cep,
          faixa_preco: restaurantData.faixa_preco,
          proprietario_id: userId,
        })
        .select()
        .single();

      if (restaurantError) throw restaurantError;

      // 3. Adicionar função de restaurante ao usuário
      const { error: roleError } = await supabase
        .from('funcoes_usuario')
        .insert({
          usuario_id: userId,
          funcao: 'restaurante',
        });

      if (roleError) throw roleError;

      toast.success('Restaurante cadastrado com sucesso!');
      
      // Se for plano premium, redirecionar para checkout
      if (planType === 'premium') {
        setStep(3);
      } else {
        // Redirecionar para página de login
        toast.success('Faça login para acessar seu painel de restaurante', {
          duration: 5000,
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar restaurante:', error);
      toast.error(error.message || 'Erro ao cadastrar restaurante');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para avançar para a etapa de seleção de plano
  const goToSelectPlan = () => {
    if (activeTab === 'info') {
      const result = restaurantForm.trigger();
      if (result) {
        const data = restaurantForm.getValues();
        setRestaurantData(data);
        setActiveTab('conta');
      }
    } else {
      const result = userAccountForm.trigger();
      if (result) {
        setStep(2);
      }
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
      <Card className="w-full max-w-2xl">
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
            Cadastre seu restaurante e comece a receber pedidos
          </CardDescription>
        </CardHeader>

        {step === 1 && (
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'info' | 'conta')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="info">Informações do Restaurante</TabsTrigger>
                <TabsTrigger value="conta">Conta de Acesso</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info">
                <Form {...restaurantForm}>
                  <form onSubmit={restaurantForm.handleSubmit(handleRestaurantInfoSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={restaurantForm.control}
                          name="nome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Restaurante</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Sabor Brasileiro" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={restaurantForm.control}
                          name="tipo_cozinha"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Cozinha</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Italiana, Brasileira, Japonesa" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={restaurantForm.control}
                        name="descricao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Descreva seu restaurante em poucas palavras"
                                className="resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={restaurantForm.control}
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
                        
                        <FormField
                          control={restaurantForm.control}
                          name="faixa_preco"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Faixa de Preço (1-5)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1} 
                                  max={5} 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Endereço</h3>
                      
                      <FormField
                        control={restaurantForm.control}
                        name="endereco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Rua, número, bairro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={restaurantForm.control}
                          name="cidade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cidade</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: São Paulo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={restaurantForm.control}
                          name="estado"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: SP" maxLength={2} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={restaurantForm.control}
                          name="cep"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CEP</FormLabel>
                              <FormControl>
                                <Input placeholder="00000-000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="conta">
                <Form {...userAccountForm}>
                  <form onSubmit={userAccountForm.handleSubmit(handleAccountSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Informações de Acesso</h3>
                      
                      <FormField
                        control={userAccountForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="seu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={userAccountForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={userAccountForm.control}
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
                          control={userAccountForm.control}
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
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}

        {step === 2 && (
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Escolha seu plano</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer border-2 ${planType === 'free' ? 'border-primary' : 'border-muted'}`}
                    onClick={() => setPlanType('free')}
                  >
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        Plano Gratuito
                        {planType === 'free' && <CheckCircle className="h-5 w-5 text-primary" />}
                      </CardTitle>
                      <CardDescription>Ideal para começar</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold mb-4">R$ 0,00</p>
                      <ul className="space-y-2">
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> Cadastro básico</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> Até 20 itens no cardápio</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> Suporte básico</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer border-2 ${planType === 'premium' ? 'border-primary' : 'border-muted'}`}
                    onClick={() => setPlanType('premium')}
                  >
                    <CardHeader>
                      <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded absolute right-4 top-4">
                        Mais popular
                      </div>
                      <CardTitle className="flex justify-between items-center">
                        Plano Premium
                        {planType === 'premium' && <CheckCircle className="h-5 w-5 text-primary" />}
                      </CardTitle>
                      <CardDescription>Para restaurantes estabelecidos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-2xl font-bold">R$ 99,90<span className="text-sm font-normal">/mês</span></p>
                        <p className="text-sm text-muted-foreground">Após 30 dias gratuitos</p>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> Cadastro ilimitado</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> Itens ilimitados no cardápio</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> Suporte prioritário</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> Relatórios avançados</li>
                        <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> 30 dias grátis</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        )}

        {step === 3 && (
          <CardContent className="flex flex-col items-center text-center py-12">
            <CheckCircle className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Cadastro realizado com sucesso!</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {planType === 'premium' 
                ? 'Seu período de teste de 30 dias está ativo. Aproveite todas as funcionalidades premium!'
                : 'Seu restaurante foi cadastrado com sucesso. Faça login para começar a gerenciar seu cardápio.'}
            </p>
            <Button asChild>
              <Link to="/login">Fazer Login</Link>
            </Button>
          </CardContent>
        )}

        <CardFooter className="flex justify-between">
          {step === 1 && (
            <>
              <Button variant="outline" asChild>
                <Link to="/">Cancelar</Link>
              </Button>
              <Button onClick={goToSelectPlan}>
                {activeTab === 'info' ? 'Próximo' : 'Escolher Plano'}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
              <Button onClick={userAccountForm.handleSubmit(handleAccountSubmit)} disabled={isLoading}>
                {isLoading ? 'Processando...' : 'Finalizar Cadastro'}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default RestaurantSignup;
