
import React, { useEffect, useState } from 'react';
import { AlertTriangle, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { checkMongoDBConnection } from '@/integrations/mongodb/client';

const MongoDBConnectionStatus = () => {
  const [connectionError, setConnectionError] = useState(false);
  const [checking, setChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setChecking(true);
        const isConnected = await checkMongoDBConnection();
        
        if (!isConnected) {
          throw new Error('Falha na conexão com o MongoDB');
        }
        
        if (connectionError) {
          // Exibir mensagem apenas se estiver se recuperando de um erro anterior
          toast.success('Conexão com o MongoDB restaurada');
        }
        
        console.log('MongoDB connection successful');
        setConnectionError(false);
        setRetryCount(0);
      } catch (error) {
        console.error('MongoDB connection error:', error);
        setConnectionError(true);
        
        // Mostrar toast apenas na primeira falha ou a cada 5 tentativas
        if (retryCount === 0 || retryCount % 5 === 0) {
          toast.error('Erro de conexão com o MongoDB. Verifique se o servidor está rodando.');
        }
        
        setRetryCount(prev => prev + 1);
      } finally {
        setChecking(false);
      }
    };

    checkConnection();
    
    // Verificar conexão a cada 30 segundos
    const intervalId = setInterval(checkConnection, 30000);
    
    return () => clearInterval(intervalId);
  }, [connectionError, retryCount]);

  if (checking || !connectionError) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
      <Alert variant="destructive">
        <WifiOff className="h-4 w-4" />
        <AlertTitle>Problema de conexão</AlertTitle>
        <AlertDescription>
          Não foi possível conectar ao servidor MongoDB. Verifique se o servidor backend está rodando e se as credenciais do MongoDB estão corretas.
          {retryCount > 1 && (
            <div className="mt-2 text-sm">
              Tentando reconectar... ({retryCount} tentativas)
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MongoDBConnectionStatus;
