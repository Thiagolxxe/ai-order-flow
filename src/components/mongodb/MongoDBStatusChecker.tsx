
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
  const [serverDetailedError, setServerDetailedError] = useState<string | null>(null);
  const [corsError, setCorsError] = useState<boolean>(false);

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
      setServerDetailedError(null);
      setCorsError(false);
      
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
      setServerDetailedError(null);
      setCorsError(false);
      
      const apiUrl = apiConfig.endpoints.system.healthCheck;
      addLog(`Tentando conectar à API em: ${apiUrl}`);
      
      // Try both with CORS and no-cors mode
      try {
        // First try with normal CORS mode
        const { data, error, status } = await httpClient.get(apiConfig.endpoints.system.healthCheck, { 
          timeout: 8000,
          mode: 'cors'
        });
        
        if (error) {
          throw new Error(`Erro ao verificar API: ${error.message}`);
        }
        
        addLog(`API respondeu com status ${status}. Resposta: ${JSON.stringify(data)}`);
        
        // Check if the response contains detailed error information
        if (data && data.error) {
          setServerDetailedError(typeof data.error === 'string' ? 
            data.error : JSON.stringify(data.error, null, 2));
        }
        
        if (data && data.details) {
          setServerDetailedError(typeof data.details === 'string' ? 
            data.details : JSON.stringify(data.details, null, 2));
        }
        
        setApiStatus('connected');
        toast.success('Conexão com API estabelecida com sucesso!');
      } catch (corsErr: any) {
        // If CORS mode fails, try with no-cors as a diagnostic step
        addLog(`Falha no modo CORS, tentando no-cors como diagnóstico`, 'warning');
        
        // Check if the error is a CORS error
        if (corsErr.message?.includes('Failed to fetch') || 
            corsErr.message?.includes('NetworkError') ||
            corsErr.message?.includes('CORS')) {
          
          setCorsError(true);
          addLog(`Erro de CORS detectado ao acessar ${apiConfig.baseURL}`, 'error');
          
          // Try a no-cors request just to check if the server is up
          try {
            const noCorsResponse = await fetch(`${apiConfig.baseURL}`, {
              method: 'HEAD',
              mode: 'no-cors'
            });
            
            // If we get here, the server is responding but has CORS issues
            addLog(`Servidor está ativo mas tem configurações de CORS incorretas`, 'warning');
            setServerDetailedError(`O servidor em ${apiConfig.baseURL} está respondendo, mas há um problema de CORS. 
O servidor precisa permitir requisições da origem: ${window.location.origin}
            
Adicione a seguinte configuração no servidor:
res.header('Access-Control-Allow-Origin', '${window.location.origin}');
res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');`);
            
            throw new Error(`Erro de CORS: O servidor não permite requisições da origem ${window.location.origin}`);
          } catch (noCorsErr) {
            // If this also fails, the server might be completely down
            addLog(`Servidor não responde nem mesmo a requisições no-cors`, 'error');
            throw corsErr; // Re-throw the original error
          }
        } else {
          // Not a CORS error, re-throw
          throw corsErr;
        }
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Falha na conexão com a API';
      addLog(`Erro ao conectar à API: ${errorMessage}`, 'error');
      
      // Detalhamento adicional do erro
      if (err.message?.includes('timeout') || err.message?.includes('excedeu o tempo limite')) {
        addLog(`A API ${apiConfig.baseURL} não respondeu no tempo esperado. O servidor pode estar inativo ou sobrecarregado.`, 'warning');
      } else if (err.message?.includes('Failed to fetch')) {
        addLog(`Não foi possível estabelecer conexão com ${apiConfig.baseURL}. Verifique se o serviço Render está ativo.`, 'warning');
      } else if (err.message?.includes('CORS')) {
        addLog(`Erro de CORS ao acessar ${apiConfig.baseURL}. O servidor precisa permitir requisições da origem: ${window.location.origin}`, 'warning');
        setCorsError(true);
      }
      
      // Try to extract detailed error from the error object if available
      try {
        if (err.response && err.response.data) {
          const responseData = err.response.data;
          if (responseData.error || responseData.details) {
            const detailedError = responseData.error || responseData.details;
            setServerDetailedError(typeof detailedError === 'string' ? 
              detailedError : JSON.stringify(detailedError, null, 2));
          }
        }
      } catch (parseError) {
        console.error('Erro ao analisar detalhes do erro:', parseError);
      }
      
      console.error('Erro ao conectar à API:', err);
      setApiStatus('error');
      setApiError(errorMessage);
    }
  };
  
  // Check if CORS issue is coming from a local development to production server
  const isLocalToProdCors = () => {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' || 
           window.location.hostname.includes('.lovable.dev') ||
           window.location.hostname.includes('.lovable.app');
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

  // CORS error information display
  const CorsErrorInfo = () => {
    if (!corsError) return null;
    
    return (
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-amber-800 mb-2">Erro de CORS Detectado</h3>
        <div className="bg-white p-3 rounded text-xs font-mono overflow-x-auto max-h-80 overflow-y-auto border border-amber-100 whitespace-pre-wrap text-amber-700">
          <p className="mb-2"><strong>Problema:</strong> O navegador está bloqueando requisições cross-origin para o servidor.</p>
          <p className="mb-2"><strong>Origem atual:</strong> {window.location.origin}</p>
          <p className="mb-2"><strong>Servidor de destino:</strong> {apiConfig.baseURL}</p>
          
          <p className="mb-4"><strong>Solução:</strong> O servidor precisa ser configurado para permitir requisições CORS da origem {window.location.origin}</p>
          
          <p className="font-bold mb-1">Adicione no servidor Express:</p>
          <code className="block bg-gray-50 p-2 rounded mb-3">
            {`app.use(cors({
  origin: '${window.location.origin}',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));`}
          </code>
          
          {isLocalToProdCors() && (
            <div className="bg-yellow-50 p-2 rounded border border-yellow-100 mt-2">
              <p><strong>Nota:</strong> Você está tentando acessar um servidor de produção a partir de uma origem de desenvolvimento.
              Para testes locais, configure seu servidor para aceitar todas as origens temporariamente:</p>
              <code className="block bg-gray-50 p-2 rounded mt-1">
                {`app.use(cors({ origin: '*' }));`}
              </code>
              <p className="mt-1 text-red-600 font-bold">Atenção: Use '*' apenas em desenvolvimento!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

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
      
      {/* CORS Error Information */}
      <CorsErrorInfo />
      
      {/* Server Detailed Error */}
      {serverDetailedError && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800 mb-2">Erro detalhado do servidor:</h3>
          <pre className="bg-white p-3 rounded text-xs font-mono overflow-x-auto max-h-60 overflow-y-auto border border-red-100 whitespace-pre-wrap text-red-700">
            {serverDetailedError}
          </pre>
        </div>
      )}
      
      {/* Diagnostic Information */}
      <ConnectionDiagnostics 
        mongoStatus={status} 
        apiStatus={apiStatus}
        corsError={corsError}
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
