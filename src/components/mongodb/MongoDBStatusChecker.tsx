
import React, { useEffect, useState } from 'react';
import { connectToDatabase, getConnectionStatus } from '@/integrations/mongodb/client';
import { toast } from 'sonner';
import { Database, AlertCircle, CheckCircle, Server, RefreshCw, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { API_BASE_URL, apiConfig } from '@/config/apiConfig';
import { httpClient } from '@/utils/httpClient';

export const MongoDBStatusChecker: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      setStatus('connecting');
      setError(null);
      
      // Try to connect to MongoDB Atlas
      await connectToDatabase();
      
      // If we got here, the connection was successful
      setStatus('connected');
      toast.success('Conexão com MongoDB Atlas estabelecida com sucesso!');
      
      // Now check the API connection
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
      
      // Try to connect to the API on Render
      const apiUrl = `${API_BASE_URL}${apiConfig.endpoints.system.healthCheck}`;
      console.log(`Tentando conectar à API em: ${apiUrl}`);
      
      // Use our httpClient to properly handle errors
      const { data, error } = await httpClient.get(apiConfig.endpoints.system.healthCheck);
      
      if (error) {
        throw new Error(`Erro ao verificar API: ${error.message}`);
      }
      
      setApiStatus('connected');
      toast.success('Conexão com API estabelecida com sucesso!');
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
                      O aplicativo não consegue se conectar ao servidor da API ({API_BASE_URL}).
                      <strong> Este é o motivo do erro "Cannot connect to the server" no login.</strong>
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-800 mt-2">
                      <p><strong>Nota:</strong> Verifique o status do seu serviço no Render:</p>
                      <ul className="list-disc pl-5 mt-1">
                        <li>Confirme que seu servidor Express está rodando no Render</li>
                        <li>Verifique se a URL configurada está correta: {API_BASE_URL}</li>
                        <li>Se a API estiver indisponível, o modo de demonstração será usado</li>
                      </ul>
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
      
      {/* Additional information when MongoDB connected but API failed */}
      {status === 'connected' && apiStatus === 'error' && (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <Database className="h-4 w-4 text-blue-600 mr-2" />
          <AlertTitle className="text-blue-700">Diagnóstico do problema</AlertTitle>
          <AlertDescription className="text-blue-600">
            <p className="mb-2">A conexão com MongoDB Atlas foi bem-sucedida, mas o servidor API no Render não está disponível.</p>
            <p className="text-sm mb-2">
              O erro <strong>"Cannot connect to the server"</strong> na tela de login ocorre porque a aplicação está tentando
              autenticar através do servidor API no Render ({API_BASE_URL}), mas este servidor não está respondendo.
            </p>
            <div className="bg-white/50 border border-blue-100 rounded p-2 text-sm mt-2">
              <p className="font-medium">Soluções possíveis:</p>
              <ol className="list-decimal pl-5 mt-1">
                <li>Verifique se o serviço no Render está ativo e funcionando</li>
                <li>Configure a variável de ambiente <code>VITE_API_URL</code> com a URL correta do seu backend</li>
                <li>Utilize o modo de demonstração com dados simulados (já configurado como fallback)</li>
              </ol>
            </div>
            <div className="mt-3 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
                onClick={() => window.location.href = '/login'}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Voltar ao login
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Additional information when both failed */}
      {status === 'error' && apiStatus === 'error' && (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <Database className="h-4 w-4 text-blue-600 mr-2" />
          <AlertTitle className="text-blue-700">Informações de depuração</AlertTitle>
          <AlertDescription className="text-blue-600">
            <p className="mb-2">O aplicativo está enfrentando problemas de conexão com o MongoDB Atlas e com o servidor da API no Render.</p>
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
