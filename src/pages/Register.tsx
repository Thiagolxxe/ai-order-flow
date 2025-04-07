
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
  terms: z.boolean().refine((value) => value === true, {
    message: 'Você deve aceitar os termos e condições.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Register = () => {
  const { signUp } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirm: '',
      terms: false,
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
          {/* <CardDescription>
            Insira seu email abaixo para criar sua conta
          </CardDescription> */}
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              {/* First Name */}
              <div className="grid gap-1">
                {/* <Label htmlFor="firstName">Nome</Label> */}
                <Input
                  id="firstName"
                  placeholder="Nome"
                  type="text"
                  disabled={isLoading}
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              
              {/* Last Name */}
              <div className="grid gap-1">
                {/* <Label htmlFor="lastName">Sobrenome</Label> */}
                <Input
                  id="lastName"
                  placeholder="Sobrenome"
                  type="text"
                  disabled={isLoading}
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
              
              {/* Email */}
              <div className="grid gap-1">
                {/* <Label htmlFor="email">Email</Label> */}
                <Input
                  id="email"
                  placeholder="seu-email@exemplo.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              
              {/* Password */}
              <div className="grid gap-1">
                {/* <Label htmlFor="password">Senha</Label> */}
                <Input
                  id="password"
                  placeholder="Senha"
                  type="password"
                  disabled={isLoading}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              
              {/* Confirm Password */}
              <div className="grid gap-1">
                {/* <Label htmlFor="passwordConfirm">Confirmar Senha</Label> */}
                <Input
                  id="passwordConfirm"
                  placeholder="Confirmar Senha"
                  type="password"
                  disabled={isLoading}
                  {...register('passwordConfirm')}
                />
                {errors.passwordConfirm && (
                  <p className="text-sm text-red-500">{errors.passwordConfirm.message}</p>
                )}
              </div>
              
              {/* Terms and Conditions */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  disabled={isLoading}
                  {...register('terms')}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
                >
                  Aceito os <Link to="/terms" className="underline underline-offset-2">termos e condições</Link>
                </label>
                {errors.terms && (
                  <p className="text-sm text-red-500">{errors.terms.message}</p>
                )}
              </div>
            </div>
            
            <CardFooter>
              <Button disabled={isLoading} type="submit" className="w-full">
                Criar conta
              </Button>
            </CardFooter>
          </form>
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
