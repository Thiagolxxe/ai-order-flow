
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from '@/components/ui/form';

// Define form schema with Zod
const formSchema = z.object({
  firstName: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  }),
  lastName: z.string().min(2, {
    message: 'O sobrenome deve ter pelo menos 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Por favor, insira um email válido.',
  }),
  password: z.string().min(8, {
    message: 'A senha deve ter pelo menos 8 caracteres.',
  }),
  passwordConfirm: z.string().min(8, {
    message: 'A senha deve ter pelo menos 8 caracteres.',
  }),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'Você deve aceitar os termos e condições.' }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Register = () => {
  const { signUp } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirm: '',
      terms: false as unknown as true, // This is a TypeScript hack to make the initial value false while satisfying the type
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (data.password !== data.passwordConfirm) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Properly format the credentials for signup
      const credentials = {
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.firstName,
            sobrenome: data.lastName
          }
        }
      };
      
      const { error } = await signUp(credentials);
      
      if (error) {
        toast.error(error.message || 'Erro ao criar conta');
      } else {
        toast.success('Conta criada com sucesso!');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-8">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Criar uma conta</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          id="firstName"
                          placeholder="Nome"
                          type="text"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          id="lastName"
                          placeholder="Sobrenome"
                          type="text"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="seu-email@exemplo.com"
                          type="email"
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect="off"
                          disabled={isLoading}
                          {...field}
                        />
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
                      <FormControl>
                        <Input
                          id="password"
                          placeholder="Senha"
                          type="password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="passwordConfirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          id="passwordConfirm"
                          placeholder="Confirmar Senha"
                          type="password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium leading-none">
                          Aceito os <Link to="/terms" className="underline underline-offset-2">termos e condições</Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button disabled={isLoading} type="submit" className="w-full">
                Criar conta
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Separator className="my-4" />
      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link to="/login" className="underline underline-offset-2">
          Entrar
        </Link>
      </p>
    </div>
  );
};

export default Register;
