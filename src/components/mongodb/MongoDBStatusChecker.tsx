
import React, { useEffect, useState } from 'react';
import { connectToDatabase, getConnectionStatus } from '@/integrations/mongodb/client';
import { toast } from 'sonner';
import { Database, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export const MongoDBStatusChecker: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      setStatus('connecting');
      setError(null);
      
      // Tenta conectar ao MongoDB Atlas
      await connectToDatabase();
      
      // Se chegou aqui, a conexão foi bem-sucedida
      setStatus('connected');
      toast.success('Conexão com MongoDB Atlas estabelecida com sucesso!');
    } catch (err: any) {
      console.error('Erro ao conectar ao MongoDB Atlas:', err);
      setStatus('error');
      setError(err.message || 'Falha na conexão com MongoDB Atlas');
      toast.error('Falha ao conectar ao MongoDB Atlas. Verifique as configurações.');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (status === 'idle') return null;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Alert variant={status === 'connected' ? 'default' : status === 'connecting' ? 'default' : 'destructive'}>
        <div className="flex items-center">
          {status === 'connecting' && (
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          )}
          {status === 'connected' && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
          {status === 'error' && <AlertCircle className="h-4 w-4 mr-2" />}
          <div>
            <AlertTitle>
              {status === 'connecting' && 'Verificando conexão com MongoDB Atlas...'}
              {status === 'connected' && 'Conexão estabelecida'}
              {status === 'error' && 'Erro de conexão'}
            </AlertTitle>
            <AlertDescription>
              {status === 'connecting' && 'Aguarde enquanto verificamos a conexão com o cluster...'}
              {status === 'connected' && 'Seu aplicativo está conectado com sucesso ao MongoDB Atlas.'}
              {status === 'error' && (
                <div>
                  <p className="mb-2">{error || 'Não foi possível conectar ao MongoDB Atlas'}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={checkConnection}
                    className="mt-2"
                  >
                    Tentar novamente
                  </Button>
                </div>
              )}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default MongoDBStatusChecker;
