
import React from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/apiConfig';

interface APIStatusAlertProps {
  status: 'idle' | 'checking' | 'connected' | 'error';
  error: string | null;
  onRetry: () => void;
}

export const APIStatusAlert: React.FC<APIStatusAlertProps> = ({
  status,
  error,
  onRetry
}) => {
  if (status === 'idle') return null;

  return (
    <Alert variant={status === 'connected' ? 'default' : status === 'checking' ? 'default' : 'destructive'}>
      <div className="flex items-center">
        {status === 'checking' && (
          <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
        )}
        {status === 'connected' && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
        {status === 'error' && <AlertCircle className="h-4 w-4 mr-2" />}
        <div className="flex-1">
          <AlertTitle>
            {status === 'checking' && 'Verificando conexão com o servidor da API...'}
            {status === 'connected' && 'Conexão com o servidor da API estabelecida'}
            {status === 'error' && 'Erro de conexão com o servidor da API'}
          </AlertTitle>
          <AlertDescription>
            {status === 'checking' && 'Aguarde enquanto verificamos a conexão com o servidor...'}
            {status === 'connected' && 'Seu aplicativo está conectado com sucesso ao servidor da API.'}
            {status === 'error' && (
              <div>
                <p className="mb-2">{error || 'Não foi possível conectar ao servidor da API'}</p>
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
                  onClick={onRetry}
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
  );
};
