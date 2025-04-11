
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Info, Database } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { API_BASE_URL } from '@/config/apiConfig';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<boolean>(false);
  const [mongodbStatus, setMongodbStatus] = useState<'connecting' | 'connected' | 'error' | null>(null);
  
  const { signIn, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  // Test MongoDB Atlas connection on component mount
  useEffect(() => {
    const testMongoDBConnection = async () => {
      setMongodbStatus('connecting');
      try {
        await connectToDatabase();
        setMongodbStatus('connected');
        console.log('MongoDB Atlas connection verified successfully');
      } catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error);
        setMongodbStatus('error');
      }
    };
    
    testMongoDBConnection();
  }, []);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setApiError(false);
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      // Test MongoDB connection before attempting to authenticate
      try {
        await connectToDatabase();
        console.log('MongoDB Atlas connection verified before authentication');
      } catch (connectionError) {
        console.error('Failed to connect to MongoDB Atlas:', connectionError);
        setApiError(true);
        throw new Error('Não foi possível conectar ao MongoDB Atlas. Verifique sua conexão com a internet.');
      }

      // Authenticate with MongoDB and Render backend
      const { error } = await signIn(email, password);
      
      if (error) {
        // Check for connection error
        if (error.message?.includes('Failed to fetch') || 
            error.message?.includes('connection') ||
            error.message?.includes('ERR_CONNECTION_REFUSED') ||
            error.message?.includes('ECONNREFUSED') ||
            error.message?.includes('NetworkError')) {
          setApiError(true);
          throw new Error(`Não foi possível conectar ao servidor ${API_BASE_URL}. Verifique se o serviço no Render está ativo.`);
        }
        throw new Error(error.message || 'Credenciais inválidas');
      }
      
      toast.success('Login realizado com sucesso');
      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação');
      toast.error(err.message || 'Falha na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Entre com seu e-mail e senha para acessar sua conta
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            
            {apiError && (
              <Alert variant="destructive" className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  O servidor não está respondendo. Verifique se o serviço no Render está ativo em: {API_BASE_URL}
                </AlertDescription>
              </Alert>
            )}
            
            {mongodbStatus === 'connecting' && (
              <Alert className="mb-4 bg-yellow-100 border-yellow-200">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
                <AlertTitle className="text-yellow-700">Verificando conexão</AlertTitle>
                <AlertDescription className="text-yellow-600">
                  Verificando conexão com MongoDB Atlas...
                </AlertDescription>
              </Alert>
            )}
            
            {mongodbStatus === 'error' && (
              <Alert variant="destructive" className="mb-4">
                <Database className="h-4 w-4" />
                <AlertTitle>Erro de conexão</AlertTitle>
                <AlertDescription>
                  Não foi possível conectar ao MongoDB Atlas. Verifique sua conexão com a internet e configurações do cluster.
                </AlertDescription>
              </Alert>
            )}
            
            {mongodbStatus === 'connected' && (
              <Alert className="mb-4 bg-green-100 border-green-200">
                <Database className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-700">MongoDB Atlas</AlertTitle>
                <AlertDescription className="text-green-600">
                  Conectado com sucesso ao MongoDB Atlas
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || mongodbStatus === 'connecting' || mongodbStatus === 'error'}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
            
            <div className="text-center text-sm">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Registre-se
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
