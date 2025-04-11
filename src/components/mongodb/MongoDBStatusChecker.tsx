
import React, { useEffect, useState } from 'react';
import { connectToDatabase, getConnectionStatus } from '@/integrations/mongodb/client';
import { toast } from 'sonner';
import { Database, AlertCircle, CheckCircle, Server, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export const MongoDBStatusChecker: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      setStatus('connecting');
      setError(null);
      
      // Tenta conectar ao MongoDB Atlas
      await connectToDatabase();
      
      // Se chegou aqui, a conexão foi bem-sucedida
      setStatus('connected');
      toast.success('Conexão com MongoDB Atlas estabelecida com sucesso!');
      
      // Agora vamos verificar a conexão com a API
      checkApiConnection();
    } catch (err: any) {
      console.error('Erro ao conectar ao MongoDB Atlas:', err);
      setStatus('error');
      setError(err.message || 'Falha na conexão com MongoDB Atlas');
      toast.error('Falha ao conectar ao MongoDB Atlas. Verifique as configurações.');
    }
  };
  
  const checkApiConnection = async () => {
    try {
      setApiStatus('checking');
      setApiError(null);
      
      // Tenta conectar à API local
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/check-connection`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(error => {
        throw new Error('Não foi possível conectar ao servidor da API. Verifique se o servidor está em execução.');
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao verificar API: ${response.status} ${response.statusText}`);
      }
      
      setApiStatus('connected');
    } catch (err: any) {
      console.error('Erro ao conectar à API:', err);
      setApiStatus('error');
      setApiError(err.message || 'Falha na conexão com a API');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (status === 'idle') return null;

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      {/* MongoDB Status */}
      <Alert variant={status === 'connected' ? 'default' : status === 'connecting' ? 'default' : 'destructive'}>
        <div className="flex items-center">
          {status === 'connecting' && (
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          )}
          {status === 'connected' && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
          {status === 'error' && <AlertCircle className="h-4 w-4 mr-2" />}
          <div className="flex-1">
            <AlertTitle>
              {status === 'connecting' && 'Verificando conexão com MongoDB Atlas...'}
              {status === 'connected' && 'Conexão com MongoDB Atlas estabelecida'}
              {status === 'error' && 'Erro de conexão com MongoDB Atlas'}
            </AlertTitle>
            <AlertDescription>
              {status === 'connecting' && 'Aguarde enquanto verificamos a conexão com o cluster...'}
              {status === 'connected' && 'Seu aplicativo está conectado com sucesso ao MongoDB Atlas.'}
              {status === 'error' && (
                <div>
                  <p className="mb-2">{error || 'Não foi possível conectar ao MongoDB Atlas'}</p>
                  <p className="text-sm mb-2">
                    Verifique se as credenciais estão corretas e se o IP do seu dispositivo está na lista de permissão do Atlas.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={checkConnection}
                    className="mt-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Tentar novamente
                  </Button>
                </div>
              )}
            </AlertDescription>
          </div>
        </div>
      </Alert>
      
      {/* API Server Status */}
      {(apiStatus !== 'idle') && (
        <Alert variant={apiStatus === 'connected' ? 'default' : apiStatus === 'checking' ? 'default' : 'destructive'}>
          <div className="flex items-center">
            {apiStatus === 'checking' && (
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            )}
            {apiStatus === 'connected' && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
            {apiStatus === 'error' && <AlertCircle className="h-4 w-4 mr-2" />}
            <div className="flex-1">
              <AlertTitle>
                {apiStatus === 'checking' && 'Verificando conexão com o servidor da API...'}
                {apiStatus === 'connected' && 'Conexão com o servidor da API estabelecida'}
                {apiStatus === 'error' && 'Erro de conexão com o servidor da API'}
              </AlertTitle>
              <AlertDescription>
                {apiStatus === 'checking' && 'Aguarde enquanto verificamos a conexão com o servidor...'}
                {apiStatus === 'connected' && 'Seu aplicativo está conectado com sucesso ao servidor da API.'}
                {apiStatus === 'error' && (
                  <div>
                    <p className="mb-2">{apiError || 'Não foi possível conectar ao servidor da API'}</p>
                    <p className="text-sm mb-2">
                      O aplicativo não consegue se conectar ao servidor da API. 
                      Verifique se o servidor está em execução na porta 5000 ou configure a URL correta.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-800 mt-2">
                      <p><strong>Nota:</strong> Para autenticação e outras operações do servidor, será usado o modo de demonstração com dados simulados.</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={checkApiConnection}
                      className="mt-2"
                    >
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Tentar novamente
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}
      
      {/* Informações adicionais quando ambos falharem */}
      {status === 'error' && apiStatus === 'error' && (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <Database className="h-4 w-4 text-blue-600 mr-2" />
          <AlertTitle className="text-blue-700">Informações de depuração</AlertTitle>
          <AlertDescription className="text-blue-600">
            <p className="mb-2">O aplicativo está enfrentando problemas de conexão com o MongoDB Atlas e com o servidor da API.</p>
            <p className="text-sm">
              Para autenticação, o aplicativo usará o modo de demonstração. As operações de banco de dados
              serão simuladas localmente. O aplicativo funcionará, mas com funcionalidade limitada.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MongoDBStatusChecker;
