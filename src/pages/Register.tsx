
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeftIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setIsAuthenticated, setUserRole } = useUser();
  const navigate = useNavigate();
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (!termsAccepted) {
      toast.error('Você precisa aceitar os termos de uso');
      return;
    }
    
    setIsLoading(true);
    
    // Simulação de cadastro
    setTimeout(() => {
      setIsLoading(false);
      setIsAuthenticated(true);
      setUserRole('customer');
      toast.success('Cadastro realizado com sucesso!');
      navigate('/');
    }, 1500);
  };
  
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link to="/">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
            </Button>
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
          </div>
          <CardDescription>
            Preencha os campos abaixo para se cadastrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input 
                id="name"
                placeholder="Digite seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha forte"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input 
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => 
                  setTermsAccepted(checked as boolean)
                }
              />
              <Label 
                htmlFor="terms" 
                className="text-sm text-muted-foreground font-normal"
              >
                Concordo com os{' '}
                <Link 
                  to="/termos" 
                  className="text-primary underline hover:text-primary/80"
                >
                  Termos de Uso
                </Link>{' '}
                e{' '}
                <Link 
                  to="/privacidade" 
                  className="text-primary underline hover:text-primary/80"
                >
                  Política de Privacidade
                </Link>
              </Label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
