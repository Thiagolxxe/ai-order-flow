
import React from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface MongoDBStatusAlertProps {
  status: 'idle' | 'connecting' | 'connected' | 'error';
  error: string | null;
  onRetry: () => void;
}

export const MongoDBStatusAlert: React.FC<MongoDBStatusAlertProps> = ({
  status,
  error,
  onRetry
}) => {
  if (status === 'idle') return null;

  return (
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
