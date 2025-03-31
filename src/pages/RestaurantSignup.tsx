
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeftIcon, CheckCircle, Loader2 } from 'lucide-react';
import { createRestaurant, fetchEstados, fetchCidadesByEstado } from '@/services/restaurantService';
import { toast } from '@/components/ui/use-toast';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

type RestaurantFormValues = z.infer<typeof restaurantSchema>;

// Define types for states and cities
type Estado = {
  uf: string;
  nome: string;
};

type Cidade = {
  id: number;
  nome: string;
};

const RestaurantSignup = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  
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

  // Fetch states on component mount
  useEffect(() => {
    const loadEstados = async () => {
      const data = await fetchEstados();
      setEstados(data);
    };
    
    loadEstados();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    const loadCidades = async () => {
      if (selectedEstado) {
        const data = await fetchCidadesByEstado(selectedEstado);
        setCidades(data);
      } else {
        setCidades([]);
      }
    };
    
    loadCidades();
  }, [selectedEstado]);

  // Handle state selection
  const handleEstadoChange = (value: string) => {
    setSelectedEstado(value);
    form.setValue('estado', value);
    form.setValue('cidade', ''); // Reset city when state changes
  };

  // Handle form submission
  const onSubmit = async (data: RestaurantFormValues) => {
    setIsSubmitting(true);
    
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
    return (
      <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center text-center py-12">
            <CheckCircle className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Cadastro realizado com sucesso!</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Seu restaurante foi cadastrado com sucesso. Faça login para começar a gerenciar seu cardápio.
            </p>
            <Button asChild>
              <Link to="/login">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Restaurant Info Section */}
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
                          <Input placeholder="Ex: Italiana, Brasileira" {...field} />
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
              
              {/* Address Section */}
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
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select 
                          onValueChange={handleEstadoChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {estados.map(estado => (
                              <SelectItem key={estado.uf} value={estado.uf}>
                                {estado.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!selectedEstado}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedEstado ? "Selecione uma cidade" : "Selecione um estado primeiro"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cidades.map(cidade => (
                              <SelectItem key={cidade.id} value={cidade.nome}>
                                {cidade.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

              <Separator />

              {/* Account Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações de Acesso</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome_usuario"
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
                    name="sobrenome_usuario"
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

export default RestaurantSignup;
