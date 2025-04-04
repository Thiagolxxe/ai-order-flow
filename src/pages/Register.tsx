import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Mail, LockKeyhole, User, ArrowRight } from 'lucide-react';
import { useUser } from '@/context/UserContext';

const Register = () => {
  const navigate = useNavigate();
  const { signUp, isAuthenticated } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!formData.email || !formData.password || !formData.name) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password, {
        name: formData.name
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Conta criada com sucesso!');
      navigate('/');
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container relative flex h-[100dvh] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        to="/login"
        className="absolute left-4 top-4 md:left-8 md:top-8 text-secondary hover:underline"
      >
        Voltar para login
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-foreground lg:flex">
        <div className="absolute inset-0 bg-zinc-900/20" />
        <Link
          to="/"
          className="absolute left-4 top-4 md:left-8 md:top-8 text-lg font-bold"
        >
          DeliveryApp
        </Link>
        <div className="relative mt-20">
          <div className="mb-4 flex items-center justify-center">
            <User className="mr-2 h-4 w-4" />
            Cadastro de novos usuários
          </div>
          <h1 className="text-2xl font-semibold">
            Bem-vindo ao nosso sistema de entregas!
          </h1>
          <p className="mt-2 text-default">
            Crie sua conta e aproveite os melhores restaurantes da cidade.
          </p>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card>
            <CardHeader className="space-y-0">
              <CardTitle>Criar uma conta</CardTitle>
              <CardDescription>
                Entre com seu email abaixo para criar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70" />
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Digite seu nome completo"
                    className="pl-10"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70" />
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Senha"
                    className="pl-10"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70" />
                  <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirmar senha"
                    className="pl-10"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button disabled={isLoading} onClick={handleSubmit}>
                Criar conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Separator />
              <div className="text-center text-sm">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-primary underline">
                  Faça login
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
