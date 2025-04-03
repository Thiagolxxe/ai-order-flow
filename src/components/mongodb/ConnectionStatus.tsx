
import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { httpClient } from '@/utils/httpClient';
import { apiConfig } from '@/config/apiConfig';

const MongoDBConnectionStatus = () => {
  const [connectionError, setConnectionError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await httpClient.get(apiConfig.endpoints.connection);
        
        if (error || !data?.success) {
          throw new Error(error?.message || data?.error || 'Falha na conexão com o MongoDB');
        }
        
        console.log('MongoDB connection successful');
        setConnectionError(false);
      } catch (error) {
        console.error('MongoDB connection error:', error);
        setConnectionError(true);
        toast.error('Erro de conexão com o MongoDB');
      } finally {
        setChecking(false);
      }
    };

    checkConnection();
    
    // Verificar conexão a cada 30 segundos
    const intervalId = setInterval(checkConnection, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (checking || !connectionError) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Problema de conexão</AlertTitle>
        <AlertDescription>
          Não foi possível conectar ao MongoDB. Verifique se o servidor backend está rodando e se as credenciais do MongoDB estão corretas.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MongoDBConnectionStatus;
