
import React, { useEffect, useState } from 'react';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { toast } from 'sonner';
import { httpClient } from '@/utils/httpClient';
import { apiConfig } from '@/config/apiConfig';
import { MongoDBStatusAlert } from './MongoDBStatusAlert';
import { APIStatusAlert } from './APIStatusAlert';
import { ConnectionDiagnostics } from './ConnectionDiagnostics';

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
      console.log(`Tentando conectar à API em: ${apiConfig.endpoints.system.healthCheck}`);
      
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
      {/* MongoDB Status Alert */}
      <MongoDBStatusAlert 
        status={status} 
        error={error} 
        onRetry={checkConnection} 
      />
      
      {/* API Server Status Alert */}
      <APIStatusAlert 
        status={apiStatus} 
        error={apiError} 
        onRetry={checkApiConnection} 
      />
      
      {/* Diagnostic Information */}
      <ConnectionDiagnostics 
        mongoStatus={status} 
        apiStatus={apiStatus} 
      />
    </div>
  );
};

export default MongoDBStatusChecker;
