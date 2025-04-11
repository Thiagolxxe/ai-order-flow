
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
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);

  const addLog = (message: string, type: 'info' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} ${type}: ${message}`;
    console.log(logMessage);
    setConnectionLogs(prev => [...prev, logMessage]);
  };

  const checkConnection = async () => {
    try {
      setStatus('connecting');
      setError(null);
      
      addLog('Iniciando verificação de conexão com MongoDB Atlas');
      
      // Try to connect to MongoDB Atlas
      await connectToDatabase();
      
      // If we got here, the connection was successful
      setStatus('connected');
      addLog('Conexão com MongoDB Atlas estabelecida com sucesso!');
      toast.success('Conexão com MongoDB Atlas estabelecida com sucesso!');
      
      // Now check the API connection
      checkApiConnection();
    } catch (err: any) {
      const errorMessage = err.message || 'Falha na conexão com MongoDB Atlas';
      addLog(`Erro ao conectar ao MongoDB Atlas: ${errorMessage}`, 'error');
      console.error('Erro ao conectar ao MongoDB Atlas:', err);
      setStatus('error');
      setError(errorMessage);
      toast.error('Falha ao conectar ao MongoDB Atlas. Verifique as configurações.');
    }
  };
  
  const checkApiConnection = async () => {
    try {
      setApiStatus('checking');
      setApiError(null);
      
      const apiUrl = apiConfig.endpoints.system.healthCheck;
      addLog(`Tentando conectar à API em: ${apiUrl}`);
      
      // Try connecting with a shorter timeout for faster feedback
      const { data, error, status } = await httpClient.get(apiConfig.endpoints.system.healthCheck, { timeout: 8000 });
      
      if (error) {
        throw new Error(`Erro ao verificar API: ${error.message}`);
      }
      
      addLog(`API respondeu com status ${status}. Resposta: ${JSON.stringify(data)}`);
      
      setApiStatus('connected');
      toast.success('Conexão com API estabelecida com sucesso!');
    } catch (err: any) {
      const errorMessage = err.message || 'Falha na conexão com a API';
      addLog(`Erro ao conectar à API: ${errorMessage}`, 'error');
      
      // Detalhamento adicional do erro
      if (err.message?.includes('timeout') || err.message?.includes('excedeu o tempo limite')) {
        addLog(`A API ${apiConfig.baseURL} não respondeu no tempo esperado. O servidor pode estar inativo ou sobrecarregado.`, 'warning');
      } else if (err.message?.includes('Failed to fetch')) {
        addLog(`Não foi possível estabelecer conexão com ${apiConfig.baseURL}. Verifique se o serviço Render está ativo.`, 'warning');
      }
      
      console.error('Erro ao conectar à API:', err);
      setApiStatus('error');
      setApiError(errorMessage);
    }
  };

  useEffect(() => {
    addLog('Componente MongoDBStatusChecker inicializado');
    checkConnection();
    
    // Adicionar verificação periódica a cada 2 minutos
    const interval = setInterval(() => {
      addLog('Executando verificação periódica de conexão');
      checkConnection();
    }, 120000);
    
    return () => {
      clearInterval(interval);
      addLog('Componente MongoDBStatusChecker desmontado');
    };
  }, []);

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
      
      {/* Connection Logs */}
      {connectionLogs.length > 0 && (
        <div className="mt-4 border border-gray-200 rounded-md">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-medium">Logs de Conexão</h3>
            <button 
              onClick={() => navigator.clipboard.writeText(connectionLogs.join('\n'))}
              className="text-xs text-blue-600 hover:underline"
            >
              Copiar logs
            </button>
          </div>
          <div className="bg-black text-green-400 p-2 rounded-b-md overflow-x-auto text-xs font-mono max-h-60 overflow-y-auto">
            {connectionLogs.map((log, i) => (
              <div key={i} className="whitespace-pre-wrap mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MongoDBStatusChecker;
