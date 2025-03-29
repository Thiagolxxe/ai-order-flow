
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ArrowLeftIcon, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
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
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { Separator } from '@/components/ui/separator';

// Esquema de validação do formulário
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

type RestaurantFormValues = z.infer<typeof restaurantFormSchema>;

const RestaurantSignup = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [planType, setPlanType] = useState<'free' | 'premium'>('free');

  // Definir valores padrão do formulário
  const defaultValues: Partial<RestaurantFormValues> = {
    nome: '',
    tipo_cozinha: '',
    descricao: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    faixa_preco: 2,
  };

  // Inicializar o formulário com react-hook-form e resolver do zod
  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues,
  });

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: RestaurantFormValues) => {
    if (!user) {
      toast.error('Você precisa estar logado para cadastrar um restaurante');
      navigate('/login');
      return;
    }

    setIsLoading(true);

    try {
      // Registrar o restaurante no banco de dados
      const { data: restaurant, error } = await supabase
        .from('restaurantes')
        .insert({
          nome: data.nome,
          tipo_cozinha: data.tipo_cozinha,
          descricao: data.descricao || null,
          telefone: data.telefone,
          endereco: data.endereco,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep,
          faixa_preco: data.faixa_preco,
          proprietario_id: user.id,
          // Para plano premium, definimos a data de expiração do teste grátis
          // período_teste_expira: planType === 'premium' ? 
          //   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Adicionar função de restaurante ao usuário
      const { error: roleError } = await supabase
        .from('funcoes_usuario')
        .insert({
          usuario_id: user.id,
          funcao: 'restaurante',
        });

      if (roleError) throw roleError;

      toast.success('Restaurante cadastrado com sucesso!');
      
      // Se for plano premium, redirecionar para checkout
      if (planType === 'premium') {
        // TODO: Implementar redirecionamento para checkout do Stripe
        setStep(3);
      } else {
        navigate('/admin/restaurante');
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
    const result = form.trigger();
    if (result) {
      setStep(2);
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
            <Form {...form}>
              <form className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações do Restaurante</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                    control={form.control}
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
                    
                    <FormField
                      control={form.control}
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
                    control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                : 'Seu restaurante foi cadastrado com sucesso. Comece a gerenciar seu cardápio agora mesmo.'}
            </p>
            <Button asChild>
              <Link to="/admin/restaurante">Acessar Painel do Restaurante</Link>
            </Button>
          </CardContent>
        )}

        <CardFooter className="flex justify-between">
          {step === 1 && (
            <>
              <Button variant="outline" asChild>
                <Link to="/">Cancelar</Link>
              </Button>
              <Button onClick={goToSelectPlan}>Próximo</Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
              <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
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
